import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    certificateNumber: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
    grade: { type: String, default: "" },
    score: { type: Number, default: null },
    fileUrl: { type: String, default: "" },
    status: { type: String, enum: ["issued", "revoked"], default: "issued" },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ── Template system (additive) ──────────────────────────────────────────
    // Which pluggable PDF template (server/src/services/certificateTemplates)
    // was used to render this certificate. Existing certificates issued
    // before this feature have no value stored, so the generator/controller
    // treat a missing/unknown key as "classic" (the original hardcoded look).
    templateKey: { type: String, default: "classic" },

    // Cloudinary public_id for the generated PDF, stored alongside the
    // existing `fileUrl`. Needed so a later regenerate can delete the old
    // asset before uploading the new one. `fileUrl` itself was already part
    // of the schema but unused by the issuance flow — see file-change map.
    filePublicId: { type: String, default: "" },
    lastRegeneratedAt: { type: Date, default: null },

    // ── Expiry (additive, optional, default off) ────────────────────────────
    // Expired/not-expired is intentionally NOT a stored boolean — it is
    // computed at read time (verification + admin list) from expiryDate so
    // it can never go stale. See certificateController.js computeDisplayStatus.
    hasExpiry: { type: Boolean, default: false },
    expiryDate: { type: Date, default: null },

    // ── Structured revocation (additive) ────────────────────────────────────
    // `status` continues to be the single source of truth read by the
    // dispatch subsystem and everywhere else in the app — these fields only
    // add detail around a revocation, they never replace `status`.
    revokedAt: { type: Date, default: null },
    revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    revocationReason: { type: String, default: "" },

    // ── Duplicate-issuance / reissue (additive) ─────────────────────────────
    // See §3.4 decision: the {studentId, courseId} unique index is KEPT.
    // A "reissue" updates this same document instead of creating a second
    // one. This counter and history array exist purely for auditability.
    reissueCount: { type: Number, default: 0 },
    previousCertificateSnapshots: {
      type: [
        {
          title: String,
          grade: String,
          score: Number,
          issuedAt: Date,
          status: String,
          revocationReason: String,
          replacedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    // ── Certificate Dispatch & Courier Management (additive) ───────────────
    // Optional/defaulted — existing certificate issuance/verification code
    // paths are completely unaffected. This certificate IS the dispatch
    // record; no separate "dispatch certificate" collection is created, so
    // there is only ever one source of truth per certificate.
    registration: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", default: null },

    dispatchStatus: {
      type: String,
      enum: [
        "pending",      // Certificate generated, awaiting packing
        "packed",       // Packed, added to a daily dispatch batch
        "dispatched",   // Speed Post booked & tracking number assigned
        "in_transit",   // In transit with India Post
        "delivered",    // Delivered to receiver
        "returned",     // Returned undelivered
        "cancelled",    // Dispatch cancelled
        "postponed",    // Dispatch postponed
        "lost",         // Lost in transit
        "redispatched", // Re-dispatched after return/lost
      ],
      default: "pending",
    },

    dispatchBatch: { type: mongoose.Schema.Types.ObjectId, ref: "DispatchBatch", default: null },
    trackingNumber: { type: String, default: "" },
    packedAt: { type: Date, default: null },
    dispatchDate: { type: Date, default: null },
    deliveredDate: { type: Date, default: null },
    dispatchRemarks: { type: String, default: "" },
    dispatchUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

certificateSchema.index({ dispatchStatus: 1 });
certificateSchema.index({ dispatchBatch: 1 });
certificateSchema.index({ trackingNumber: 1 });

certificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("Certificate", certificateSchema);
