import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";

const app = express();

// Connect to MongoDB
connectDB();

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173", // user-frontend
  "http://localhost:5174", // tutor-frontend
  "http://localhost:5175", // admin-dashboard
  // "https://user.myapp.com",   // production user frontend
  // "https://tutor.myapp.com",  // production tutor frontend
  // "https://admin.myapp.com"   // production admin dashboard
];

// Core middlewares
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // allow cookies/authorization headers
}));

app.use(express.json());
app.use(morgan("dev"));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/lessons", lessonRoutes);

// Error handler (last middleware)
app.use(errorMiddleware);

export default app;
