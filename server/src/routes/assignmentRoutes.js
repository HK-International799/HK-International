




import express from "express";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  togglePublish,
} from "../controllers/assignmentController.js";
import {
  submitAssignment,
  getMySubmission,
} from "../controllers/submissionController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ── CRUD ────────────────────────────────────────────────────────────────────

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["tutor", "admin"]),
  upload.single("file"),
  createAssignment
);

router.get("/", authMiddleware, getAssignments);
router.get("/:id", authMiddleware, getAssignmentById);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["tutor", "admin"]),
  upload.single("file"),
  updateAssignment
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["tutor", "admin"]),
  deleteAssignment
);

// ── PUBLISH TOGGLE ───────────────────────────────────────────────────────────

router.patch(
  "/:id/publish",
  authMiddleware,
  roleMiddleware(["tutor", "admin"]),
  togglePublish
);

// ── STUDENT SUBMISSION (nested under assignment) ─────────────────────────────

router.post(
  "/:assignmentId/submit",
  authMiddleware,
  roleMiddleware(["student"]),
  upload.single("file"),          // optional .docx / .pdf upload
  submitAssignment
);

router.get(
  "/:assignmentId/my-submission",
  authMiddleware,
  roleMiddleware(["student"]),
  getMySubmission
);

export default router;
