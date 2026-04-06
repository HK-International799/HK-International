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
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);