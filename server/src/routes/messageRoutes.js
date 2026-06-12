import express from "express";
import {
  sendMessage,
  getMessages,
  markRead,
  adminGetCourseMessages,
  adminDeleteMessages,
  adminDownloadMessages,
  adminSendMessage,
  blockUser,
  unblockUser,
  getBlockedUsers,
  adminDeleteSingleMessage,
} from "../controllers/messageController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/* ─── Student / Tutor ───────────────────────── */
router.post("/", authMiddleware, sendMessage);
router.get("/", authMiddleware, getMessages);
router.put("/:id/read", authMiddleware, markRead);

/* ─── Admin: Course Messages ───────────────── */
router.get(
  "/admin/course/:courseId",
  authMiddleware,
  roleMiddleware(["admin", "super_admin"]),
  adminGetCourseMessages
);

router.post(
  "/admin/send",
  authMiddleware,
  roleMiddleware(["admin", "super_admin"]),
  adminSendMessage
);

router.delete(
  "/admin/delete",
  authMiddleware,
  roleMiddleware(["admin", "super_admin"]),
  adminDeleteMessages
);

router.get(
  "/admin/download",
  authMiddleware,
  roleMiddleware(["admin", "super_admin"]),
  adminDownloadMessages
);

router.delete(
  "/admin/message/:messageId",
  authMiddleware,
  roleMiddleware(["admin", "super_admin"]),
  adminDeleteSingleMessage
);

/* ─── Block System ───────────────────────── */
router.post(
  "/admin/block",
  authMiddleware,
  roleMiddleware(["admin", "super_admin"]),
  blockUser
);

router.delete(
  "/admin/block/:userId",
  authMiddleware,
  roleMiddleware(["admin", "super_admin"]),
  unblockUser
);

router.get(
  "/admin/blocked",
  authMiddleware,
  roleMiddleware(["admin", "super_admin"]),
  getBlockedUsers
);

export default router;