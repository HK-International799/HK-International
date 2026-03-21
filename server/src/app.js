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

const app = express();

// ─── Security headers ───────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.NODE_ENV === "production"
  ? [
      process.env.CLIENT_URL_STUDENT,   // e.g. https://student.hk-lms.com
      process.env.CLIENT_URL_TUTOR,     // e.g. https://tutor.hk-lms.com
      process.env.CLIENT_URL_ADMIN,     // e.g. https://admin.hk-lms.com
    ].filter(Boolean)
  : [
      "http://localhost:5173",  // student frontend
      "http://localhost:5174",  // tutor dashboard
      "http://localhost:5175",  // admin dashboard
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ─── Rate limiting ───────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter limit for login/register
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

// ─── API routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);   // ----completed ---UI
app.use("/api/courses", courseRoutes);           // --- completed ---UI
app.use("/api/assignments", assignmentRoutes);  // ----- completed --
app.use("/api/submissions", submissionRoutes);  // ----- completed
app.use("/api/admin", adminRoutes);             //----- completed ---UI
app.use("/api/users", studentRoutes);           // ----- completed 
// app.use("/api/messages", messageRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/lessons", lessonRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorMiddleware);

export default app;