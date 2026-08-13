import Certificate from "../models/Certificate.js";
import Attendance from "../models/Attendance.js";
import QuizAttempt from "../models/QuizAttempt.js";
import OrientationSession from "../models/OrientationSession.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Registration from "../models/Registration.js";
import AwardingOrganisation from "../models/AwardingOrganisation.js";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import apiResponse from "../utils/apiResponse.js";
import auditService from "../services/auditService.js";
import generateCertificatePDF from "../services/certificateGenerator.js";
import {
  uploadPdfToCloudinary,
  deletePdfFromCloudinary,
} from "../utils/cloudinaryPdf.js";
import { TEMPLATE_KEYS } from "../services/certificateTemplates/index.js";

const FRONTEND_URL = (process.env.FRONTEND_URL || "").replace(/\/$/, "");

const HK_LOGO_URL = FRONTEND_URL ? `${FRONTEND_URL}/images/hk_logo.png` : null;

const SIGNATURE_URL = FRONTEND_URL
  ? `${FRONTEND_URL}/images/signature.png`
  : null;

// ── Helpers ─────────────────────────────────────────────────────────────

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

/**
 * Expiry/revocation are never stored as a single derived boolean — this
 * is computed fresh every time a certificate is read (list, get-by-id,
 * verify) so it can never go stale. `status` itself is untouched and
 * keeps meaning exactly "issued" | "revoked", which is what the dispatch
 * subsystem still reads directly from the DB.
 */
const computeDisplayStatus = (cert) => {
  if (cert.status === "revoked") return "revoked";
  if (
    cert.hasExpiry &&
    cert.expiryDate &&
    new Date(cert.expiryDate).getTime() < Date.now()
  )
    return "expired";
  return "issued";
};

const withDisplayStatus = (cert) => ({
  ...cert,
  displayStatus: computeDisplayStatus(cert),
});

const buildVerifyUrl = (certificateNumber) =>
  FRONTEND_URL
    ? `${FRONTEND_URL}/verify-certificate/${certificateNumber}`
    : null;

/**
 * Resolve the accrediting body for a course via the EXISTING
 * AwardingOrganisation.courses[] back-reference (no new field added to
 * Course for this — see build-prompt §2 decision).
 */
const resolveAwardingOrganisation = async (courseId) => {
  if (!courseId) return null;
  try {
    return await AwardingOrganisation.findOne({
      courses: courseId,
      status: "active",
    })
      .select("name logo code")
      .lean();
  } catch {
    return null;
  }
};

const buildCertificatePdfData = (cert, ao) => ({
  studentName: cert.studentId.name,
  courseName: cert.courseId.title,
  certificateNumber: cert.certificateNumber,
  issuedDate: formatDate(cert.issuedAt),

  grade: cert.grade,
  score: cert.score,

  templateKey: cert.templateKey,

  verifyUrl: buildVerifyUrl(cert.certificateNumber),

  hkLogoUrl: HK_LOGO_URL,
  signatureUrl: SIGNATURE_URL,

  aoName: ao?.name || "",
  aoLogoUrl: ao?.logo || "",

  courseCode: cert.courseId.courseCode || "",
  durationText: cert.courseId.durationText || "",

  hasExpiry: !!cert.hasExpiry,
  expiryDateText: cert.hasExpiry ? formatDate(cert.expiryDate) : "",

  revoked: cert.status === "revoked",
});

