import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../models/User.js";
import Course from "../models/Course.js";
import Batch from "../models/Batch.js";
import Registration from "../models/Registration.js";
import Document from "../models/Document.js";
import CourseEnrollmentFee from "../models/CourseEnrollmentFee.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { uploadPdfToCloudinary } from "../utils/cloudinaryPdf.js";

import emailService from "../services/emailService.js";
import notificationService from "../services/notificationService.js";
import auditService from "../services/auditService.js";

import {
  validatePersonalInfo,
  validateCourseSelection,
} from "../validators/registrationValidator.js";

// ═══════════════════════════════════════════════════════════════════════
//  PUBLIC SELF REGISTRATION  —  /api/registration/*
//  No authentication. Mirrors the existing institute-registration flow
//  (partnerInstituteController.createRegistration) but allows a brand-new
//  learner to create both their User account and their Registration in
//  one public flow. The existing institute flow is completely untouched.
// ═══════════════════════════════════════════════════════════════════════

// ── Step 2 data source: GET /api/registration/courses ─────────────────────
export const getRegistrationCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ status: "published" })
    .select("title description thumbnail")
    .sort({ title: 1 })
    .lean();

  const courseIds = courses.map((c) => c._id);

  const [batches, fees] = await Promise.all([
    Batch.find({
      courseId: { $in: courseIds },
      status: { $in: ["upcoming", "active"] },
    })
      .select("name courseId startDate endDate maxStudents students")
      .lean(),
    CourseEnrollmentFee.find({ courseId: { $in: courseIds } })
      .select("courseId fee currency")
      .lean(),
  ]);

  const batchesByCourse = {};
  for (const b of batches) {
    const key = String(b.courseId);
    if (!batchesByCourse[key]) batchesByCourse[key] = [];
    batchesByCourse[key].push({
      _id: b._id,
      name: b.name,
      startDate: b.startDate,
      endDate: b.endDate,
      seatsLeft: Math.max((b.maxStudents || 0) - (b.students?.length || 0), 0),
    });
  }

  const feeByCourse = {};
  for (const f of fees)
    feeByCourse[String(f.courseId)] = { fee: f.fee, currency: f.currency };

  const data = courses.map((c) => ({
    _id: c._id,
    title: c.title,
    description: c.description,
    thumbnail: c.thumbnail,
    fee: feeByCourse[String(c._id)] || null,
    batches: batchesByCourse[String(c._id)] || [],
  }));

  res.json({ success: true, data });
});

