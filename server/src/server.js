import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import connectDB from "./config/db.js";
import express from "express";
import Message from "./models/Message.js";
import app from "./app.js";


const httpServer = createServer(app);

console.log(process.env.CLOUDINARY_API_SECRET);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_CLOUD_NAME);
// ─── Socket.io setup ───────────────────────────────────────────────────
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
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("user:online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("users:online", Array.from(onlineUsers.keys()));
  });

  socket.on("message:send", async (data) => {
    try {
      const { senderId, receiverId, content, courseId } = data;
      const message = await Message.create({ senderId, receiverId, content, courseId });
      const populated = await Message.findById(message._id)
        .populate("senderId", "name email avatar")
        .populate("receiverId", "name email avatar");

      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) io.to(receiverSocket).emit("message:received", populated);
      socket.emit("message:sent", populated);
    } catch (err) {
      socket.emit("message:error", { error: err.message });
    }
  });

  socket.on("message:read", async ({ senderId, receiverId }) => {
    try {
      await Message.updateMany({ senderId, receiverId, isRead: false }, { isRead: true });
      const senderSocket = onlineUsers.get(senderId);
      if (senderSocket) io.to(senderSocket).emit("message:read-ack", { readBy: receiverId });
    } catch (err) {
      console.error("Error marking read:", err);
    }
  });

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
  });
});

app.set("io", io);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Socket.io ready for connections`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err.message);
    process.exit(1);
  });
