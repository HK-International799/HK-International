import express from "express";
import {
  getStudentDashboard,
  getMyCourses,
  getMyAssignments,
} from "../controllers/studentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware(["student"]),
  getStudentDashboard
);

router.get(
  "/courses",
  authMiddleware,
  roleMiddleware(["student"]),
  getMyCourses
);

router.get(
  "/assignments",
  authMiddleware,
  roleMiddleware(["student"]),
  getMyAssignments
);

export default router;