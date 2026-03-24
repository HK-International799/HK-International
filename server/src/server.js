import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import express from "express";
import Message from "./models/Message.js";

app.use("/uploads", express.static("uploads"));

const httpServer = createServer(app);

// ─── Socket.io setup ─────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? [process.env.CLIENT_URL_ADMIN, process.env.CLIENT_URL_STUDENT, process.env.CLIENT_URL_TUTOR].filter(Boolean)
      : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true,
  },
});

// Track online users: userId -> socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins with their userId
  socket.on("user:online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("users:online", Array.from(onlineUsers.keys()));
  });

  // Send message
  socket.on("message:send", async (data) => {
    try {
      const { senderId, receiverId, content, courseId } = data;
      const message = await Message.create({ senderId, receiverId, content, courseId });
      const populated = await Message.findById(message._id)
        .populate("senderId", "name email avatar")
        .populate("receiverId", "name email avatar");

      // Send to receiver if online
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("message:received", populated);
      }
      // Send back to sender for confirmation
      socket.emit("message:sent", populated);
    } catch (err) {
      socket.emit("message:error", { error: err.message });
    }
  });

  // Mark messages as read
  socket.on("message:read", async ({ senderId, receiverId }) => {
    try {
      await Message.updateMany(
        { senderId, receiverId, isRead: false },
        { isRead: true }
      );
      const senderSocket = onlineUsers.get(senderId);
      if (senderSocket) {
        io.to(senderSocket).emit("message:read-ack", { readBy: receiverId });
      }
    } catch (err) {
      console.error("Error marking read:", err);
    }
  });

  // Typing indicator
  socket.on("typing:start", ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) io.to(receiverSocket).emit("typing:start", { senderId });
  });

  socket.on("typing:stop", ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) io.to(receiverSocket).emit("typing:stop", { senderId });
  });

  socket.on("disconnect", () => {
    for (const [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("users:online", Array.from(onlineUsers.keys()));
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible in routes if needed
app.set("io", io);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Socket.io ready for connections`);
  });
}).catch((err) => {
  console.error("Failed to connect to DB:", err.message);
  process.exit(1);
});
