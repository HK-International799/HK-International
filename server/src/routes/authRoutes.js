// import express from "express";
// import { registerUser, loginUser, changePassword, getMe } from "../controllers/authController.js";
// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.get("/me", authMiddleware, getMe);
// router.put("/change-password", authMiddleware, changePassword);

// export default router;


import express from "express";
import rateLimit from "express-rate-limit";
import {
  registerUser,
  loginUser,
  changePassword,
  getMe,
  forgotPassword,
  validateResetToken,
  resetPassword,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// Stricter than the global limiter in app.js — these endpoints are public
// and can trigger emails / token guessing. Response body matches the
// project's { success, message } format.
const buildLimiter = (max) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many attempts. Please try again after 15 minutes.",
    },
  });

const forgotPasswordLimiter = buildLimiter(5);
const resetPasswordLimiter = buildLimiter(15);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);
router.put("/change-password", authMiddleware, changePassword);

// ── Forgot / Reset Password (public) ──────────────────────────────────────
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate({ email: { required: true, type: "email" } }),
  forgotPassword,
);
router.post(
  "/validate-reset-token",
  resetPasswordLimiter,
  validate({ token: { required: true, type: "string" } }),
  validateResetToken,
);
router.post(
  "/reset-password",
  resetPasswordLimiter,
  validate({
    token: { required: true, type: "string" },
    password: { required: true, type: "string" },
    confirmPassword: { required: true, type: "string" },
  }),
  resetPassword,
);

export default router;