// ── Issue Certificate (with attendance + quiz gate) ────────────────────
export const issueCertificate = asyncHandler(async (req, res) => {
  const {
    studentId,
    courseId,
    title,
    grade,
    score,
    skipChecks,
    templateKey,
    hasExpiry,
    expiryDate,
    reissue,
  } = req.body;

  if (!studentId || !courseId || !title) {
    throw new ApiError(400, "studentId, courseId, and title are required");
  }

  if (templateKey && !TEMPLATE_KEYS.includes(templateKey)) {
    throw new ApiError(
      400,
      `Invalid templateKey. Allowed: ${TEMPLATE_KEYS.join(", ")}`,
    );
  }

  const student = await User.findById(studentId);
  if (!student) throw new ApiError(404, "Student not found");

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  // Check if certificate already exists — the {studentId, courseId} unique
  // index is intentionally kept (see §3.4 decision), so a duplicate is
  // handled as an explicit reissue of the SAME document rather than a
  // second row.
  const existing = await Certificate.findOne({ studentId, courseId });
  if (existing && !reissue) {
    throw new ApiError(
      409,
      "Certificate already issued for this student/course. Pass reissue=true to update it.",
    );
  }

  // Gate: Orientation attendance + quiz pass (unless admin overrides)
  if (!skipChecks) {
    const sessions = await OrientationSession.find({ course: courseId })
      .select("_id passingScore quiz")
      .lean();

    if (sessions.length > 0) {
      for (const session of sessions) {
        const attendance = await Attendance.findOne({
          orientationSession: session._id,
          student: studentId,
          status: "present",
        });
        if (!attendance) {
          throw new ApiError(
            400,
            `Student has not attended orientation session: ${session._id}`,
          );
        }

        if (session.quiz) {
          const attempt = await QuizAttempt.findOne({
            quizId: session.quiz,
            studentId,
          });
          if (!attempt || attempt.score === null) {
            throw new ApiError(
              400,
              "Student has not completed the orientation quiz",
            );
          }
          // Check passing score
          if (attempt.score < (session.passingScore || 50)) {
            throw new ApiError(
              400,
              `Student did not pass the orientation quiz. Score: ${attempt.score}%`,
            );
          }
        }
      }
    }
  }

  // Best-effort Registration link. Registration is NOT a hard gate for
  // issuance (existing issuance flow never required one, and enforcing it
  // now would be a breaking behavior change) — see §2 decision. If a
  // matching Registration exists we link it and flip its existing
  // (previously unused-by-this-flow) certificateIssued flag.
  let registration = null;
  try {
    registration = await Registration.findOne({
      student: studentId,
      course: courseId,
    });
  } catch {
    registration = null;
  }

  let cert;

  if (existing && reissue) {
    // ── Reissue: update the SAME document, never create a second one ──
    existing.previousCertificateSnapshots.push({
      title: existing.title,
      grade: existing.grade,
      score: existing.score,
      issuedAt: existing.issuedAt,
      status: existing.status,
      revocationReason: existing.revocationReason,
    });

    existing.title = title;
    existing.grade = grade || "";
    existing.score = score ?? null;
    existing.status = "issued";
    existing.revokedAt = null;
    existing.revokedBy = null;
    existing.revocationReason = "";
    existing.reissueCount = (existing.reissueCount || 0) + 1;
    existing.issuedBy = req.user._id;
    existing.issuedAt = new Date();
    if (templateKey) existing.templateKey = templateKey;
    existing.hasExpiry = !!hasExpiry;
    existing.expiryDate = hasExpiry ? expiryDate || null : null;
    if (registration) existing.registration = registration._id;

    cert = await existing.save();

    await auditService.log({
      action: "REISSUE_CERTIFICATE",
      entity: "Certificate",
      entityId: cert._id,
      performedBy: req.user._id,
      details: `Reissued certificate ${cert.certificateNumber} for student ${studentId}`,
      changes: { title, grade, score, reissueCount: cert.reissueCount },
    });
  } else {
    const certNum = `CERT-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    cert = await Certificate.create({
      studentId,
      courseId,
      certificateNumber: certNum,
      title,
      grade: grade || "",
      score: score ?? null,
      issuedBy: req.user._id,
      templateKey: templateKey || "classic",
      hasExpiry: !!hasExpiry,
      expiryDate: hasExpiry ? expiryDate || null : null,
      registration: registration ? registration._id : null,
    });

    await auditService.log({
      action: "ISSUE_CERTIFICATE",
      entity: "Certificate",
      entityId: cert._id,
      performedBy: req.user._id,
      details: `Issued certificate ${cert.certificateNumber} for student ${studentId}`,
      changes: { title, grade, score, templateKey: cert.templateKey },
    });
  }

  if (registration && !registration.certificateIssued) {
    registration.certificateIssued = true;
    await registration.save().catch(() => {});
  }

  apiResponse(
    res,
    201,
    reissue ? "Certificate reissued" : "Certificate issued",
    cert,
  );
});

// ── Download Certificate PDF ───────────────────────────────────────────
export const downloadCertificatePDF = asyncHandler(async (req, res) => {
  const cert = await Certificate.findById(req.params.id)
    .populate("studentId", "name email")
    .populate("courseId", "title courseCode durationText");

  if (!cert) throw new ApiError(404, "Certificate not found");
  if (cert.status === "revoked")
    throw new ApiError(400, "Certificate has been revoked");
  if (
    cert.hasExpiry &&
    cert.expiryDate &&
    new Date(cert.expiryDate).getTime() < Date.now()
  ) {
    throw new ApiError(400, "Certificate has expired");
  }

  // Students can only download their own
  if (
    req.user.role === "student" &&
    cert.studentId._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Access denied");
  }

  const ao = await resolveAwardingOrganisation(cert.courseId._id);
  const pdfBuffer = await generateCertificatePDF(
    buildCertificatePdfData(cert, ao),
  );

  await auditService.log({
    action: "DOWNLOAD_CERTIFICATE",
    entity: "Certificate",
    entityId: cert._id,
    performedBy: req.user._id,
    details: `Downloaded certificate ${cert.certificateNumber}`,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=certificate-${cert.certificateNumber}.pdf`,
  );
  res.send(pdfBuffer);
});

