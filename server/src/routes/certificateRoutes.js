import express from "express";
import {
  issueCertificate, getAllCertificates, getCertificateById,
  revokeCertificate, deleteCertificate, downloadCertificatePDF,
  verifyCertificate, regenerateCertificatePDF,
} from "../controllers/certificateController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public: verify certificate
router.get("/verify/:certificateNumber", verifyCertificate);

router.use(authMiddleware);

router.post("/", roleMiddleware(["admin", "super_admin"]), issueCertificate);
router.get("/", getAllCertificates);
router.get("/:id", getCertificateById);
router.get("/:id/download", downloadCertificatePDF);
router.post("/:id/regenerate", roleMiddleware(["admin", "super_admin"]), regenerateCertificatePDF);
router.patch("/:id/revoke", roleMiddleware(["admin", "super_admin"]), revokeCertificate);
router.delete("/:id", roleMiddleware(["admin", "super_admin"]), deleteCertificate);

export default router;
