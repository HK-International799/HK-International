import express from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  assignTutor,
  addSection,
  updateSection,
  deleteSection,
} from "../controllers/courseController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * 🔐 All routes require authentication
 */
router.use(authMiddleware);

/**
 * 📚 Public (Authenticated Users)
 */
router.get("/", getCourses);
router.get("/:id", getCourseById);

/**
 * 🛠 Admin Only
 */
router.post("/", roleMiddleware(["admin"]), createCourse);
router.delete("/:id", roleMiddleware(["admin"]), deleteCourse);
router.post("/:id/assign-tutor", roleMiddleware(["admin"]), assignTutor);

/**
 * ✏️ Admin + Tutor
 */
router.put("/:id", roleMiddleware(["admin", "tutor"]), updateCourse);

/**
 * 📂 Sections (Admin + Tutor)
 */
router.post("/:id/sections", roleMiddleware(["admin", "tutor"]), addSection);
router.put("/sections/:sectionId", roleMiddleware(["admin", "tutor"]), updateSection);
router.delete("/sections/:sectionId", roleMiddleware(["admin", "tutor"]), deleteSection);

export default router;