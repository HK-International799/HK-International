import express from "express";
import {
  getRegistrationCourses,
  createRegistration,
  uploadRegistrationDocuments,
  getRegistrationStatus,
} from "../controllers/registrationController.js";
import { uploadRegistrationDocs } from "../middleware/upload.js";

const router = express.Router();

// Public — no authMiddleware on purpose (this is the self-registration flow).
router.get("/courses", getRegistrationCourses);
router.post("/", createRegistration);
router.post(
  "/:id/documents",
  uploadRegistrationDocs.fields([
    { name: "governmentId", maxCount: 1 },
    { name: "additional", maxCount: 5 },
  ]),
  uploadRegistrationDocuments,
);
router.get("/:id", getRegistrationStatus);

export default router;
