import express from "express";
import {
  createLesson,
  getLesson,
  deleteLesson,
  updateLesson,
  addMaterial,
  assignQuiz,
} from "../controllers/lessonController.js";
import upload from "../middleware/upload.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// tutor/admin create lesson
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "tutor"]),
  createLesson
);

// get lesson
router.get("/:id", authMiddleware, getLesson);

// delete lesson
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "tutor"]),
  deleteLesson
);


router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "tutor"]),
  updateLesson
);


router.post(
  "/:id/material",
  authMiddleware,
  roleMiddleware(["admin", "tutor"]),
  upload.single("file"),
  addMaterial
);

router.post(
  "/:id/assign-quiz",
  authMiddleware,
  roleMiddleware(["admin", "tutor"]),
  assignQuiz
);

export default router;