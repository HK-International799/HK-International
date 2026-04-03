import express from "express";
import {
  initiatePayment,
  verifyPayment,
  getTransactionByOrderId,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/initiate", initiatePayment);
router.post("/verify", verifyPayment);
router.get("/transaction/:orderId", getTransactionByOrderId);

export default router;