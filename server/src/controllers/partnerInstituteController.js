import PartnerInstitute from "../models/PartnerInstitute.js";
import User from "../models/User.js";
import Registration from "../models/Registration.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import emailService from "../services/emailService.js";
import notificationService from "../services/notificationService.js";
import auditService from "../services/auditService.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

// ═══════════════════════════════════════════════════════════════════════
//  INSTITUTE REGISTRATION & AUTH
// ═══════════════════════════════════════════════════════════════════════

export const registerInstitute = asyncHandler(async (req, res) => {
  const { instituteName, code, email, phone, address, city, country, website, contactPersonName, contactPassword, contactMobile } = req.body;

  if (!instituteName || !code || !email || !contactPersonName || !contactPassword || !contactMobile) {
    throw new ApiError(400, "instituteName, code, email, contactPersonName, contactPassword, and contactMobile are required");
  }
  if (contactPassword.length < 8) throw new ApiError(400, "Password must be at least 8 characters");

  // Check uniqueness
  const existingInstitute = await PartnerInstitute.findOne({ $or: [{ code: code.toUpperCase() }, { email: email.toLowerCase() }] });
  if (existingInstitute) throw new ApiError(409, "Institute code or email already registered");

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new ApiError(409, "Email already in use");

  // Create user for institute
  const passwordHash = await bcrypt.hash(contactPassword, 10);
  const user = await User.create({
    name: contactPersonName,
    email: email.toLowerCase(),
    mobile: contactMobile,
    passwordHash,
    role: "partner_institute",
    isFirstLogin: false,
  });

  // Create institute
  const institute = await PartnerInstitute.create({
    name: instituteName,
    code: code.toUpperCase(),
    email: email.toLowerCase(),
    phone, address, city, country, website,
    primaryContact: user._id,
    status: "pending",
  });

  // Link user to institute
  user.partnerInstitute = institute._id;
  await user.save();

  await auditService.log({
    action: "REGISTER_INSTITUTE",
    entity: "PartnerInstitute",
    entityId: institute._id,
    performedBy: user._id,
    details: `Institute registered: ${instituteName} (${code})`,
  });

  res.status(201).json({
    success: true,
    message: "Institute registered. Awaiting admin approval.",
    data: { institute, user: { id: user._id, name: user.name, email: user.email } },
  });
});

export const loginInstitute = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  const user = await User.findOne({ email: email.toLowerCase(), role: "partner_institute" });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new ApiError(401, "Invalid credentials");

  const institute = await PartnerInstitute.findById(user.partnerInstitute);
  if (!institute || institute.status !== "approved") {
    throw new ApiError(403, "Institute is not yet approved or has been suspended");
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      institute: { id: institute._id, name: institute.name, code: institute.code, status: institute.status },
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════
//  ADMIN: MANAGE INSTITUTES
// ═══════════════════════════════════════════════════════════════════════

export const getAllInstitutes = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const institutes = await PartnerInstitute.find(filter)
    .populate("primaryContact", "name email mobile")
    .populate("approvedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: institutes });
});

export const getInstituteById = asyncHandler(async (req, res) => {
  const institute = await PartnerInstitute.findById(req.params.id)
    .populate("primaryContact", "name email mobile");

  if (!institute) throw new ApiError(404, "Institute not found");

  // Count students under this institute
  const studentCount = await Registration.countDocuments({ partnerInstitute: institute._id });

  res.json({ success: true, data: { ...institute.toObject(), studentCount } });
});

export const approveRejectInstitute = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  if (!["approved", "rejected", "suspended"].includes(status)) {
    throw new ApiError(400, "Status must be approved, rejected, or suspended");
  }

  const institute = await PartnerInstitute.findById(req.params.id);
  if (!institute) throw new ApiError(404, "Institute not found");

  institute.status = status;
  institute.remarks = remarks || "";
  if (status === "approved") {
    institute.approvedBy = req.user._id;
    institute.approvedAt = new Date();
  }
  await institute.save();

  await auditService.log({
    action: `INSTITUTE_${status.toUpperCase()}`,
    entity: "PartnerInstitute",
    entityId: institute._id,
    performedBy: req.user._id,
    details: `Institute ${status}: ${institute.name}`,
  });

  res.json({ success: true, message: `Institute ${status}`, data: institute });
});

// ═══════════════════════════════════════════════════════════════════════
//  PARTNER: MANAGE STUDENTS
// ═══════════════════════════════════════════════════════════════════════

export const addStudent = asyncHandler(async (req, res) => {
  const { name, email, mobile } = req.body;
  if (!name || !email || !mobile) throw new ApiError(400, "name, email, mobile are required");

  const institute = await PartnerInstitute.findById(req.user.partnerInstitute);
  if (!institute || institute.status !== "approved") throw new ApiError(403, "Institute not approved");

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "User with this email already exists");

  const randomPassword = crypto.randomBytes(6).toString("hex");
  const passwordHash = await bcrypt.hash(randomPassword, 10);

  const student = await User.create({
    name, email: email.toLowerCase(), mobile, passwordHash,
    role: "student", isFirstLogin: true,
  });

  emailService.sendWelcomeEmail(email, randomPassword).catch((err) => console.warn("Email failed:", err.message));

  res.status(201).json({
    success: true,
    message: "Student created",
    data: { student: { id: student._id, name: student.name, email: student.email }, credentials: { email, password: randomPassword } },
  });
});

