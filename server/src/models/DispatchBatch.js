import mongoose from "mongoose";

// ── Certificate Dispatch & Courier Management ───────────────────────────────
// A DispatchBatch groups any number of certificates (1 to thousands) that are
// posted together in a single India Post - Speed Post consignment on a given
// day. Certificates reference their batch via Certificate.dispatchBatch —
// there is no duplicate storage of certificate/learner data here.
const dispatchBatchSchema = new mongoose.Schema(
  {
    // Human-readable batch number, e.g. POST-20260711-001
    batchNumber: { type: String, required: true, unique: true, trim: true },

    dispatchDate: { type: Date, required: true, default: Date.now },

    // Courier is always India Post - Speed Post (company policy) — stored
    // as a fixed constant rather than a selectable field, per requirements.
    courierCompany: { type: String, default: "India Post - Speed Post", immutable: true },

    courierOffice: { type: String, default: "" }, // Booking post office name
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // open      -> still being assembled, certificates can be added/removed
    // booked    -> Speed Post booked, tracking number assigned
    // dispatched-> handed over to India Post
    // completed -> all certificates in the batch are delivered/closed out
    status: {
      type: String,
      enum: ["open", "booked", "dispatched", "completed"],
      default: "open",
    },

    // ── Speed Post booking details (filled in when the batch is booked) ──
    speedPost: {
      trackingNumber: { type: String, default: "" },
      bookingDate: { type: Date, default: null },
      bookingTime: { type: String, default: "" }, // free-text, e.g. "14:35"
      postOfficeName: { type: String, default: "" },
      bookingClerk: { type: String, default: "" },
      totalCharges: { type: Number, default: 0 },
      weight: { type: Number, default: 0 }, // in kg
      remarks: { type: String, default: "" },
    },

    remarks: { type: String, default: "" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

dispatchBatchSchema.index({ dispatchDate: -1 });
dispatchBatchSchema.index({ status: 1 });

export default mongoose.model("DispatchBatch", dispatchBatchSchema);
