import Message from "../models/Message.js";
import BlockedUser from "../models/BlockedUser.js";

/* ───────────────── HELPER ───────────────── */
const emitToRoom = (req, roomId, event, payload) => {
  const io = req.app.get("io");
  if (io && roomId) {
    io.to(roomId).emit(event, payload);
  }
};

/* ─── SEND MESSAGE (API FALLBACK + REALTIME) ─── */
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, courseId, content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    if (!receiverId && !courseId) {
      return res
        .status(400)
        .json({ message: "receiverId or courseId is required" });
    }

    // Block check
    const blocked = await BlockedUser.findOne({ userId: req.user.id });
    if (blocked) {
      return res
        .status(403)
        .json({ message: "You are blocked from sending messages" });
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId: receiverId || null,
      courseId: courseId || null,
      content: content.trim(),
      messageType: courseId ? "course" : "direct",
    });

    const populated = await Message.findById(message._id)
      .populate("senderId", "name role email avatar")
      .populate("receiverId", "name role email avatar");

    // Realtime emit for course messages
    if (courseId) {
      emitToRoom(req, courseId, "course:message", populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message", error: err.message });
  }
};

/* ─── GET MESSAGES ─── */
export const getMessages = async (req, res) => {
  try {
    const { courseId, userId, page = 1, limit = 50 } = req.query;

    if (!courseId && !userId) {
      return res.status(400).json({ message: "courseId or userId is required" });
    }

    let query = { isDeleted: false };

    if (courseId) {
      query.courseId = courseId;
      query.messageType = "course";
    } else if (userId) {
      query.messageType = "direct";
      query.$or = [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, total] = await Promise.all([
      Message.find(query)
        .populate("senderId", "name role avatar")
        .populate("receiverId", "name role avatar")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Message.countDocuments(query),
    ]);

    res.json({ messages, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err.message });
  }
};

/* ─── MARK READ ─── */
export const markRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Only receiver can mark as read
    if (String(message.receiverId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    message.isRead = true;
    await message.save();

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read", error: err.message });
  }
};

/* ─── ADMIN: GET COURSE MESSAGES ─── */
export const adminGetCourseMessages = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { from, to, page = 1, limit = 100 } = req.query;

    const query = { courseId, isDeleted: false, messageType: "course" };

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, total] = await Promise.all([
      Message.find(query)
        .populate("senderId", "name role email avatar")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Message.countDocuments(query),
    ]);

    res.json({ messages, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err.message });
  }
};

/* ─── ADMIN: SEND MESSAGE ─── */
export const adminSendMessage = async (req, res) => {
  try {
    const { courseId, content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }
    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const message = await Message.create({
      senderId: req.user.id,
      courseId,
      content: content.trim(),
      messageType: "course",
    });

    const populated = await Message.findById(message._id).populate(
      "senderId",
      "name role email avatar"
    );

    // Realtime emit
    emitToRoom(req, courseId, "course:message", populated);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message", error: err.message });
  }
};

/* ─── ADMIN: DELETE ALL MESSAGES IN COURSE ─── */
export const adminDeleteMessages = async (req, res) => {
  try {
    const { courseId, from, to } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const query = { courseId, isDeleted: false };
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const result = await Message.updateMany(query, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    // Realtime notify
    emitToRoom(req, courseId, "course:messagesCleared", { courseId });

    res.json({ message: "Messages deleted", count: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete messages", error: err.message });
  }
};

/* ─── ADMIN: DELETE SINGLE MESSAGE ─── */
export const adminDeleteSingleMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Realtime notify course room
    if (message.courseId) {
      emitToRoom(req, String(message.courseId), "course:messageDeleted", {
        messageId,
      });
    }

    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete message", error: err.message });
  }
};

/* ─── ADMIN: DOWNLOAD MESSAGES AS CSV ─── */
export const adminDownloadMessages = async (req, res) => {
  try {
    const { courseId, from, to } = req.query;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const query = { courseId, isDeleted: false };
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const messages = await Message.find(query)
      .populate("senderId", "name role email")
      .sort({ createdAt: 1 });

    const rows = [["Date", "Time", "Sender", "Role", "Email", "Message"]];

    messages.forEach((m) => {
      const d = new Date(m.createdAt);
      rows.push([
        d.toLocaleDateString(),
        d.toLocaleTimeString(),
        m.senderId?.name || "Unknown",
        m.senderId?.role || "",
        m.senderId?.email || "",
        `"${(m.content || "").replace(/"/g, '""')}"`,
      ]);
    });

    const csv = rows.map((r) => r.join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="chat-${courseId}-${Date.now()}.csv"`
    );
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Download failed", error: err.message });
  }
};

/* ─── BLOCK / UNBLOCK USER ─── */
export const blockUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const exists = await BlockedUser.findOne({ userId });
    if (exists) {
      return res.status(400).json({ message: "User is already blocked" });
    }

    const blocked = await BlockedUser.create({
      userId,
      blockedBy: req.user.id,
      reason: reason || "",
    });

    const populated = await BlockedUser.findById(blocked._id).populate(
      "userId",
      "name email role"
    );

    res.status(201).json({ message: "User blocked", data: populated });
  } catch (err) {
    res.status(500).json({ message: "Failed to block user", error: err.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await BlockedUser.findOneAndDelete({ userId });
    if (!result) {
      return res.status(404).json({ message: "User is not blocked" });
    }

    res.json({ message: "User unblocked" });
  } catch (err) {
    res.status(500).json({ message: "Failed to unblock user", error: err.message });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const users = await BlockedUser.find()
      .populate("userId", "name email role avatar")
      .populate("blockedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch blocked users", error: err.message });
  }
};