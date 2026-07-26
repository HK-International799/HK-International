import express from "express";
import multer from "multer";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
  getSenderSettings,
  updateSenderSettings,
  getDispatchDashboard,
  listDispatchCertificates,
  getDispatchCertificateById,
  getLearnerDispatchHistory,
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  addCertificatesToBatch,
  removeCertificateFromBatch,
  bookSpeedPost,
  deleteBatch,
  updateCertificateStatus,
  getExpenseCategories,
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getDispatchReport,
  exportDispatchReportCSV,
} from "../controllers/dispatchController.js";

const router = express.Router();

// ── Multer: bill/receipt uploads (images + PDF), same limits as elsewhere ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only images (JPEG/PNG/WEBP) and PDFs are allowed"));
  },
});

// ── RBAC ─────────────────────────────────────────────────────────────────────
// NOTE: the existing User.role enum has no dedicated "dispatch staff" /
// "read only" tier (per spec). Until that's added system-wide, dispatch
// access is granted to admin/super_admin (who already manage every other
// admin-panel module); destructive actions are additionally restricted to
// super_admin only, per the required permission matrix.
const dispatchAccess = roleMiddleware(["admin", "super_admin"]);
const superAdminOnly = roleMiddleware(["super_admin"]);

router.use(authMiddleware);

// Sender settings
router.get("/sender", dispatchAccess, getSenderSettings);
router.put("/sender", superAdminOnly, updateSenderSettings);

// Dashboard
router.get("/dashboard", dispatchAccess, getDispatchDashboard);

// Certificates (list/search/filter + detail)
router.get("/certificates", dispatchAccess, listDispatchCertificates);
router.get("/certificates/:id", dispatchAccess, getDispatchCertificateById);
router.patch("/certificates/status", dispatchAccess, updateCertificateStatus);
router.get("/learners/:learnerId/history", dispatchAccess, getLearnerDispatchHistory);

// Batches
router.post("/batches", dispatchAccess, createBatch);
router.get("/batches", dispatchAccess, getAllBatches);
router.get("/batches/:id", dispatchAccess, getBatchById);
router.put("/batches/:id", dispatchAccess, updateBatch);
router.post("/batches/:id/certificates", dispatchAccess, addCertificatesToBatch);
router.delete("/batches/:id/certificates/:certificateId", dispatchAccess, removeCertificateFromBatch);
router.post("/batches/:id/book-speed-post", dispatchAccess, bookSpeedPost);
router.delete("/batches/:id", superAdminOnly, deleteBatch);

// Expenses
router.get("/expenses/categories", dispatchAccess, getExpenseCategories);
router.get("/expenses", dispatchAccess, getAllExpenses);
router.post("/expenses", dispatchAccess, upload.single("bill"), createExpense);
router.get("/expenses/:id", dispatchAccess, getExpenseById);
router.put("/expenses/:id", dispatchAccess, upload.single("bill"), updateExpense);
router.delete("/expenses/:id", superAdminOnly, deleteExpense);

// Reports
router.get("/reports", dispatchAccess, getDispatchReport);
router.get("/reports/export", dispatchAccess, exportDispatchReportCSV);

export default router;
