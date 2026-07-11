// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },

//     email: {
//       type: String,
//       required: true,
//       lowercase: true,
//       trim: true,
//     },

//     phone: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     amount: {
//       type: Number,
//       required: true,
//       min: 1,
//     },

//     currency: {
//       type: String,
//       default: "INR",
//       uppercase: true,
//     },

//     country: {
//       type: String,
//       default: "India",
//     },

//     orderId: {
//       type: String,
//       index: true,
//     },

//     paymentId: {
//       type: String,
//       index: true,
//     },

//     signature: String,

//     receipt: String,

//     status: {
//       type: String,
//       enum: ["created", "success", "failed"],
//       default: "created",
//       index: true,
//     },

//     webhookVerified: {
//       type: Boolean,
//       default: false,
//     },

//     gateway: {
//       type: String,
//       default: "razorpay",
//     },

//     razorpayResponse: Object,
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Payment", paymentSchema);

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    country: {
      type: String,
      default: "India",
    },

    orderId: {
      type: String,
      index: true,
    },

    paymentId: {
      type: String,
      index: true,
    },

    signature: String,

    receipt: String,

    status: {
      type: String,
      enum: ["created", "success", "failed"],
      default: "created",
      index: true,
    },

    webhookVerified: {
      type: Boolean,
      default: false,
    },

    gateway: {
      type: String,
      default: "razorpay",
    },

    razorpayResponse: Object,

    // ── Optional link to a registered learner ──────────────────────────────
    // Populated only when the payer was authenticated (logged in) at the
    // moment of checkout — see paymentController.js -> initiatePayment().
    // Left null/undefined for guest checkouts; `email` remains the
    // identifier for those, exactly as before this field was added.
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ learnerId: 1 });

export default mongoose.model("Payment", paymentSchema);