import Certificate from "../models/Certificate.js";
import Attendance from "../models/Attendance.js";
import QuizAttempt from "../models/QuizAttempt.js";
import OrientationSession from "../models/OrientationSession.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import generateCertificatePDF from "../services/certificateGenerator.js";

// ── Issue Certificate (with attendance + quiz gate) ────────────────────
export const issueCertificate = asyncHandler(async (req, res) => {
  const { studentId, courseId, title, grade, score, skipChecks } = req.body;

  if (!studentId || !courseId || !title) {
    throw new ApiError(400, "studentId, courseId, and title are required");
  }

  const student = await User.findById(studentId);
  if (!student) throw new ApiError(404, "Student not found");

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  // Check if certificate already exists
  const existing = await Certificate.findOne({ studentId, courseId });
  if (existing) throw new ApiError(409, "Certificate already issued for this student/course");

  // Gate: Orientation attendance + quiz pass (unless admin overrides)
  if (!skipChecks) {
    const sessions = await OrientationSession.find({ course: courseId }).select("_id passingScore quiz").lean();

    if (sessions.length > 0) {
      for (const session of sessions) {
        const attendance = await Attendance.findOne({
          orientationSession: session._id,
          student: studentId,
          status: "present",
        });
        if (!attendance) {
          throw new ApiError(400, `Student has not attended orientation session: ${session._id}`);
        }

        if (session.quiz) {
          const attempt = await QuizAttempt.findOne({
            quizId: session.quiz,
            studentId,
          });
          if (!attempt || attempt.score === null) {
            throw new ApiError(400, "Student has not completed the orientation quiz");
          }
          // Check passing score
          if (attempt.score < (session.passingScore || 50)) {
            throw new ApiError(400, `Student did not pass the orientation quiz. Score: ${attempt.score}%`);
          }
        }
      }
    }
  }

  const certNum = `CERT-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  const cert = await Certificate.create({
    studentId,
    courseId,
    certificateNumber: certNum,
    title,
    grade: grade || "",
    score: score || null,
    issuedBy: req.user._id,
  });

  res.status(201).json({ success: true, message: "Certificate issued", data: cert });
});

// ── Download Certificate PDF ───────────────────────────────────────────
export const downloadCertificatePDF = asyncHandler(async (req, res) => {
  const cert = await Certificate.findById(req.params.id)
    .populate("studentId", "name email")
    .populate("courseId", "title");

  if (!cert) throw new ApiError(404, "Certificate not found");
  if (cert.status === "revoked") throw new ApiError(400, "Certificate has been revoked");

  // Students can only download their own
  if (req.user.role === "student" && cert.studentId._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied");
  }

  const pdfBuffer = await generateCertificatePDF({
    studentName: cert.studentId.name,
    courseName: cert.courseId.title,
    certificateNumber: cert.certificateNumber,
    issuedDate: cert.issuedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    grade: cert.grade,
    score: cert.score,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=certificate-${cert.certificateNumber}.pdf`);
  res.send(pdfBuffer);
});

// ── Get All Certificates ───────────────────────────────────────────────
export const getAllCertificates = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "student") filter.studentId = req.user._id;

  const certs = await Certificate.find(filter)
    .populate("studentId", "name email avatar")
    .populate("courseId", "title")
    .populate("issuedBy", "name")
    .sort({ issuedAt: -1 })
    .lean();

  res.json({ success: true, data: certs });
});

// ── Get Certificate by ID ──────────────────────────────────────────────
export const getCertificateById = asyncHandler(async (req, res) => {
  const cert = await Certificate.findById(req.params.id)
    .populate("studentId", "name email")
    .populate("courseId", "title");

  if (!cert) throw new ApiError(404, "Certificate not found");

  res.json({ success: true, data: cert });
});

// ── Revoke Certificate ─────────────────────────────────────────────────
export const revokeCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findByIdAndUpdate(
    req.params.id,
    { status: "revoked" },
    { new: true }
  );
  if (!cert) throw new ApiError(404, "Certificate not found");

  res.json({ success: true, message: "Certificate revoked", data: cert });
});

// ── Delete Certificate ─────────────────────────────────────────────────
export const deleteCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findByIdAndDelete(req.params.id);
  if (!cert) throw new ApiError(404, "Certificate not found");

  res.json({ success: true, message: "Certificate deleted" });
});

// ── Verify Certificate (public) ────────────────────────────────────────
export const verifyCertificate = asyncHandler(async (req, res) => {
  const { certificateNumber } = req.params;

  const cert = await Certificate.findOne({ certificateNumber })
    .populate("studentId", "name")
    .populate("courseId", "title");

  if (!cert) throw new ApiError(404, "Certificate not found");

  res.json({
    success: true,
    data: {
      certificateNumber: cert.certificateNumber,
      studentName: cert.studentId.name,
      courseName: cert.courseId.title,
      issuedAt: cert.issuedAt,
      status: cert.status,
      grade: cert.grade,
    },
  });
});
