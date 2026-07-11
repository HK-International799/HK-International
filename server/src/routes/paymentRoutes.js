// import express from "express";
// import {
//   initiatePayment,
//   verifyPayment,
//   getTransactionByOrderId,
//   razorpayWebhook,
// } from "../controllers/paymentController.js";

// const router = express.Router();

// router.post("/initiate", initiatePayment);

// router.post("/verify", verifyPayment);

// /* Razorpay webhook requires RAW body */
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   razorpayWebhook
// );

// router.get("/transaction/:orderId", getTransactionByOrderId);

// export default router;





import express from "express";
import attachUserIfPresent from "../middleware/attachUserIfPresent.js";
import {
  initiatePayment,
  verifyPayment,
  getTransactionByOrderId,
  razorpayWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

// Task 8.4: optional auth ONLY on /initiate — verifies a token if present
// (to capture learnerId for a logged-in learner) but never requires one,
// so guest checkout keeps working exactly as before.
router.post("/initiate", attachUserIfPresent, initiatePayment);

router.post("/verify", verifyPayment);

/* Razorpay webhook requires RAW body */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

router.get("/transaction/:orderId", getTransactionByOrderId);

export default router;