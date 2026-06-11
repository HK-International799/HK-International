import express from "express";
import multer from "multer";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
  setCourseFee,
  getAllCourseFees,
  getCourseFee,
  recordPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getLearnerPayments,
  getLearnerCourseSummary,
  getLearnerFinanceOverview,
  getFinanceDashboard,
  getRevenueReport,
  getPendingReport,
  exportPaymentsCSV,
} from "../controllers/financeController.js";

const router = express.Router();

// ── Multer: memory storage for proof uploads (routed to Cloudinary) ─────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images (JPEG/PNG/WEBP) and PDFs are allowed"));
    }
  },
});

// ── RBAC helpers ─────────────────────────────────────────────────────────────
// Finance staff, admins, super_admin can manage finance
const financeAccess = roleMiddleware(["admin", "super_admin", "finance"]);

// Students can read their own records (controller enforces ownership)
const selfOrFinance = roleMiddleware([
  "admin",
  "super_admin",
  "finance",
  "student",
]);

// Deletion restricted to super_admin only
const superAdminOnly = roleMiddleware(["super_admin"]);

// All routes require auth
router.use(authMiddleware);

// ── Dashboard ──────────────────────────────────────────────────────────────
router.get("/dashboard", financeAccess, getFinanceDashboard);

// ── Course Fees ────────────────────────────────────────────────────────────
router.post("/fees", financeAccess, setCourseFee);
router.get("/fees", financeAccess, getAllCourseFees);
router.get("/fees/:courseId", financeAccess, getCourseFee);

// ── Payment Records ────────────────────────────────────────────────────────
router.get("/payments", financeAccess, getAllPayments);
router.post("/payments", financeAccess, upload.single("proof"), recordPayment);
router.get("/payments/export", financeAccess, exportPaymentsCSV);
router.get("/payments/:id", financeAccess, getPaymentById);
router.put(
  "/payments/:id",
  financeAccess,
  upload.single("proof"),
  updatePayment,
);
router.delete("/payments/:id", superAdminOnly, deletePayment);

// ── Learner Finance Profile ────────────────────────────────────────────────
// Self (student) or finance staff can view
router.get("/learner/:userId", selfOrFinance, getLearnerFinanceOverview);
router.get("/learner/:userId/payments", selfOrFinance, getLearnerPayments);
router.get(
  "/learner/:userId/course/:courseId/summary",
  selfOrFinance,
  getLearnerCourseSummary,
);

// ── Reports ────────────────────────────────────────────────────────────────
router.get("/reports/revenue", financeAccess, getRevenueReport);
router.get("/reports/pending", financeAccess, getPendingReport);

export default router;
