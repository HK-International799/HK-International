// // import express from "express";
// // import {
// //   initiatePayment,
// //   paymentSuccess,
// //   paymentFailure,
// // } from "../controllers/paymentController.js";

// // const router = express.Router();

// // router.post("/initiate", initiatePayment);
// // router.post("/success", paymentSuccess);
// // router.post("/failure", paymentFailure);

// // export default router;

// import express from "express";
// import {
//   initiatePayment,
//   paymentSuccess,
//   paymentFailure,
// } from "../controllers/paymentController.js";

// const router = express.Router();

// // Frontend calls this to start payment
// router.post("/initiate", initiatePayment);

// // Easebuzz POSTs here on success/failure (form-urlencoded)
// router.post("/success", express.urlencoded({ extended: true }), paymentSuccess);
// router.post("/failure", express.urlencoded({ extended: true }), paymentFailure);
// router.get("/transaction/:txnid", getTransactionByTxnId);

// export default router;

import express from "express";
import {
  initiatePayment,
  paymentSuccess,
  paymentFailure,
  getTransactionByTxnId,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/initiate", initiatePayment);

router.post(
  "/success",
  express.urlencoded({ extended: true }),
  paymentSuccess
);

router.post(
  "/failure",
  express.urlencoded({ extended: true }),
  paymentFailure
);

router.get("/transaction/:txnid", getTransactionByTxnId);

export default router;