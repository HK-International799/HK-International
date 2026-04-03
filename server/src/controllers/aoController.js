import AwardingOrganisation from "../models/AwardingOrganisation.js";
import Registration from "../models/Registration.js";
import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import AuditLog from "../models/AuditLog.js";
import QuizAttempt from "../models/QuizAttempt.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ═══════════════════════════════════════════════════════════════════════
//  ADMIN: MANAGE AOs
// ═══════════════════════════════════════════════════════════════════════

export const createAO = asyncHandler(async (req, res) => {
  const { name, code, email, phone, website, contactPersonName, contactPassword, contactMobile, courses } = req.body;

  if (!name || !code || !email || !contactPersonName || !contactPassword || !contactMobile) {
    throw new ApiError(400, "name, code, email, contactPersonName, contactPassword, contactMobile are required");
  }

  const existingAO = await AwardingOrganisation.findOne({ $or: [{ code: code.toUpperCase() }, { email: email.toLowerCase() }] });
  if (existingAO) throw new ApiError(409, "AO code or email already exists");

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new ApiError(409, "Email already in use");

  const passwordHash = await bcrypt.hash(contactPassword, 10);
  const user = await User.create({
    name: contactPersonName,
    email: email.toLowerCase(),
    mobile: contactMobile,
    passwordHash,
    role: "ao",
    isFirstLogin: false,
  });

  const ao = await AwardingOrganisation.create({
    name, code: code.toUpperCase(), email: email.toLowerCase(),
    phone, website,
    primaryContact: user._id,
    courses: courses || [],
  });

  user.awardingOrganisation = ao._id;
  await user.save();

  res.status(201).json({ success: true, message: "Awarding Organisation created", data: ao });
});

export const getAllAOs = asyncHandler(async (req, res) => {
  const aos = await AwardingOrganisation.find()
    .populate("primaryContact", "name email")
    .populate("courses", "title")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: aos });
});

export const getAOById = asyncHandler(async (req, res) => {
  const ao = await AwardingOrganisation.findById(req.params.id)
    .populate("primaryContact", "name email")
    .populate("courses", "title");

  if (!ao) throw new ApiError(404, "Awarding Organisation not found");
  res.json({ success: true, data: ao });
});

export const updateAO = asyncHandler(async (req, res) => {
  const ao = await AwardingOrganisation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!ao) throw new ApiError(404, "AO not found");
  res.json({ success: true, data: ao });
});

// ═══════════════════════════════════════════════════════════════════════
//  AO PORTAL (READ-ONLY)
// ═══════════════════════════════════════════════════════════════════════

export const loginAO = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  const user = await User.findOne({ email: email.toLowerCase(), role: "ao" });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new ApiError(401, "Invalid credentials");

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

  const ao = await AwardingOrganisation.findById(user.awardingOrganisation);

  res.json({
    success: true,
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      organisation: ao ? { id: ao._id, name: ao.name, code: ao.code } : null,
    },
  });
});

export const getAODashboard = asyncHandler(async (req, res) => {
  const ao = await AwardingOrganisation.findById(req.user.awardingOrganisation);
  if (!ao) throw new ApiError(404, "Awarding Organisation not found");

  const courseIds = ao.courses || [];

  const [totalStudents, totalRegistrations, totalCertificates, pendingRegistrations, registrationsByStatus] = await Promise.all([
    Registration.distinct("student", { course: { $in: courseIds } }).then((ids) => ids.length),
    Registration.countDocuments({ course: { $in: courseIds } }),
    Certificate.countDocuments({ courseId: { $in: courseIds } }),
    Registration.countDocuments({ course: { $in: courseIds }, status: "pending" }),
    Registration.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      organisation: { name: ao.name, code: ao.code },
      stats: { totalStudents, totalRegistrations, totalCertificates, pendingRegistrations, registrationsByStatus },
    },
  });
});

export const getAOStudentTracking = asyncHandler(async (req, res) => {
  const ao = await AwardingOrganisation.findById(req.user.awardingOrganisation);
  if (!ao) throw new ApiError(404, "AO not found");

  const { courseId, status, page = 1, limit = 50 } = req.query;
  const filter = { course: { $in: ao.courses || [] } };
  if (courseId) filter.course = courseId;
  if (status) filter.status = status;

  const registrations = await Registration.find(filter)
    .populate("student", "name email mobile")
    .populate("course", "title")
    .populate("partnerInstitute", "name code")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await Registration.countDocuments(filter);

  res.json({ success: true, data: { registrations, total, page: Number(page) } });
});

export const getAOAuditLogs = asyncHandler(async (req, res) => {
  const { entity, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (entity) filter.entity = entity;

  const logs = await AuditLog.find(filter)
    .populate("performedBy", "name email role")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await AuditLog.countDocuments(filter);

  res.json({ success: true, data: { logs, total, page: Number(page) } });
});

export const getAOReports = asyncHandler(async (req, res) => {
  const ao = await AwardingOrganisation.findById(req.user.awardingOrganisation);
  if (!ao) throw new ApiError(404, "AO not found");

  const courseIds = ao.courses || [];

  // Certificate report
  const certificates = await Certificate.find({ courseId: { $in: courseIds } })
    .populate("studentId", "name email")
    .populate("courseId", "title")
    .sort({ issuedAt: -1 })
    .limit(100)
    .lean();

  // Quiz performance per course
  const quizStats = await QuizAttempt.aggregate([
    { $lookup: { from: "quizzes", localField: "quizId", foreignField: "_id", as: "quiz" } },
    { $unwind: "$quiz" },
    { $match: { "quiz.courseId": { $in: courseIds } } },
    { $group: { _id: "$quiz.courseId", avgScore: { $avg: "$score" }, totalAttempts: { $sum: 1 }, passed: { $sum: { $cond: [{ $gte: ["$score", 50] }, 1, 0] } } } },
    { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    { $project: { courseName: "$course.title", avgScore: 1, totalAttempts: 1, passed: 1 } },
  ]);

  res.json({ success: true, data: { certificates, quizStats } });
});
