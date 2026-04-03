import express from "express";
import {
  createAO, getAllAOs, getAOById, updateAO,
  loginAO, getAODashboard, getAOStudentTracking,
  getAOAuditLogs, getAOReports,
} from "../controllers/aoController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// ── Public ─────────────────────────────────────────────────────────────
router.post("/login", loginAO);

// ── Admin: Manage AOs ──────────────────────────────────────────────────
router.post("/", authMiddleware, roleMiddleware(["admin", "super_admin"]), createAO);
router.get("/", authMiddleware, roleMiddleware(["admin", "super_admin"]), getAllAOs);
router.get("/:id", authMiddleware, roleMiddleware(["admin", "super_admin"]), getAOById);
router.put("/:id", authMiddleware, roleMiddleware(["admin", "super_admin"]), updateAO);

// ── AO Portal (read-only) ─────────────────────────────────────────────
router.get("/portal/dashboard", authMiddleware, roleMiddleware(["ao"]), getAODashboard);
router.get("/portal/students", authMiddleware, roleMiddleware(["ao"]), getAOStudentTracking);
router.get("/portal/audit-logs", authMiddleware, roleMiddleware(["ao"]), getAOAuditLogs);
router.get("/portal/reports", authMiddleware, roleMiddleware(["ao"]), getAOReports);

export default router;
