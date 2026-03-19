import express from "express";
import { getCourses, getCourseById } from "../controllers/courseController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getCourses);
router.get("/:id", authMiddleware, getCourseById);

export default router;