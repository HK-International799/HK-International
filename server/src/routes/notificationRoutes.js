import express from "express";
import { pushNotification, getNotifications } from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, pushNotification);
router.get("/", authMiddleware, getNotifications);

export default router;
