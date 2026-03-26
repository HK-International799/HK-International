import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    amount: String,

    txnid: String,
    easebuzz_payment_id: String,

    status: String,
    hash: String,

    easebuzzResponse: Object,
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
