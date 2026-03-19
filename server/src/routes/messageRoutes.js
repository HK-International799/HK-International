import express from "express";
import { sendMessage, getMessages, markRead } from "../controllers/messageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, sendMessage);
router.get("/", authMiddleware, getMessages);
router.put("/:id/read", authMiddleware, markRead);

export default router;
