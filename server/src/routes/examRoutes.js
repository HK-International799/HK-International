// routes/examRoutes.js

import express from "express";
const router = express.Router();

import examCtrl from "../controllers/examController.js";
import attemptCtrl from "../controllers/attemptController.js";
import authMiddleware from "../middleware/authMiddleware.js";

// ─────────────────────────────────────────────────────────────────────────────
// RULE: Specific static-segment routes MUST come before /:id wildcard routes.
// ─────────────────────────────────────────────────────────────────────────────

// ── Exam Management ───────────────────────────────────────────────────────────

// Create exam
router.post("/create", authMiddleware, examCtrl.createExam);

// List all exams (admin)
router.get("/", authMiddleware, examCtrl.listExams);

// List active exams (student-facing)
router.get("/active", authMiddleware, examCtrl.listActiveExams);

// Question count for a course (must be before /:id)
router.get(
  "/course/:courseId/question-count",
  authMiddleware,
  examCtrl.getCourseQuestionCount,
);

// ── Student Attempt Flow ──────────────────────────────────────────────────────

// Start an exam
router.post("/:id/start", authMiddleware, attemptCtrl.startExam);

// Auto-save a single answer during the exam
router.patch("/:id/answer", authMiddleware, attemptCtrl.saveAnswer);

// Submit exam (with optional final answers batch)
router.post("/:id/submit", authMiddleware, attemptCtrl.submitExam);

// Get result for a specific attempt (student)
router.get(
  "/:id/result/:attemptId",
  authMiddleware,
  attemptCtrl.getAttemptResult,
);

// ── Admin Reports & Feedback ──────────────────────────────────────────────────

// Full exam report (all submissions)
router.get("/:id/report", authMiddleware, attemptCtrl.getExamReport);

// Download full exam report (CSV)
router.get(
  "/:id/report/download",
  authMiddleware,
  attemptCtrl.downloadExamReport,
);

// Detailed single attempt view
router.get(
  "/:id/report/:attemptId",
  authMiddleware,
  attemptCtrl.getAttemptDetail,
);

// Add/update admin feedback for an attempt
router.post(
  "/:id/feedback/:attemptId",
  authMiddleware,
  attemptCtrl.addFeedback,
);

// Regenerate question pool for an existing exam
router.post("/:id/regenerate", authMiddleware, examCtrl.regenerateQuestions);

// ── Generic Exam CRUD (keep LAST – wildcard routes) ───────────────────────────

// Get single exam by ID
router.get("/:id", authMiddleware, examCtrl.getExam);

// Update exam settings (title, timeLimit, etc.) – does NOT change question pool
router.put("/:id", authMiddleware, examCtrl.updateExam);

// Toggle active / inactive
router.patch("/:id/toggle", authMiddleware, examCtrl.toggleExamStatus);

// Delete exam
router.delete("/:id", authMiddleware, examCtrl.deleteExam);

export default router;
