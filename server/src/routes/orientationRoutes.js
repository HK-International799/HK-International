import express from "express";
import {
  createSession, getAllSessions, getSessionById, updateSession, deleteSession,
  markAttendance, bulkMarkAttendance, uploadAttendanceCSV, getSessionAttendance,
  createOrientationQuiz, attemptOrientationQuiz, getQuizResults,
} from "../controllers/orientationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { uploadMemory } from "../middleware/upload.js";

const router = express.Router();

router.use(authMiddleware);

// ── Session CRUD (admin/tutor) ─────────────────────────────────────────
router.post("/sessions", roleMiddleware(["admin", "super_admin", "tutor"]), createSession);
router.get("/sessions", getAllSessions);
router.get("/sessions/:id", getSessionById);
router.put("/sessions/:id", roleMiddleware(["admin", "super_admin", "tutor"]), updateSession);
router.delete("/sessions/:id", roleMiddleware(["admin", "super_admin"]), deleteSession);

// ── Attendance ─────────────────────────────────────────────────────────
router.post("/sessions/:sessionId/attendance", roleMiddleware(["admin", "super_admin", "tutor"]), markAttendance);
router.post("/sessions/:sessionId/attendance/bulk", roleMiddleware(["admin", "super_admin", "tutor"]), bulkMarkAttendance);
router.post("/sessions/:sessionId/attendance/csv", roleMiddleware(["admin", "super_admin", "tutor"]), uploadMemory.single("file"), uploadAttendanceCSV);
router.get("/sessions/:sessionId/attendance", roleMiddleware(["admin", "super_admin", "tutor", "ao"]), getSessionAttendance);

// ── Quiz ───────────────────────────────────────────────────────────────
router.post("/sessions/:sessionId/quiz", roleMiddleware(["admin", "super_admin", "tutor"]), createOrientationQuiz);
router.post("/sessions/:sessionId/quiz/attempt", roleMiddleware(["student"]), attemptOrientationQuiz);
router.get("/sessions/:sessionId/quiz/results", roleMiddleware(["admin", "super_admin", "tutor", "ao"]), getQuizResults);

export default router;
