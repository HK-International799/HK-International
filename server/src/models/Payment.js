import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    country: { type: String, default: "India" },

    orderId: { type: String, index: true },
    paymentId: { type: String, index: true },
    signature: String,
    txnid: String,
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