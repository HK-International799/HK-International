import express from "express";
import { createAssignment, getAssignments } from "../controllers/assignmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["tutor", "admin"]), createAssignment);
router.get("/", authMiddleware, getAssignments);

export default router;
