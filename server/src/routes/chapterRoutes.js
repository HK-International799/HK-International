import express from "express";
import {
  getChaptersByCourse,
  createChapter,
  updateChapter,
  deleteChapter,
  uploadChapterDocument,
  createChapterQuiz,
  addQuizQuestion,
  getChapterQuiz,
  submitChapterQuiz,
  getStudentProgress,
} from "../controllers/chapterController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/* ── Course-level chapter listing ─────────────────────────────── */
// GET /api/chapters/course/:courseId  — get all chapters for a course
router.get("/course/:courseId", getChaptersByCourse);

/* ── Student progress ─────────────────────────────────────────── */
// GET /api/chapters/progress/:courseId
router.get(
  "/progress/:courseId",
  roleMiddleware(["student"]),
  getStudentProgress,
);

/* ── Chapter CRUD (Admin / Tutor only) ────────────────────────── */
// POST /api/chapters  — create new chapter
router.post("/", roleMiddleware(["admin", "tutor", "super_admin"]), createChapter);

// PUT /api/chapters/:id  — update chapter info
router.put("/:id", roleMiddleware(["admin", "tutor", "super_admin"]), updateChapter);

// DELETE /api/chapters/:id  — remove chapter + quiz
router.delete("/:id", roleMiddleware(["admin"]), deleteChapter);

/* ── Document upload ──────────────────────────────────────────── */
// POST /api/chapters/:id/upload-document  — upload PDF/DOC
router.post(
  "/:id/upload-document",
  roleMiddleware(["admin", "tutor", "super_admin"]),
  upload.single("document"),
  uploadChapterDocument,
);

/* ── Quiz management (Admin / Tutor) ──────────────────────────── */
// POST /api/chapters/:id/create-quiz  — create quiz for chapter
router.post(
  "/:id/create-quiz",
  roleMiddleware(["admin", "tutor", "super_admin"]),
  createChapterQuiz,
);

// POST /api/chapters/:id/quiz/add-question  — add MCQ question
router.post(
  "/:id/quiz/add-question",
  roleMiddleware(["admin", "tutor", "super_admin"]),
  addQuizQuestion,
);

// GET /api/chapters/:id/quiz  — get quiz with questions
router.get("/:id/quiz", getChapterQuiz);

/* ── Quiz submission (Student) ────────────────────────────────── */
// POST /api/chapters/:id/submit-quiz
router.post("/:id/submit-quiz", roleMiddleware(["student"]), submitChapterQuiz);

export default router;
