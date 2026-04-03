import express from "express";
import {
  pushNotification, getNotifications, getNotificationById,
  markNotificationRead, markNotificationsRead, markAllNotificationsRead,
  deleteNotification, deleteNotifications, getUnreadCount, clearAllNotifications,
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Create (admin only)
router.post("/", roleMiddleware(["admin", "super_admin"]), pushNotification);

// Read
router.get("/", getNotifications);
router.get("/unread/count", getUnreadCount);
router.get("/:id", getNotificationById);

// Update
router.patch("/:id/read", markNotificationRead);
router.patch("/batch/read", markNotificationsRead);
router.patch("/mark-all/read", markAllNotificationsRead);

// Delete
router.delete("/clear/all", clearAllNotifications);
router.delete("/batch/delete", deleteNotifications);
router.delete("/:id", deleteNotification);

export default router;
