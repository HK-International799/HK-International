import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Registration from "../models/Registration.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import emailService from "../services/emailService.js";
import auditService from "../services/auditService.js";
import notificationService from "../services/notificationService.js";

// ── Create User (student/tutor) ────────────────────────────────────────
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, mobile, role } = req.body;

  if (!name || !email || !mobile || !role) {
    throw new ApiError(400, "All fields are required");
  }
  if (!["student", "tutor"].includes(role)) {
    throw new ApiError(400, "Invalid role. Use student or tutor");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new ApiError(409, "User already exists with this email");

  const randomPassword = crypto.randomBytes(6).toString("hex");
  const passwordHash = await bcrypt.hash(randomPassword, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    mobile,
    passwordHash,
    role,
    isFirstLogin: true,
  });

  // Send welcome email (non-blocking)
  emailService.sendWelcomeEmail(email, randomPassword).catch((err) => {
    console.warn("Welcome email failed:", err.message);
  });

  await auditService.log({
    action: "CREATE_USER",
    entity: "User",
    entityId: user._id,
    performedBy: req.user._id,
    details: `Created ${role}: ${email}`,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: { user, credentials: { email, password: randomPassword } },
  });
});

// ── Enroll Student ─────────────────────────────────────────────────────
export const enrollStudent = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.body;

  const student = await User.findById(studentId);
  const course = await Course.findById(courseId);

  if (!student || !course) throw new ApiError(404, "Student or course not found");

  if (student.enrolledCourses.some((id) => id.toString() === courseId)) {
    throw new ApiError(400, "Student already enrolled in this course");
  }

  student.enrolledCourses.push(course._id);
  await student.save();

  await auditService.log({
    action: "ENROLL_STUDENT",
    entity: "User",
    entityId: student._id,
    performedBy: req.user._id,
    details: `Enrolled in course: ${course.title}`,
  });

  res.json({ success: true, message: "Student enrolled successfully", data: student });
});

// ── Admin Stats ────────────────────────────────────────────────────────
export const getAdminStats = asyncHandler(async (req, res) => {
  const [totalStudents, totalTutors, totalCourses, totalRegistrations] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "tutor" }),
    Course.countDocuments(),
    Registration.countDocuments(),
  ]);

  res.json({
    success: true,
    data: { totalStudents, totalTutors, totalCourses, totalRegistrations },
  });
});

// ── Recent Activity ────────────────────────────────────────────────────
export const getRecentActivity = asyncHandler(async (req, res) => {
  const { default: AuditLog } = await import("../models/AuditLog.js");
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("performedBy", "name email");

  res.json({ success: true, data: logs });
});

// ── Get All Users ──────────────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (role) filter.role = role;

  const users = await User.find(filter)
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await User.countDocuments(filter);

  res.json({ success: true, data: { users, total, page: Number(page), limit: Number(limit) } });
});

// ── Update User ────────────────────────────────────────────────────────
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowedFields = ["name", "email", "mobile", "avatar"];
  const updates = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select("-passwordHash");
  if (!user) throw new ApiError(404, "User not found");

  res.json({ success: true, data: user });
});

// ── Delete User ────────────────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  await auditService.log({
    action: "DELETE_USER",
    entity: "User",
    entityId: user._id,
    performedBy: req.user._id,
    details: `Deleted user: ${user.email}`,
  });

  res.json({ success: true, message: "User deleted" });
});

// ── Update User Role ───────────────────────────────────────────────────
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role) throw new ApiError(400, "Role is required");

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select("-passwordHash");

  if (!user) throw new ApiError(404, "User not found");

  res.json({ success: true, data: user });
});

// ── View All Registrations ─────────────────────────────────────────────
export const getAllRegistrations = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const registrations = await Registration.find(filter)
    .populate("student", "name email mobile")
    .populate("course", "title")
    .populate("partnerInstitute", "name code")
    .populate("processedBy", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await Registration.countDocuments(filter);

  res.json({ success: true, data: { registrations, total } });
});

// ── Approve / Reject Registration ──────────────────────────────────────
export const processRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be approved or rejected");
  }

  const registration = await Registration.findById(id)
    .populate("student", "name email")
    .populate("course", "title");

  if (!registration) throw new ApiError(404, "Registration not found");
  if (registration.status !== "pending") {
    throw new ApiError(400, `Registration already ${registration.status}`);
  }

  registration.status = status;
  registration.remarks = remarks || "";
  registration.processedBy = req.user._id;
  registration.processedAt = new Date();

  if (status === "approved") {
    registration.lmsAccessGranted = true;
    registration.lmsAccessGrantedAt = new Date();

    // Auto-enroll student
    await User.findByIdAndUpdate(registration.student._id, {
      $addToSet: { enrolledCourses: registration.course._id },
    });
  }

  await registration.save();

  // Notification
  await notificationService.create({
    userId: registration.student._id,
    type: "info",
    title: `Registration ${status}`,
    body: `Your registration for "${registration.course.title}" has been ${status}.`,
    referenceId: registration._id,
  });

  // Email (non-blocking)
  emailService
    .sendRegistrationStatusEmail(
      registration.student.email,
      registration.student.name,
      registration.course.title,
      status,
      remarks
    )
    .catch((err) => console.warn("Status email failed:", err.message));

  await auditService.log({
    action: `REGISTRATION_${status.toUpperCase()}`,
    entity: "Registration",
    entityId: registration._id,
    performedBy: req.user._id,
    details: `${status} registration for ${registration.student.email}`,
  });

  res.json({ success: true, message: `Registration ${status}`, data: registration });
});

// ── Export Registrations CSV ───────────────────────────────────────────
export const exportRegistrationsCSV = asyncHandler(async (req, res) => {
  const registrations = await Registration.find()
    .populate("student", "name email mobile")
    .populate("course", "title")
    .populate("partnerInstitute", "name code")
    .lean();

  const rows = registrations.map((r) => ({
    StudentName: r.student?.name || "",
    StudentEmail: r.student?.email || "",
    Mobile: r.student?.mobile || "",
    Course: r.course?.title || "",
    Institute: r.partnerInstitute?.name || "Direct",
    Status: r.status,
    LMSAccess: r.lmsAccessGranted ? "Yes" : "No",
    CreatedAt: r.createdAt?.toISOString() || "",
  }));

  if (rows.length === 0) {
    return res.json({ success: true, message: "No registrations found", data: [] });
  }

  const headers = Object.keys(rows[0]).join(",");
  const csv = [headers, ...rows.map((r) => Object.values(r).join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=registrations.csv");
  res.send(csv);
});
