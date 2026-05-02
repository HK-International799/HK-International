

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
//   roleMiddleware(["tutor", "admin"]),
//   listSubmissions
// );

// // ✅ GET /api/submissions/:id
// router.get(
//   "/:id",
//   authMiddleware,
//   roleMiddleware(["tutor", "admin", "student"]),
//   getSubmissionById
// );

// // ✅ PUT /api/submissions/:id/grade
// router.put(
//   "/:id/grade",
//   authMiddleware,
//   roleMiddleware(["tutor", "admin"]),
//   gradeSubmission
// );

// // ✅ PATCH /api/submissions/:id/annotations
// router.patch(
//   "/:id/annotations",
//   authMiddleware,
//   roleMiddleware(["tutor", "admin"]),
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
  roleMiddleware(["tutor", "admin"]),
  listSubmissions
);

// ✅ GET /api/submissions/:id
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["tutor", "admin", "student"]),
  getSubmissionById
);

// ✅ PUT /api/submissions/:id/grade
router.put(
  "/:id/grade",
  authMiddleware,
  roleMiddleware(["tutor", "admin"]),
  gradeSubmission
);

// ✅ PATCH /api/submissions/:id/annotations
router.patch(
  "/:id/annotations",
  authMiddleware,
  roleMiddleware(["tutor", "admin"]),
  saveAnnotations
);

export default router;