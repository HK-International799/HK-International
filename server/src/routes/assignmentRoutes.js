import express from "express";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import upload from "../middleware/upload.js";


const router = express.Router();


router.post(
  "/",
  authMiddleware,
  roleMiddleware(["tutor", "admin"]),
  upload.single("file"),
  createAssignment,
);
router.get("/", authMiddleware, getAssignments);
router.get("/:id", authMiddleware, getAssignmentById);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["tutor", "admin"]),
  updateAssignment,
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["tutor", "admin"]),
  deleteAssignment,
);

export default router;