// ── Step 4 submit: POST /api/registration ──────────────────────────────────
export const createRegistration = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    dob,
    email,
    countryCode,
    mobile,
    address,
    country,
    courseId,
    batchId,
    preferredIntake,
  } = req.body;

  const personalErrors = validatePersonalInfo(req.body);
  const courseErrors = validateCourseSelection(req.body);
  const errors = [...personalErrors, ...courseErrors];
  if (errors.length) throw new ApiError(400, errors.join(". "));

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedMobile = String(mobile).trim();

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Selected course not found");

  let batch = null;
  if (batchId) {
    batch = await Batch.findOne({ _id: batchId, courseId });
    if (!batch)
      throw new ApiError(404, "Selected batch not found for this course");
  }

  // ── Duplicate prevention ────────────────────────────────────────────────
  let student = await User.findOne({
    $or: [{ email: normalizedEmail }, { mobile: normalizedMobile }],
  });

  let generatedPassword = null;
  let isNewUser = false;

  if (student) {
    // Existing learner — make sure they're not duplicating the SAME course
    const existingReg = await Registration.findOne({
      student: student._id,
      course: courseId,
    });
    if (existingReg) {
      throw new ApiError(
        409,
        "A registration for this course already exists for this email/mobile",
      );
    }
    if (student.email !== normalizedEmail) {
      throw new ApiError(
        409,
        "Mobile number is already registered with a different email",
      );
    }
  } else {
    // New learner — create the User account (the one structurally new piece
    // versus the existing institute-only flow).
    generatedPassword = crypto.randomBytes(6).toString("hex");
    const passwordHash = await bcrypt.hash(generatedPassword, 10);

    student = await User.create({
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      mobile: normalizedMobile,
      countryCode: countryCode.trim(),
      dateOfBirth: new Date(dob),
      address: address.trim(),
      country: country.trim(),
      passwordHash,
      role: "student",
      isFirstLogin: true,
      registeredVia: "self",
    });
    isNewUser = true;
  }

  const registration = await Registration.create({
    student: student._id,
    course: course._id,
    batch: batch ? batch._id : null,
    status: "pending",
    paymentStatus: "unpaid",
    preferredIntake: preferredIntake || "",
    defaultPassword: generatedPassword || "",
    defaultPasswordIssuedAt: generatedPassword ? new Date() : null,
    source: "self",
  });

  // ── Notifications / emails (non-blocking, reuse existing services) ─────
  const admins = await User.find({ role: { $in: ["admin", "super_admin"] } })
    .select("_id")
    .lean();
  await notificationService.createBulk(
    admins.map((a) => a._id),
    {
      type: "registration",
      title: "New Self-Registration",
      body: `${student.name} submitted a registration for "${course.title}"`,
      referenceId: registration._id,
    },
  );

  if (isNewUser) {
    emailService
      .sendWelcomeEmail(student.email, generatedPassword)
      .catch((err) => {
        console.warn("Welcome email failed:", err.message);
      });
  }
  emailService
    .sendRegistrationCreatedEmail(student.email, student.name, course.title)
    .catch((err) => console.warn("Registration email failed:", err.message));

  await auditService.log({
    action: "REGISTRATION_SELF_CREATED",
    entity: "Registration",
    entityId: registration._id,
    performedBy: student._id,
    details: `Self-registration created for ${student.email} on "${course.title}"`,
  });

  res.status(201).json({
    success: true,
    message: "Registration submitted successfully",

    data: {
      registrationId: registration._id,
      studentId: student._id,

      status: registration.status,

      isNewUser,

      credentials:
        isNewUser && generatedPassword
          ? {
              email: student.email,
              password: generatedPassword,
            }
          : null,
    },
  });
});

// ── Step 3 document upload: POST /api/registration/:id/documents ──────────
export const uploadRegistrationDocuments = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const registration = await Registration.findById(id);

  if (!registration) {
    throw new ApiError(404, "Registration not found");
  }

  const files = req.files || {};

  const governmentId = files.governmentId?.[0];

  const additional = files.additional || [];

  if (!governmentId && additional.length === 0) {
    throw new ApiError(400, "Upload at least one document");
  }

  const documentIds = [];

  async function saveDocument(file, type) {
    const upload = await uploadPdfToCloudinary(
      file.buffer,
      file.originalname,
      "registrations/documents",
    );

    const doc = await Document.create({
      registration: registration._id,

      type,

      fileName: file.originalname,

      fileUrl: upload.url,

      uploadedBy: registration.student,
    });

    documentIds.push(doc._id);
  }

  if (governmentId) {
    await saveDocument(governmentId, "government_id");
  }

  for (const file of additional) {
    await saveDocument(file, "additional");
  }

  registration.documents.push(...documentIds);

  await registration.save();

  res.json({
    success: true,
    data: {
      documentIds,
    },
  });
});

// ── Status / resume check: GET /api/registration/:id ───────────────────────
export const getRegistrationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const registration = await Registration.findById(id)
    .populate("student", "name email mobile")
    .populate("course", "title")
    .populate("batch", "name startDate endDate")
    .populate("documents", "title category status fileUrl")
    .lean();

  if (!registration) throw new ApiError(404, "Registration not found");

  res.json({ success: true, data: registration });
});

export default {
  getRegistrationCourses,
  createRegistration,
  uploadRegistrationDocuments,
  getRegistrationStatus,
};
