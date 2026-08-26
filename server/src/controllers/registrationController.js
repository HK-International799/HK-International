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
import { buildFileMeta } from "../utils/fileMeta.js";
import { deriveFullAddress } from "../utils/nameUtils.js";

import emailService from "../services/emailService.js";
import notificationService from "../services/notificationService.js";
import auditService from "../services/auditService.js";

import {
  validatePersonalInfo,
  validateCourseSelection,
  validateConfirmation,
  getRequestedCourseIds,
} from "../validators/registrationValidator.js";

// ===========================================================================
//  PUBLIC SELF REGISTRATION  --  /api/registration/*
//  No authentication. Mirrors the existing institute-registration flow
//  (partnerInstituteController.createRegistration) but allows a brand-new
//  learner to create both their User account and their Registration in
//  one public flow. The existing institute flow is completely untouched.
// ===========================================================================

// -- Step 2 data source: GET /api/registration/courses --------------------
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

// -- Step 4 submit: POST /api/registration ---------------------------------
export const createRegistration = asyncHandler(async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    dob,
    email,
    countryCode,
    mobile,
    address,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    batchId,
    preferredIntake,
  } = req.body;

  const personalErrors = validatePersonalInfo(req.body);
  const courseErrors = validateCourseSelection(req.body);
  const confirmationErrors = validateConfirmation(req.body);
  const errors = [...personalErrors, ...courseErrors, ...confirmationErrors];
  if (errors.length) throw new ApiError(400, errors.join(". "));

  // Registration Requirement 3: multiple course selection. First selected
  // course becomes the primary/legacy `course` on this Registration; all
  // selected courses are preserved in requestedCourses[].
  const requestedCourseIds = getRequestedCourseIds(req.body);
  const primaryCourseId = requestedCourseIds[0];

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedMobile = String(mobile).trim();

  const courses = await Course.find({ _id: { $in: requestedCourseIds } });
  if (courses.length !== requestedCourseIds.length) {
    throw new ApiError(404, "One or more selected courses were not found");
  }
  const courseById = new Map(courses.map((c) => [String(c._id), c]));
  const primaryCourse = courseById.get(String(primaryCourseId));

  let batch = null;
  if (batchId) {
    batch = await Batch.findOne({ _id: batchId, courseId: primaryCourseId });
    if (!batch)
      throw new ApiError(404, "Selected batch not found for this course");
  }

  // -- Duplicate prevention --------------------------------------------------
  let student = await User.findOne({
    $or: [{ email: normalizedEmail }, { mobile: normalizedMobile }],
  });

  let generatedPassword = null;
  let isNewUser = false;

  // Registration Requirement 2: structured postal address, with a legacy
  // single-string fallback kept in sync for any existing consumer that
  // still reads `address`.
  const addressFields = {
    addressLine1: (addressLine1 || "").trim(),
    addressLine2: (addressLine2 || "").trim(),
    city: (city || "").trim(),
    state: (state || "").trim(),
    postalCode: (postalCode || "").trim(),
  };
  const legacyAddress =
    (address || "").trim() ||
    deriveFullAddress({ ...addressFields, country: (country || "").trim() });

  if (student) {
    // Existing learner -- make sure they're not duplicating any of the
    // SAME requested courses.
    const existingRegs = await Registration.find({
      student: student._id,
      course: { $in: requestedCourseIds },
    }).select("course");
    if (existingRegs.length) {
      throw new ApiError(
        409,
        "A registration for one or more of these courses already exists for this email/mobile",
      );
    }
    if (student.email !== normalizedEmail) {
      throw new ApiError(
        409,
        "Mobile number is already registered with a different email",
      );
    }
  } else {
    // New learner -- create the User account (the one structurally new
    // piece versus the existing institute-only flow).
    generatedPassword = crypto.randomBytes(6).toString("hex");
    const passwordHash = await bcrypt.hash(generatedPassword, 10);

    student = await User.create({
      name: [firstName, middleName, lastName]
        .map((p) => (p || "").trim())
        .filter(Boolean)
        .join(" "),
      firstName: firstName.trim(),
      middleName: (middleName || "").trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      mobile: normalizedMobile,
      countryCode: countryCode.trim(),
      dateOfBirth: new Date(dob),
      address: legacyAddress,
      ...addressFields,
      country: country.trim(),
      passwordHash,
      role: "student",
      isFirstLogin: true,
      registeredVia: "self",
    });
    isNewUser = true;
  }

  const now = new Date();

  const registration = await Registration.create({
    student: student._id,
    course: primaryCourseId,
    batch: batch ? batch._id : null,
    status: "pending",
    paymentStatus: "unpaid",
    preferredIntake: preferredIntake || "",
    defaultPassword: generatedPassword || "",
    defaultPasswordIssuedAt: generatedPassword ? new Date() : null,
    source: "self",
    requestedCourses: requestedCourseIds.map((id) => ({
      course: id,
      selectedAt: now,
    })),
    confirmed: true,
    confirmedAt: now,
  });

  // -- Notifications / emails (non-blocking, reuse existing services) -----
  const admins = await User.find({ role: { $in: ["admin", "super_admin"] } })
    .select("_id")
    .lean();
  const courseTitles = courses.map((c) => c.title).join(", ");
  await notificationService.createBulk(
    admins.map((a) => a._id),
    {
      type: "registration",
      title: "New Self-Registration",
      body: `${student.name} submitted a registration for "${courseTitles}"`,
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
    .sendRegistrationCreatedEmail(student.email, student.name, courseTitles)
    .catch((err) => console.warn("Registration email failed:", err.message));

  await auditService.log({
    action: "REGISTRATION_SELF_CREATED",
    entity: "Registration",
    entityId: registration._id,
    performedBy: student._id,
    details: `Self-registration created for ${student.email} on "${courseTitles}"`,
  });

  res.status(201).json({
    success: true,
    message: "Registration submitted successfully",

    data: {
      registrationId: registration._id,
      studentId: student._id,

      status: registration.status,
      requestedCourses: requestedCourseIds,

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

// -- Step 3 document upload: POST /api/registration/:id/documents -----------
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

  // Registration Requirement 4: preserve the user-provided document name
  // and correct file metadata (original filename, extension, MIME type)
  // so downloads later use the same filename/extension the user uploaded.
  async function saveDocument(file, type) {
    const upload = await uploadPdfToCloudinary(
      file.buffer,
      file.originalname,
      "registrations/documents",
    );

    const meta = buildFileMeta(file);

    const doc = await Document.create({
      registration: registration._id,

      type,
      category: type,

      title: meta.title,
      fileName: meta.fileName,
      originalName: meta.originalName,
      extension: meta.extension,
      mimeType: meta.mimeType,
      size: meta.size,

      fileUrl: upload.url,
      storagePublicId: upload.public_id || "",

      uploadedBy: registration.student,
      status: "pending",
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

// -- Status / resume check: GET /api/registration/:id -----------------------
export const getRegistrationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const registration = await Registration.findById(id)
    .populate("student", "name firstName middleName lastName email mobile")
    .populate("course", "title")
    .populate("batch", "name startDate endDate")
    .populate("requestedCourses.course", "title")
    .populate("approvedCourses.course", "title")
    .populate("rejectedCourses.course", "title")
    // FIX: previous populate selected "title category status fileUrl" --
    // none of which existed on the Document schema actually in production
    // (only registration/type/fileName/fileUrl/uploadedBy did), so those
    // fields always came back undefined. The schema now has all of these.
    .populate(
      "documents",
      "title fileName originalName extension category type status fileUrl",
    )
    .lean();

  if (!registration) throw new ApiError(404, "Registration not found");

  res.json({ success: true, data: registration });
});

// ===========================================================================
//  ADMIN COURSE-DECISION ENDPOINTS -- /api/admin/registrations/:id/courses/*
//  Distinguishes "requested" (candidate's selection) from "approved"/
//  "rejected" (admin's decision), per Registration Requirement 3. The
//  original request is never overwritten.
// ===========================================================================

// PATCH /api/admin/registrations/:id/courses/approve  { courseId, batchId }
export const approveRequestedCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { courseId, batchId } = req.body;
  if (!courseId) throw new ApiError(400, "courseId is required");

  const registration = await Registration.findById(id);
  if (!registration) throw new ApiError(404, "Registration not found");

  const wasRequested = registration.requestedCourses.some(
    (rc) => String(rc.course) === String(courseId),
  );
  if (!wasRequested) {
    throw new ApiError(
      400,
      "This course was not part of the candidate's original request",
    );
  }

  const alreadyApproved = registration.approvedCourses.some(
    (ac) => String(ac.course) === String(courseId),
  );
  if (alreadyApproved) {
    throw new ApiError(409, "This course has already been approved");
  }

  let targetRegistration = registration;

  // If this IS the primary course on this Registration document, approve
  // it in place. Otherwise, create a sibling Registration for it (reusing
  // the exact same creation shape as the existing single-course flows) so
  // downstream batch-assignment / LMS-access logic -- which all operate on
  // one Registration = one course -- continues to work unmodified.
  if (String(registration.course) !== String(courseId)) {
    const existingSibling = await Registration.findOne({
      student: registration.student,
      course: courseId,
    });
    if (existingSibling) {
      targetRegistration = existingSibling;
    } else {
      targetRegistration = await Registration.create({
        student: registration.student,
        course: courseId,
        partnerInstitute: registration.partnerInstitute,
        batch: batchId || null,
        status: "pending",
        paymentStatus: "unpaid",
        source: registration.source,
      });
    }
  }

  targetRegistration.status = "approved";
  if (batchId) targetRegistration.batch = batchId;
  targetRegistration.processedBy = req.user?.id || null;
  targetRegistration.processedAt = new Date();
  // Mirrors adminController.processRegistration's single-course approve
  // behavior, so a course approved via either path grants LMS access
  // consistently.
  targetRegistration.lmsAccessGranted = true;
  targetRegistration.lmsAccessGrantedAt = new Date();
  await targetRegistration.save();

  registration.approvedCourses.push({
    course: courseId,
    approvedAt: new Date(),
    approvedBy: req.user?.id || null,
    batch: batchId || null,
    registration: targetRegistration._id,
  });
  await registration.save();

  // ── Enroll the learner in the approved course, both sides ──────────────
  // User.enrolledCourses AND Course.enrolledStudents, kept in sync.
  // $addToSet makes this idempotent — safe even on re-approval.
  await Promise.all([
    User.findByIdAndUpdate(registration.student, {
      $addToSet: { enrolledCourses: courseId },
    }),
    Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: registration.student },
    }),
  ]);

  await auditService.log({
    action: "REGISTRATION_COURSE_APPROVED",
    entity: "Registration",
    entityId: registration._id,
    performedBy: req.user?.id,
    details: `Course ${courseId} approved for registration ${registration._id}`,
  });

  res.json({
    success: true,
    message: "Course approved",
    data: { registration, targetRegistration },
  });
});

// PATCH /api/admin/registrations/:id/courses/reject  { courseId, reason }
export const rejectRequestedCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { courseId, reason } = req.body;
  if (!courseId) throw new ApiError(400, "courseId is required");

  const registration = await Registration.findById(id);
  if (!registration) throw new ApiError(404, "Registration not found");

  const wasRequested = registration.requestedCourses.some(
    (rc) => String(rc.course) === String(courseId),
  );
  if (!wasRequested) {
    throw new ApiError(
      400,
      "This course was not part of the candidate's original request",
    );
  }

  registration.rejectedCourses.push({
    course: courseId,
    rejectedAt: new Date(),
    rejectedBy: req.user?.id || null,
    reason: reason || "",
  });
  await registration.save();

  await auditService.log({
    action: "REGISTRATION_COURSE_REJECTED",
    entity: "Registration",
    entityId: registration._id,
    performedBy: req.user?.id,
    details: `Course ${courseId} rejected for registration ${registration._id}${reason ? `: ${reason}` : ""}`,
  });

  res.json({ success: true, message: "Course rejected", data: registration });
});

export default {
  getRegistrationCourses,
  createRegistration,
  uploadRegistrationDocuments,
  getRegistrationStatus,
  approveRequestedCourse,
  rejectRequestedCourse,
};
