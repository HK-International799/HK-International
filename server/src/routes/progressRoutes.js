import express from "express";
import {
  completeLesson,
  getCourseProgress,
  getAllProgress,
} from "../controllers/progressController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["student"]));

// Mark lesson as completed
router.post("/complete-lesson", completeLesson);

// Get progress for all enrolled courses
router.get("/", getAllProgress);

// Get progress for a specific course
router.get("/:courseId", getCourseProgress);

export default router;
