import express from "express";
import { attemptQuiz } from "../controllers/quizAttemptController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/attempt",
  authMiddleware,
  roleMiddleware(["student"]),
  attemptQuiz
);

export default router;