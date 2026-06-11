import mongoose from "mongoose";

/**
 * LearnerPayment
 *
 * Tracks every payment (installment) made by a learner for a course.
 * One document = one payment entry.
 * This is completely separate from the existing Razorpay `Payment` collection.
 *
 * Outstanding balance = totalCourseFee - SUM(amount) for all records
 * with the same learnerId + courseId.
 */

const PAYMENT_MODES = [
  "razorpay",
  "upi",
  "bank_transfer",
  "wise",
  "cash",
  "cheque",
  "other",
];

const PAYMENT_STATUSES = [
  "not_paid",        // no payment recorded yet (used on summary)
  "part_payment",    // some amount received, balance pending
  "fully_paid",      // total received >= totalCourseFee
  "balance_pending", // explicitly marked as pending balance
  "refund_issued",   // a refund was given
  "adjustment",      // fee adjustment / discount applied
];

const learnerPaymentSchema = new mongoose.Schema(
  {
    // ── Core references ───────────────────────────────────────────────────
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    // ── Fee baseline (set at time of recording / enrollment) ───────────────
    // Stored per-record so historical records remain accurate if fee changes
    totalCourseFee: {
      type: Number,
      required: true,
      min: 0,
    },

    // ── This installment ──────────────────────────────────────────────────
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "GBP",
      uppercase: true,
      trim: true,
    },

    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    paymentMode: {
      type: String,
      enum: PAYMENT_MODES,
      required: true,
    },

    // UTR number, transaction ID, Razorpay payment ID, cheque number, etc.
    referenceNumber: {
      type: String,
      default: "",
      trim: true,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    // ── Payment status for THIS record ─────────────────────────────────────
    // Calculated and stored when saving; also re-calculated on read
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "part_payment",
      index: true,
    },

    // ── Proof of payment (Cloudinary) ─────────────────────────────────────
    proofUrl: {
      type: String,
      default: "",
    },

    proofPublicId: {
      type: String,
      default: "",
    },

    // ── Invoice & receipt tracking ────────────────────────────────────────
    invoiceGenerated: { type: Boolean, default: false },
    invoiceUrl:       { type: String,  default: "" },
    receiptGenerated: { type: Boolean, default: false },
    receiptUrl:       { type: String,  default: "" },

    // ── Optional link to online Razorpay Payment record ───────────────────
    razorpayPaymentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    // ── Audit ─────────────────────────────────────────────────────────────
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Soft-delete support
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Compound indexes for fast queries ─────────────────────────────────────
learnerPaymentSchema.index({ learnerId: 1, courseId: 1 });
learnerPaymentSchema.index({ paymentDate: -1 });
learnerPaymentSchema.index({ paymentMode: 1 });
learnerPaymentSchema.index({ createdAt: -1 });
learnerPaymentSchema.index({ status: 1, learnerId: 1 });

export default mongoose.model("LearnerPayment", learnerPaymentSchema);
