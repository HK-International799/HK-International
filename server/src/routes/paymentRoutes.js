import express from "express";
import {
  initiatePayment,
  verifyPayment,
  getTransactionByOrderId,
  razorpayWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/initiate", initiatePayment);

router.post("/verify", verifyPayment);

/* Razorpay webhook requires RAW body */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

router.get("/transaction/:orderId", getTransactionByOrderId);

export default router;