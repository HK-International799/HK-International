import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    amount: { type: Number, required: true },

    orderId: { type: String, index: true },
    paymentId: String,
    signature: String,
    txnid: String,

    status: {
      type: String,
      enum: ["created", "success", "failed"],
      default: "created",
      index: true,
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