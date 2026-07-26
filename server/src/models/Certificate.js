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
