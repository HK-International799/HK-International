// import express from "express";
// import authMiddleware from "../middleware/authMiddleware.js";
// import roleMiddleware from "../middleware/roleMiddleware.js";
// import upload from "../middleware/upload.js";
// import {
//   // admin
//   createExam,
//   updateExam,
//   archiveExam,
//   publishExam,
//   listAllExamsAdmin,
//   getExamDetailsAdmin,
//   uploadScenarioPdf,
//   addScenario,
//   updateScenario,
//   deleteScenario,
//   listSubmissions,
//   getAttemptDetailsAdmin,
//   reviewAttempt,
//   allowReattempt,
//   // student
//   listPublishedExams,
//   getExamDetails,
//   startExam,
//   autosaveAttempt,
//   submitAttempt,
//   listMyAttempts,
//   getFeedback,
//   getMyAttempt,
// } from "../controllers/scenarioExamController.js";

// const router = express.Router();

// // All routes require authentication
// router.use(authMiddleware);

// const adminOnly = roleMiddleware(["admin", "super_admin"]);

// /* ═════════════════════════════════════════════════════════════
//  *                    STUDENT ROUTES
//  * ═════════════════════════════════════════════════════════════ */

// router.get("/my-attempts", listMyAttempts);
// router.get("/attempts/:aId/feedback", getFeedback);
// router.get("/attempts/:aId/me", getMyAttempt);

// router.put("/attempts/:aId/autosave", autosaveAttempt);
// router.post("/attempts/:aId/submit", submitAttempt);

// router.get("/exams", listPublishedExams);
// router.get("/exams/:id", getExamDetails);
// router.post("/exams/:id/start", startExam);

// /* ═════════════════════════════════════════════════════════════
//  *                         ADMIN ROUTES
//  * ═════════════════════════════════════════════════════════════ */

// router.get("/admin/exams", adminOnly, listAllExamsAdmin);
// router.get("/admin/exams/:id", adminOnly, getExamDetailsAdmin);

// router.post("/exams", adminOnly, createExam);
// router.put("/exams/:id", adminOnly, updateExam);
// router.delete("/exams/:id", adminOnly, archiveExam);
// router.put("/exams/:id/publish", adminOnly, publishExam);

// // PDF upload — must come before the JSON scenario add
// router.post(
//   "/exams/:id/upload-pdf",
//   adminOnly,
//   upload.single("scenarioPdf"),
//   uploadScenarioPdf
// );

// // Scenario (question block) CRUD
// router.post("/exams/:id/scenarios", adminOnly, addScenario);
// router.put("/scenarios/:qId", adminOnly, updateScenario);
// router.delete("/scenarios/:qId", adminOnly, deleteScenario);

// // Submissions & review
// router.get("/exams/:id/submissions", adminOnly, listSubmissions);
// router.get("/attempts/:aId", adminOnly, getAttemptDetailsAdmin);
// router.post("/attempts/:aId/review", adminOnly, reviewAttempt);
// router.post("/attempts/:aId/allow-reattempt", adminOnly, allowReattempt);

// export default router;




import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import upload from "../middleware/upload.js";
import {
  // admin
  createExam,
  updateExam,
  archiveExam,
  publishExam,
  listAllExamsAdmin,
  getExamDetailsAdmin,
  uploadScenarioPdf,
  addScenario,
  updateScenario,
  deleteScenario,
  listSubmissions,
  getAttemptDetailsAdmin,
  reviewAttempt,
  aiCheckAttempt,
  allowReattempt,
  // student
  listPublishedExams,
  getExamDetails,
  startExam,
  autosaveAttempt,
  submitAttempt,
  listMyAttempts,
  getFeedback,
  getMyAttempt,
} from "../controllers/scenarioExamController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

const adminOnly = roleMiddleware(["admin", "super_admin"]);

/* ═════════════════════════════════════════════════════════════
 *                    STUDENT ROUTES
 * ═════════════════════════════════════════════════════════════ */

router.get("/my-attempts", listMyAttempts);
router.get("/attempts/:aId/feedback", getFeedback);
router.get("/attempts/:aId/me", getMyAttempt);

router.put("/attempts/:aId/autosave", autosaveAttempt);
router.post("/attempts/:aId/submit", submitAttempt);

router.get("/exams", listPublishedExams);
router.get("/exams/:id", getExamDetails);
router.post("/exams/:id/start", startExam);

/* ═════════════════════════════════════════════════════════════
 *                         ADMIN ROUTES
 * ═════════════════════════════════════════════════════════════ */

router.get("/admin/exams", adminOnly, listAllExamsAdmin);
router.get("/admin/exams/:id", adminOnly, getExamDetailsAdmin);

router.post("/exams", adminOnly, createExam);
router.put("/exams/:id", adminOnly, updateExam);
router.delete("/exams/:id", adminOnly, archiveExam);
router.put("/exams/:id/publish", adminOnly, publishExam);

// PDF upload — must come before the JSON scenario add
router.post(
  "/exams/:id/upload-pdf",
  adminOnly,
  upload.single("scenarioPdf"),
  uploadScenarioPdf
);

// Scenario (question block) CRUD
router.post("/exams/:id/scenarios", adminOnly, addScenario);
router.put("/scenarios/:qId", adminOnly, updateScenario);
router.delete("/scenarios/:qId", adminOnly, deleteScenario);

// Submissions & review
router.get("/exams/:id/submissions", adminOnly, listSubmissions);
router.get("/attempts/:aId", adminOnly, getAttemptDetailsAdmin);
router.post("/attempts/:aId/review", adminOnly, reviewAttempt);
router.post("/attempts/:aId/ai-check", adminOnly, aiCheckAttempt);
router.post("/attempts/:aId/allow-reattempt", adminOnly, allowReattempt);

export default router;
