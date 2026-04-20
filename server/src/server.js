import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import connectDB from "./config/db.js";
import Message from "./models/Message.js";
import BlockedUser from "./models/BlockedUser.js";
import app from "./app.js";

const httpServer = createServer(app);

/* ───────────────── SOCKET.IO CONFIG ───────────────── */
const io = new SocketServer(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [
            process.env.CLIENT_URL_ADMIN,
            process.env.CLIENT_URL_STUDENT,
            process.env.CLIENT_URL_TUTOR,
            process.env.CLIENT_URL_PARTNER,
            process.env.CLIENT_URL_AO,
          ].filter(Boolean)
        : [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
          ],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

/* ───────────────── STORE ONLINE USERS ───────────────── */
// Map: userId -> Set of socketIds (supports multiple tabs)
const onlineUsers = new Map();

const addOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
};

const removeOnlineUser = (socketId) => {
  for (const [userId, sockets] of onlineUsers.entries()) {
    if (sockets.has(socketId)) {
      sockets.delete(socketId);
      if (sockets.size === 0) onlineUsers.delete(userId);
      return userId;
    }
  }
  return null;
};

const getOnlineUserIds = () => Array.from(onlineUsers.keys());

const getSocketForUser = (userId) => {
  const sockets = onlineUsers.get(userId);
  if (!sockets || sockets.size === 0) return null;
  return [...sockets][0]; // Return first socket
};

// 🔔 Emit notification to user (all active sockets)
const emitNotificationToUser = (userId, payload) => {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return;

  for (const socketId of sockets) {
    io.to(socketId).emit("notification", payload);
  }
};

/* ───────────────── SOCKET EVENTS ───────────────── */
io.on("connection", (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  /* ─── USER ONLINE ─── */
  socket.on("user:online", ({ userId, role }) => {
    if (!userId) return;
    addOnlineUser(userId, socket.id);
    // ✅ store role on socket
    socket.userId = userId;
    socket.userRole = role;
    io.emit("users:online", getOnlineUserIds());
  });

  /* ─── DIRECT MESSAGE ─── */
  socket.on("message:send", async (data) => {
    try {
      const { senderId, receiverId, content, courseId } = data;
      if (!senderId || !content?.trim()) return;

      // Block check
      const isBlocked = await BlockedUser.findOne({ userId: senderId });
      if (isBlocked) {
        return socket.emit("message:error", {
          error: "You are blocked from sending messages",
        });
      }

      const message = await Message.create({
        senderId,
        receiverId,
        content: content.trim(),
        courseId: courseId || null,
        messageType: "direct",
      });

      const populated = await Message.findById(message._id)
        .populate("senderId", "name email avatar role")
        .populate("receiverId", "name email avatar role");

      if (receiverId) {
        const receiverSocket = getSocketForUser(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket).emit("message:received", populated);
        }
      }

      socket.emit("message:sent", populated);
    } catch (err) {
      console.error("❌ message:send error:", err.message);
      socket.emit("message:error", { error: err.message });
    }
  });

  /* ─── READ RECEIPT ─── */
  socket.on("message:read", async ({ senderId, receiverId }) => {
    try {
      await Message.updateMany(
        { senderId, receiverId, isRead: false },
        { isRead: true },
      );

      const senderSocket = getSocketForUser(senderId);
      if (senderSocket) {
        io.to(senderSocket).emit("message:read-ack", { readBy: receiverId });
      }
    } catch (err) {
      console.error("❌ read error:", err.message);
    }
  });

  /* ─── TYPING EVENTS ─── */
  socket.on("typing:start", ({ senderId, receiverId }) => {
    const receiverSocket = getSocketForUser(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("typing:start", { senderId });
    }
  });

  socket.on("typing:stop", ({ senderId, receiverId }) => {
    const receiverSocket = getSocketForUser(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("typing:stop", { senderId });
    }
  });

  /* ───────────────── COURSE CHAT ───────────────── */

  /* JOIN ROOM */
  socket.on("course:join", ({ courseId, userId }) => {
    if (!courseId) return;
    socket.join(courseId);
    console.log(`📚 User ${userId} joined course room: ${courseId}`);
  });

  /* LEAVE ROOM */
  socket.on("course:leave", ({ courseId, userId }) => {
    if (!courseId) return;
    socket.leave(courseId);
    console.log(`🚪 User ${userId} left course room: ${courseId}`);
  });

  /* SEND COURSE MESSAGE */
  socket.on("course:message", async (data) => {
    try {
      const { senderId, courseId, content } = data;
      if (!senderId || !courseId || !content?.trim()) return;

      // Block check
      const isBlocked = await BlockedUser.findOne({ userId: senderId });
      if (isBlocked) {
        return socket.emit("message:error", {
          error: "You are blocked from sending messages",
        });
      }

      const message = await Message.create({
        senderId,
        courseId,
        content: content.trim(),
        messageType: "course",
      });

      const populated = await Message.findById(message._id).populate(
        "senderId",
        "name role email avatar",
      );

      // 🔥 Existing: Send message to course
      io.to(courseId).emit("course:message", populated);

      /* ───────── 🔔 NEW: NOTIFICATIONS ───────── */

      const senderRole = populated.senderId?.role;

      // CASE 1: Student → Notify Admins
      if (senderRole === "student") {
        for (const [userId, sockets] of onlineUsers.entries()) {
          for (const socketId of sockets) {
            const s = io.sockets.sockets.get(socketId);

            if (s?.userRole === "admin" && s.userId !== senderId) {
              io.to(socketId).emit("notification", {
                type: "NEW_COURSE_MESSAGE",
                title: "New message from student",
                message: populated.content,
                courseId,
                sender: populated.senderId,
              });
            }
          }
        }
      }

      // CASE 2: Admin → Notify Students in course
      if (senderRole === "admin") {
        socket.to(courseId).emit("notification", {
          type: "ADMIN_MESSAGE",
          title: "New message from admin",
          message: populated.content,
          courseId,
          sender: populated.senderId,
        });
      }
    } catch (err) {
      console.error("❌ course:message error:", err.message);
      socket.emit("message:error", { error: err.message });
    }
  });

  /* TYPING (COURSE) */
  socket.on("course:typing", ({ courseId, user }) => {
    if (!courseId) return;
    socket.to(courseId).emit("course:typing", user);
  });

  socket.on("course:stopTyping", ({ courseId }) => {
    if (!courseId) return;
    socket.to(courseId).emit("course:stopTyping");
  });

  /* ─── REALTIME MODERATION EVENTS ─── */
  socket.on("admin:deleteMessage", ({ courseId, messageId }) => {
    if (courseId) {
      io.to(courseId).emit("course:messageDeleted", { messageId });
    }
  });

  socket.on("admin:clearChat", ({ courseId }) => {
    if (courseId) {
      io.to(courseId).emit("course:messagesCleared", { courseId });
    }
  });

  /* ─── DISCONNECT ─── */
  socket.on("disconnect", () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
    const userId = removeOnlineUser(socket.id);
    if (userId) {
      console.log(`👤 User offline: ${userId}`);
    }
    io.emit("users:online", getOnlineUserIds());
  });
});

/* ───────────────── ATTACH IO TO APP ───────────────── */
app.set("io", io);

/* ───────────────── START SERVER ───────────────── */
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.io ready`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });
