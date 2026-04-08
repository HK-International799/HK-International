import express from "express";

import {
  getStudentDashboard,
  getMyCourses,
  getMyAssignments,
  getCoursePlayer,
  getLessonContent,
  submitQuiz,
  getQuizAttempt
} from "../controllers/studentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/* Dashboard */
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware(["student"]),
  getStudentDashboard
);

/* My Courses */
router.get(
  "/courses",
  authMiddleware,
  roleMiddleware(["student"]),
  getMyCourses
);

/* Course Player */
router.get(
  "/course-player/:id",
  authMiddleware,
  roleMiddleware(["student"]),
  getCoursePlayer
);

/* Lesson Content */
router.get(
  "/lesson/:id",
  authMiddleware,
  roleMiddleware(["student"]),
  getLessonContent
);

/* Submit Quiz */
router.post(
  "/quiz/submit",
  authMiddleware,
  roleMiddleware(["student"]),
  submitQuiz
);

/* Quiz Attempt */
router.get(
  "/quiz/:quizId/attempt",
  authMiddleware,
  roleMiddleware(["student"]),
  getQuizAttempt
);

/* Assignments */
router.get(
  "/assignments",
  authMiddleware,
  roleMiddleware(["student"]),
  getMyAssignments
);

export default router;