// ── Regenerate Certificate PDF (stores to Cloudinary, updates fileUrl) ──
export const regenerateCertificatePDF = asyncHandler(async (req, res) => {
  const { templateKey } = req.body;

  if (templateKey && !TEMPLATE_KEYS.includes(templateKey)) {
    throw new ApiError(
      400,
      `Invalid templateKey. Allowed: ${TEMPLATE_KEYS.join(", ")}`,
    );
  }

  const cert = await Certificate.findById(req.params.id)
    .populate("studentId", "name email")
    .populate("courseId", "title courseCode durationText");

  if (!cert) throw new ApiError(404, "Certificate not found");

  if (templateKey) cert.templateKey = templateKey;

  const ao = await resolveAwardingOrganisation(cert.courseId._id);
  const pdfBuffer = await generateCertificatePDF(
    buildCertificatePdfData(cert, ao),
  );

  const oldPublicId = cert.filePublicId;
  const uploaded = await uploadPdfToCloudinary(
    pdfBuffer,
    `certificate-${cert.certificateNumber}.pdf`,
    "certificates",
  );

  cert.fileUrl = uploaded.url;
  cert.filePublicId = uploaded.public_id;
  cert.lastRegeneratedAt = new Date();
  await cert.save();

  // Delete the old asset only after the new one is safely uploaded/saved.
  if (oldPublicId && oldPublicId !== uploaded.public_id) {
    await deletePdfFromCloudinary(oldPublicId);
  }

  await auditService.log({
    action: "REGENERATE_CERTIFICATE",
    entity: "Certificate",
    entityId: cert._id,
    performedBy: req.user._id,
    details: `Regenerated PDF for certificate ${cert.certificateNumber}`,
    changes: { templateKey: cert.templateKey },
  });

  apiResponse(res, 200, "Certificate PDF regenerated", cert);
});

// ── Get All Certificates ───────────────────────────────────────────────
export const getAllCertificates = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "student") filter.studentId = req.user._id;

  const certs = await Certificate.find(filter)
    .populate("studentId", "name email avatar")
    .populate("courseId", "title courseCode")
    .populate("issuedBy", "name")
    .sort({ issuedAt: -1 })
    .lean();

  apiResponse(res, 200, "Certificates fetched", certs.map(withDisplayStatus));
});

// ── Get Certificate by ID ──────────────────────────────────────────────
export const getCertificateById = asyncHandler(async (req, res) => {
  const cert = await Certificate.findById(req.params.id)
    .populate("studentId", "name email")
    .populate("courseId", "title courseCode durationText")
    .lean();

  if (!cert) throw new ApiError(404, "Certificate not found");

  apiResponse(res, 200, "Certificate fetched", withDisplayStatus(cert));
});

// ── Revoke Certificate ─────────────────────────────────────────────────
export const revokeCertificate = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const cert = await Certificate.findByIdAndUpdate(
    req.params.id,
    {
      status: "revoked",
      revokedAt: new Date(),
      revokedBy: req.user._id,
      revocationReason: reason || "",
    },
    { new: true },
  );
  if (!cert) throw new ApiError(404, "Certificate not found");

  await auditService.log({
    action: "REVOKE_CERTIFICATE",
    entity: "Certificate",
    entityId: cert._id,
    performedBy: req.user._id,
    details: `Revoked certificate ${cert.certificateNumber}`,
    changes: { revocationReason: reason || "" },
  });

  apiResponse(res, 200, "Certificate revoked", cert);
});

// ── Delete Certificate ─────────────────────────────────────────────────
export const deleteCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findByIdAndDelete(req.params.id);
  if (!cert) throw new ApiError(404, "Certificate not found");

  if (cert.filePublicId) {
    await deletePdfFromCloudinary(cert.filePublicId);
  }

  await auditService.log({
    action: "DELETE_CERTIFICATE",
    entity: "Certificate",
    entityId: cert._id,
    performedBy: req.user._id,
    details: `Deleted certificate ${cert.certificateNumber}`,
  });

  apiResponse(res, 200, "Certificate deleted");
});

// ── Verify Certificate (public) ────────────────────────────────────────
export const verifyCertificate = asyncHandler(async (req, res) => {
  const { certificateNumber } = req.params;

  const cert = await Certificate.findOne({ certificateNumber })
    .populate("studentId", "name")
    .populate("courseId", "title courseCode durationText");

  if (!cert) throw new ApiError(404, "Certificate not found");

  const ao = await resolveAwardingOrganisation(cert.courseId._id);
  const displayStatus = computeDisplayStatus(cert);

  apiResponse(res, 200, "Certificate verified", {
    certificateNumber: cert.certificateNumber,
    studentName: cert.studentId.name,
    courseName: cert.courseId.title,
    courseCode: cert.courseId.courseCode || "",
    durationText: cert.courseId.durationText || "",
    issuedAt: cert.issuedAt,
    status: cert.status, // unchanged, raw stored value — kept for backward compatibility
    displayStatus, // "issued" | "revoked" | "expired" — computed, never stale
    grade: cert.grade,
    hasExpiry: !!cert.hasExpiry,
    expiryDate: cert.hasExpiry ? cert.expiryDate : null,
    revocationReason:
      cert.status === "revoked" ? cert.revocationReason || "" : "",
    accreditingBody: ao?.name || "",
  });
});
