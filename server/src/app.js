
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import errorMiddleware from "./middleware/errorMiddleware.js";

/* ── Routes ───────────────────────────────────────── */
import authRoutes from "./routes/authRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
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
import feedbackRoutes from "./routes/feedbackRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import questionBankRoutes from "./routes/questionBankRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

/* New Modules */
import orientationRoutes from "./routes/orientationRoutes.js";
import partnerInstituteRoutes from "./routes/partnerInstituteRoutes.js";
import aoRoutes from "./routes/aoRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import chapterRoutes from "./routes/chapterRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import scenarioExamRoutes from "./routes/scenarioExamRoutes.js";
import crmRoutes from "./routes/crmRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";

const app = express();

/* ─── Security ───────────────────────────────────── */
app.use(helmet());

/* ─── CORS ───────────────────────────────────────── */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "https://hkinternational.uk",
  "https://www.hkinternational.uk",
  "https://admin-hkinternational.vercel.app",
  "https://checkout.razorpay.com",
  process.env.CLIENT_URL_STUDENT,
  process.env.CLIENT_URL_ADMIN,
  process.env.CLIENT_URL_PARTNER,
  process.env.CLIENT_URL_AO,
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        process.env.NODE_ENV === "development" &&
        origin.startsWith("http://localhost")
      ) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  }),
);

/* ─── Rate Limiting ─────────────────────────────── */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  }),
);

/* ─── Body Parser ──────────────────────────────── */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ─── Other Middleware ─────────────────────────── */
app.use(compression());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ─── Health ───────────────────────────────────── */
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server running",
  });
});

/* ─── Payment Routes ───────────────────────────── */
app.use("/api/payment", paymentRoutes);

/* ─── API Routes ───────────────────────────────── */
app.use("/api/auth", authRoutes);
app.use("/api/registration", registrationRoutes);
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
app.use("/api/feedback", feedbackRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/question-banks", questionBankRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/analytics", analyticsRoutes);

/* ─── New Modules ─────────────────────────────── */
app.use("/api/orientation", orientationRoutes);
app.use("/api/partner-institutes", partnerInstituteRoutes);
app.use("/api/ao", aoRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/scenario-exams", scenarioExamRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api/finance", financeRoutes);

/* ─── 404 ─────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* ─── Error Handler ───────────────────────────── */
app.use(errorMiddleware);

export default app;
