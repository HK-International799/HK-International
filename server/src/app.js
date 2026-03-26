import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import errorMiddleware from "./middleware/errorMiddleware.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
import liveClassRoutes from "./routes/liveClassRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import questionBankRoutes from "./routes/questionBankRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

// ─── Security headers ───────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        process.env.CLIENT_URL_STUDENT,
        process.env.CLIENT_URL_TUTOR,
        process.env.CLIENT_URL_ADMIN,
      ].filter(Boolean)
    : [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://hkinternational.uk",
      ];

app.use(
  cors({
    origin: (origin, callback) => {
      // ✅ Allow ALL requests with no origin (payment gateways, postman)
      if (!origin) return callback(null, true);

      // ✅ Allow localhost
      if (origin.startsWith("http://localhost")) {
        return callback(null, true);
      }

      // ✅ Allow your domains
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ✅ Allow ALL Easebuzz requests safely
      if (
        origin.includes("easebuzz") ||
        origin.includes("pay.easebuzz.in")
      ) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return callback(null, true); // 🔥 IMPORTANT: don't block
    },
    credentials: true,
  })
);
// app.use(cors());

// ─── Rate limiting ───────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth attempts, please try again later." },
});

app.use(globalLimiter);

// ─── Body parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── HTTP logging (dev only) ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server running" });
});

//---------------------- Payment Integration----------------------
app.use("/api/payment", paymentRoutes);

// ─── API routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/live-classes", liveClassRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/question-banks", questionBankRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/analytics", analyticsRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use(errorMiddleware);

export default app;
