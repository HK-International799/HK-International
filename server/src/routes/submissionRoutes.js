

// import express from "express";
// import authMiddleware from "../middleware/authMiddleware.js";
// import roleMiddleware from "../middleware/roleMiddleware.js";

// import {
//   submitAssignment,
//   getMySubmission,
//   listSubmissions,
//   getSubmissionById,
//   gradeSubmission,
//   saveAnnotations,
// } from "../controllers/submissionController.js";

// import upload from "../middleware/upload.js";

// const router = express.Router();

// // ─────────────────────────────────────────────
// // 🧑‍🎓 STUDENT ROUTES
// // ─────────────────────────────────────────────

// // POST /api/submissions/assignments/:assignmentId/submit
// router.post(
//   "/assignments/:assignmentId/submit",
//   authMiddleware,
//   roleMiddleware(["student"]),
//   upload.single("file"),
//   submitAssignment
// );

// // GET /api/submissions/assignments/:assignmentId/my-submission
// router.get(
//   "/assignments/:assignmentId/my-submission",
//   authMiddleware,
//   roleMiddleware(["student"]),
//   getMySubmission
// );

// // ─────────────────────────────────────────────
// // 👨‍🏫 ADMIN / TUTOR ROUTES
// // ─────────────────────────────────────────────

// // ✅ GET /api/submissions
// router.get(
//   "/",
//   authMiddleware,
//   roleMiddleware(["tutor", "admin", "super_admin"]),
//   listSubmissions
// );

// // ✅ GET /api/submissions/:id
// router.get(
//   "/:id",
//   authMiddleware,
//   roleMiddleware(["tutor", "admin", "super_admin", "student"]),
//   getSubmissionById
// );

// // ✅ PUT /api/submissions/:id/grade
// router.put(
//   "/:id/grade",
//   authMiddleware,
//   roleMiddleware(["tutor", "admin", "super_admin"]),
//   gradeSubmission
// );

// // ✅ PATCH /api/submissions/:id/annotations
// router.patch(
//   "/:id/annotations",
//   authMiddleware,
//   roleMiddleware(["tutor", "admin", "super_admin"]),
//   saveAnnotations
// );

// export default router;




import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
  submitAssignment,
  getMySubmission,
  listSubmissions,
  getSubmissionById,
  gradeSubmission,
  saveAnnotations,
  aiGradeText,
  aiReviewProject,
  acceptAiDraft,
  approveSubmission,
  requestResubmission,
} from "../controllers/submissionController.js";

import upload from "../middleware/upload.js";

const router = express.Router();

// ─────────────────────────────────────────────
// 🧑‍🎓 STUDENT ROUTES
// ─────────────────────────────────────────────

// POST /api/submissions/assignments/:assignmentId/submit
router.post(
  "/assignments/:assignmentId/submit",
  authMiddleware,
  roleMiddleware(["student"]),
  upload.single("file"),
  submitAssignment
);

// GET /api/submissions/assignments/:assignmentId/my-submission
router.get(
  "/assignments/:assignmentId/my-submission",
  authMiddleware,
  roleMiddleware(["student"]),
  getMySubmission
);

// ─────────────────────────────────────────────
// 👨‍🏫 ADMIN / TUTOR ROUTES
// ─────────────────────────────────────────────

// ✅ GET /api/submissions
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["tutor", "admin", "super_admin"]),
  listSubmissions
);

// ✅ GET /api/submissions/:id
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["tutor", "admin", "super_admin", "student"]),
  getSubmissionById
);

// ✅ PUT /api/submissions/:id/grade
router.put(
  "/:id/grade",
  authMiddleware,
  roleMiddleware(["tutor", "admin", "super_admin"]),
  gradeSubmission
);

// ✅ PATCH /api/submissions/:id/annotations
router.patch(
  "/:id/annotations",
  authMiddleware,
  roleMiddleware(["tutor", "admin", "super_admin"]),
  saveAnnotations
);

// ─────────────────────────────────────────────
// 🤖 MODULE 5 — AI GRADING ENGINE (additive)
// ─────────────────────────────────────────────

// POST /api/submissions/:id/ai-grade-text
router.post(
  "/:id/ai-grade-text",
  authMiddleware,
  roleMiddleware(["tutor", "admin", "super_admin"]),
  aiGradeText
);

// POST /api/submissions/:id/ai-review-project
router.post(
  "/:id/ai-review-project",
  authMiddleware,
  roleMiddleware(["tutor", "admin", "super_admin"]),
  aiReviewProject
);

// ─────────────────────────────────────────────
// ✅ MODULE 6 — ADMIN SUBMISSION REVIEW (additive)
// ─────────────────────────────────────────────

// PATCH /api/submissions/:id/accept-ai-draft
router.patch(
  "/:id/accept-ai-draft",
  authMiddleware,
  roleMiddleware(["tutor", "admin", "super_admin"]),
  acceptAiDraft
);

// PATCH /api/submissions/:id/approve
router.patch(
  "/:id/approve",
  authMiddleware,
  roleMiddleware(["tutor", "admin", "super_admin"]),
  approveSubmission
);

// PATCH /api/submissions/:id/request-resubmission
router.patch(
  "/:id/request-resubmission",
  authMiddleware,
  roleMiddleware(["tutor", "admin", "super_admin"]),
  requestResubmission
);

export default router;