export const bulkUploadStudents = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "CSV file is required");

  const institute = await PartnerInstitute.findById(req.user.partnerInstitute);
  if (!institute || institute.status !== "approved") throw new ApiError(403, "Institute not approved");

  const results = [];
  await new Promise((resolve, reject) => {
    const readable = Readable.from(req.file.buffer.toString());
    readable.pipe(csvParser()).on("data", (row) => results.push(row)).on("end", resolve).on("error", reject);
  });

  const created = [];
  const errors = [];

  for (const row of results) {
    const name = (row.name || row.Name || "").trim();
    const email = (row.email || row.Email || "").trim().toLowerCase();
    const mobile = (row.mobile || row.Mobile || row.phone || row.Phone || "").trim();

    if (!name || !email || !mobile) { errors.push(`Missing fields for row: ${JSON.stringify(row)}`); continue; }

    const existing = await User.findOne({ email });
    if (existing) { errors.push(`Already exists: ${email}`); continue; }

    const randomPassword = crypto.randomBytes(6).toString("hex");
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const student = await User.create({ name, email, mobile, passwordHash, role: "student", isFirstLogin: true });
    created.push({ id: student._id, name, email, password: randomPassword });

    emailService.sendWelcomeEmail(email, randomPassword).catch(() => {});
  }

  res.json({
    success: true,
    message: `${created.length} students created, ${errors.length} errors`,
    data: { created, errors },
  });
});

// ── Upload institute documents ─────────────────────────────────────────
export const uploadInstituteDocument = asyncHandler(async (req, res) => {
  const { title, fileUrl } = req.body;
  if (!title || !fileUrl) throw new ApiError(400, "title and fileUrl are required");

  const institute = await PartnerInstitute.findById(req.user.partnerInstitute);
  if (!institute) throw new ApiError(404, "Institute not found");

  institute.documents.push({ title, fileUrl, uploadedAt: new Date() });
  await institute.save();

  res.json({ success: true, message: "Document uploaded", data: institute.documents });
});

// ── Create Registration ────────────────────────────────────────────────
export const createRegistration = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.body;
  if (!studentId || !courseId) throw new ApiError(400, "studentId and courseId are required");

  const institute = await PartnerInstitute.findById(req.user.partnerInstitute);
  if (!institute || institute.status !== "approved") throw new ApiError(403, "Institute not approved");

  const existing = await Registration.findOne({ student: studentId, course: courseId });
  if (existing) throw new ApiError(409, "Registration already exists for this student/course");

  const registration = await Registration.create({
    student: studentId,
    course: courseId,
    partnerInstitute: institute._id,
    status: "pending",
  });

  // Notify admins
  const admins = await User.find({ role: { $in: ["admin", "super_admin"] } }).select("_id").lean();
  await notificationService.createBulk(
    admins.map((a) => a._id),
    { type: "registration", title: "New Registration", body: `New registration from ${institute.name}`, referenceId: registration._id }
  );

  // Email student
  const student = await User.findById(studentId);
  const { default: Course } = await import("../models/Course.js");
  const course = await Course.findById(courseId);
  if (student && course) {
    emailService.sendRegistrationCreatedEmail(student.email, student.name, course.title).catch(() => {});
  }

  res.status(201).json({ success: true, message: "Registration created", data: registration });
});

// ── Track registrations (institute view) ───────────────────────────────
export const getInstituteRegistrations = asyncHandler(async (req, res) => {
  const institute = await PartnerInstitute.findById(req.user.partnerInstitute);
  if (!institute) throw new ApiError(404, "Institute not found");

  const { status } = req.query;
  const filter = { partnerInstitute: institute._id };
  if (status) filter.status = status;

  const registrations = await Registration.find(filter)
    .populate("student", "name email mobile")
    .populate("course", "title")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: registrations });
});

// ── Institute dashboard ────────────────────────────────────────────────
export const getInstituteDashboard = asyncHandler(async (req, res) => {
  const institute = await PartnerInstitute.findById(req.user.partnerInstitute);
  if (!institute) throw new ApiError(404, "Institute not found");

  const [totalRegistrations, pending, approved, rejected] = await Promise.all([
    Registration.countDocuments({ partnerInstitute: institute._id }),
    Registration.countDocuments({ partnerInstitute: institute._id, status: "pending" }),
    Registration.countDocuments({ partnerInstitute: institute._id, status: "approved" }),
    Registration.countDocuments({ partnerInstitute: institute._id, status: "rejected" }),
  ]);

  res.json({
    success: true,
    data: { institute: { name: institute.name, code: institute.code, status: institute.status }, stats: { totalRegistrations, pending, approved, rejected } },
  });
});
