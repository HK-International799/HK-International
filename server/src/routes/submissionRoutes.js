import express from "express";
import { submitAssignment, gradeSubmission } from "../controllers/submissionController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["student"]), submitAssignment);
router.put("/:id/grade", authMiddleware, roleMiddleware(["tutor", "admin"]), gradeSubmission);

export default router;
