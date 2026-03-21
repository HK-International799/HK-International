import express from "express";
import {
  submitAssignment,
  getMySubmissions,
  getMySubmissionForAssignment,
  getSubmissionsByAssignment,
  getSubmissionById,
  gradeSubmission,
} from "../controllers/submissionController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["student"]), submitAssignment);

router.get("/my", authMiddleware, roleMiddleware(["student"]), getMySubmissions);
router.get(
  "/assignment/:assignmentId/my",
  authMiddleware,
  roleMiddleware(["student"]),
  getMySubmissionForAssignment
);

router.get(
  "/assignment/:assignmentId",
  authMiddleware,
  roleMiddleware(["tutor", "admin"]),
  getSubmissionsByAssignment
);

router.get("/:id", authMiddleware, getSubmissionById);

router.put(
  "/:id/grade",
  authMiddleware,
  roleMiddleware(["tutor", "admin"]),
  gradeSubmission
);

export default router;