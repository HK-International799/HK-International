

import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    partnerInstitute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PartnerInstitute",
      default: null,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "withdrawn"],
      default: "pending",
    },

    // LMS access granted after approval
    lmsAccessGranted: { type: Boolean, default: false },
    lmsAccessGrantedAt: { type: Date, default: null },

    // Orientation tracking
    orientationCompleted: { type: Boolean, default: false },
    orientationCompletedAt: { type: Date, default: null },

    // Quiz tracking
    quizPassed: { type: Boolean, default: false },
    quizScore: { type: Number, default: null },

    // Certificate
    certificateIssued: { type: Boolean, default: false },

    // ── Payment verification gate (additive) ───────────────────────────────
    // This is a WORKFLOW GATE controlling whether admin can approve LMS
    // access — it is NOT a financial ledger. LearnerPayment remains the
    // single source of truth for money received.
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid", "verified"],
      default: "unpaid",
    },
    paymentVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    paymentVerifiedAt: { type: Date, default: null },
    paymentNotes: { type: String, default: "" },

    // ── KYC / registration documents (additive) ────────────────────────────
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],

    // ── Self-registration extras (additive) ────────────────────────────────
    preferredIntake: { type: String, default: "" },

    // ── Registration Requirement 3: Multiple Course Selection (additive) ──
    // `course` above remains the single primary/legacy course field used by
    // every existing enrollment/batch/LMS-access code path — it is NOT
    // removed or renamed, and the {student, course} unique index is
    // unchanged, so the existing partner-institute and admin-enrollment
    // flows keep working exactly as before.
    //
    // When a candidate selects multiple courses during self-registration,
    // `course` is set to the FIRST selected course (so this record is a
    // valid, fully-functional Registration on its own — nothing downstream
    // needs to know multi-select happened) and ALL selected courses are
    // additionally recorded here so the original request is never lost.
    //
    // Candidate selection != enrollment: requestedCourses is what the
    // candidate asked for; approvedCourses/rejectedCourses is what the
    // admin decided. Approving a course beyond the primary `course` creates
    // its own additional Registration document via the existing
    // single-course creation path (see registrationController.approveCourse)
    // so batch assignment / LMS access continue to work per-registration,
    // unchanged.
    requestedCourses: {
      type: [
        {
          course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
          selectedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    approvedCourses: {
      type: [
        {
          course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
          approvedAt: { type: Date, default: Date.now },
          approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null },
          // Points at the Registration actually used for enrollment/LMS
          // access for this course (itself, for the primary course; a new
          // sibling Registration for any additional approved course).
          registration: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", default: null },
        },
      ],
      default: [],
    },
    rejectedCourses: {
      type: [
        {
          course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
          rejectedAt: { type: Date, default: Date.now },
          rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          reason: { type: String, default: "" },
        },
      ],
      default: [],
    },

    // ── Registration Requirement 5: Review & Submit confirmation (additive) ─
    // Frontend validation is mandatory per spec, but this backend field
    // means the confirmation is safely represented server-side too — a
    // request without it is rejected in createRegistration's validation,
    // never silently accepted.
    confirmed: { type: Boolean, default: false },
    confirmedAt: { type: Date, default: null },

    // Generated learner credentials
    defaultPassword: {
      type: String,
      default: "",
    },

    defaultPasswordIssuedAt: {
      type: Date,
      default: null,
    },

    defaultPasswordConsumed: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ["self", "institute", "admin"],
      default: "institute",
    },

    remarks: { type: String, default: "" },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

registrationSchema.index({ student: 1, course: 1 }, { unique: true });
registrationSchema.index({ partnerInstitute: 1 });
registrationSchema.index({ status: 1 });
registrationSchema.index({ paymentStatus: 1 });

export default mongoose.model("Registration", registrationSchema);
