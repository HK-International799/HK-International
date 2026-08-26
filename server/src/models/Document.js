import mongoose from "mongoose";

/**
 * Document
 *
 * Unified schema for both:
 *  1) Registration KYC documents (registrationController.uploadRegistrationDocuments)
 *  2) General course/learner documents (documentController.uploadDocument)
 *
 * ── Backward compatibility note ─────────────────────────────────────────
 * Earlier iterations of this schema (see git history) had two different,
 * incompatible shapes:
 *   - { title, description, fileUrl, originalName, fileType, courseId,
 *       uploadedBy, reviewedBy, status, reviewNotes, reviewedAt }
 *   - { registration, type, fileName, fileUrl, uploadedBy, verified, verifiedAt }
 * The version that was actually active in production only had the second
 * shape, while documentController.js still wrote fields from the first
 * shape — Mongoose silently dropped anything not in the schema, and
 * `registration` (required) was never supplied by the general-document
 * upload path, which caused create() to fail validation there.
 *
 * This schema is a superset of both shapes so that either upload path
 * produces a complete, correctly-typed record, and adds the metadata
 * needed to preserve the user's original filename/extension on download.
 */
const documentSchema = new mongoose.Schema(
  {
    // ── Optional relationships (a document may belong to a registration,
    //    a course, both, or neither — general uploads may have neither) ───
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      default: null,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    // ── Category / legacy "type" ────────────────────────────────────────
    // `type` is kept as the historical field name used by the registration
    // KYC flow (e.g. "government_id", "additional"). `category` is a more
    // general label used by the standalone document flow. Both are kept in
    // sync so neither existing caller breaks.
    type: { type: String, default: "document", trim: true },
    category: { type: String, default: "document", trim: true },

    // ── Display metadata ─────────────────────────────────────────────────
    // `title` is the user-facing display name (defaults to the original
    // uploaded filename if not explicitly provided). `description` is
    // optional free text some flows collect.
    title: { type: String, default: "", trim: true },
    description: { type: String, default: "" },

    // ── File identity — required to preserve original name/extension on
    //    download (Registration Requirement 4) ──────────────────────────
    fileName: { type: String, required: true, trim: true }, // legacy/display name shown to users
    originalName: { type: String, required: true, trim: true }, // exact name as uploaded
    extension: { type: String, default: "", lowercase: true, trim: true }, // e.g. "pdf", derived from originalName
    mimeType: { type: String, default: "" }, // as reported by multer/browser
    size: { type: Number, default: 0 }, // bytes

    fileUrl: { type: String, required: true },
    // Cloudinary/storage public id, needed to delete/regenerate without
    // parsing fileUrl. Optional — not every upload path has one.
    storagePublicId: { type: String, default: "" },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Review / approval workflow ──────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "under-review", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewNotes: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

documentSchema.index({ registration: 1 });
documentSchema.index({ courseId: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ status: 1 });

const Document =
  mongoose.models.Document || mongoose.model("Document", documentSchema);

export default Document;
