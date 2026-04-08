import express from "express";
import {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  reviewDocument,
  deleteDocument,
} from "../controllers/documentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import upload from "../middleware/upload.js"; // ✅ YOUR FILE

const router = express.Router();

router.use(authMiddleware);

// ✅ Upload (student)
router.post("/", upload.single("file"), uploadDocument);

// ✅ Get all (role-based inside controller)
router.get("/", getAllDocuments);

// ✅ Get one
router.get("/:id", getDocumentById);

// ✅ Review
router.put("/:id/review", roleMiddleware(["admin", "tutor"]), reviewDocument);

// ✅ Delete
router.delete("/:id", roleMiddleware(["admin"]), deleteDocument);

export default router;