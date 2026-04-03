import express from "express";
import {
  registerInstitute, loginInstitute,
  getAllInstitutes, getInstituteById, approveRejectInstitute,
  addStudent, bulkUploadStudents, uploadInstituteDocument,
  createRegistration, getInstituteRegistrations, getInstituteDashboard,
} from "../controllers/partnerInstituteController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { uploadMemory } from "../middleware/upload.js";

const router = express.Router();

// ── Public ─────────────────────────────────────────────────────────────
router.post("/register", registerInstitute);
router.post("/login", loginInstitute);

// ── Admin: Manage Institutes ───────────────────────────────────────────
router.get("/", authMiddleware, roleMiddleware(["admin", "super_admin"]), getAllInstitutes);
router.get("/:id", authMiddleware, roleMiddleware(["admin", "super_admin"]), getInstituteById);
router.patch("/:id/status", authMiddleware, roleMiddleware(["admin", "super_admin"]), approveRejectInstitute);

// ── Partner Institute Portal ───────────────────────────────────────────
router.get("/portal/dashboard", authMiddleware, roleMiddleware(["partner_institute"]), getInstituteDashboard);
router.post("/portal/students", authMiddleware, roleMiddleware(["partner_institute"]), addStudent);
router.post("/portal/students/bulk", authMiddleware, roleMiddleware(["partner_institute"]), uploadMemory.single("file"), bulkUploadStudents);
router.post("/portal/documents", authMiddleware, roleMiddleware(["partner_institute"]), uploadInstituteDocument);
router.post("/portal/registrations", authMiddleware, roleMiddleware(["partner_institute"]), createRegistration);
router.get("/portal/registrations", authMiddleware, roleMiddleware(["partner_institute"]), getInstituteRegistrations);

export default router;
