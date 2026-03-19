import express from "express";
import {
  registerUser,
  loginUser,
  changePassword,
  getMe,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin registration route
router.post("/register", registerUser);

// Public login route
router.post("/login", loginUser);

router.get("/me", authMiddleware, getMe);


// Protected password change route
router.put("/change-password", authMiddleware, changePassword);

export default router;
