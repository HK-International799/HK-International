import OrientationSession from "../models/OrientationSession.js";
import Attendance from "../models/Attendance.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Question from "../models/Question.js";
import Registration from "../models/Registration.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

// ═══════════════════════════════════════════════════════════════════════
//  SESSION CRUD
// ═══════════════════════════════════════════════════════════════════════

export const createSession = asyncHandler(async (req, res) => {
  const { title, description, course, batch, scheduledDate, durationMinutes, meetingLink, passingScore } = req.body;

  if (!title || !course || !scheduledDate) {
    throw new ApiError(400, "title, course, and scheduledDate are required");
  }

  const session = await OrientationSession.create({
    title, description, course, batch,
    scheduledDate, durationMinutes, meetingLink,
    passingScore: passingScore || 50,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: "Session created", data: session });
});

export const getAllSessions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.course) filter.course = req.query.course;
  if (req.query.status) filter.status = req.query.status;

  const sessions = await OrientationSession.find(filter)
    .populate("course", "title")
    .populate("batch", "name")
    .populate("quiz", "title totalMarks")
    .populate("createdBy", "name")
    .sort({ scheduledDate: -1 })
    .lean();

  res.json({ success: true, data: sessions });
});

export const getSessionById = asyncHandler(async (req, res) => {
  const session = await OrientationSession.findById(req.params.id)
    .populate("course", "title")
    .populate("batch", "name")
    .populate("quiz", "title totalMarks")
    .populate("createdBy", "name");

  if (!session) throw new ApiError(404, "Session not found");

  // Get attendance count
  const attendanceCount = await Attendance.countDocuments({ orientationSession: session._id, status: "present" });

  res.json({ success: true, data: { ...session.toObject(), attendanceCount } });
});

export const updateSession = asyncHandler(async (req, res) => {
  const session = await OrientationSession.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!session) throw new ApiError(404, "Session not found");

  res.json({ success: true, message: "Session updated", data: session });
});

export const deleteSession = asyncHandler(async (req, res) => {
  const session = await OrientationSession.findByIdAndDelete(req.params.id);
  if (!session) throw new ApiError(404, "Session not found");

  // Clean up attendance records
  await Attendance.deleteMany({ orientationSession: session._id });

  res.json({ success: true, message: "Session deleted" });
});

// ═══════════════════════════════════════════════════════════════════════
//  ATTENDANCE
// ═══════════════════════════════════════════════════════════════════════

// ── Manual / live mark ─────────────────────────────────────────────────
export const markAttendance = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { studentId, status = "present" } = req.body;

  if (!studentId) throw new ApiError(400, "studentId is required");

  const session = await OrientationSession.findById(sessionId);
  if (!session) throw new ApiError(404, "Session not found");

  const attendance = await Attendance.findOneAndUpdate(
    { orientationSession: sessionId, student: studentId },
    { status, markedBy: req.user._id, markedAt: new Date(), source: "manual" },
    { new: true, upsert: true }
  );

  res.json({ success: true, message: "Attendance marked", data: attendance });
});

// ── Bulk mark attendance ───────────────────────────────────────────────
export const bulkMarkAttendance = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { students } = req.body; // [{ studentId, status }]

  if (!Array.isArray(students) || students.length === 0) {
    throw new ApiError(400, "students array is required");
  }

  const session = await OrientationSession.findById(sessionId);
  if (!session) throw new ApiError(404, "Session not found");

  const ops = students.map((s) => ({
    updateOne: {
      filter: { orientationSession: sessionId, student: s.studentId },
      update: {
        $set: {
          status: s.status || "present",
          markedBy: req.user._id,
          markedAt: new Date(),
          source: "manual",
        },
      },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(ops);

  res.json({ success: true, message: `Attendance marked for ${students.length} students` });
});

// ── CSV Upload attendance ──────────────────────────────────────────────
export const uploadAttendanceCSV = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!req.file) throw new ApiError(400, "CSV file is required");

  const session = await OrientationSession.findById(sessionId);
  if (!session) throw new ApiError(404, "Session not found");

  const results = [];
  const errors = [];

  // Parse CSV from memory buffer
  await new Promise((resolve, reject) => {
    const readable = Readable.from(req.file.buffer.toString());
    readable
      .pipe(csvParser())
      .on("data", (row) => results.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  let processed = 0;

  for (const row of results) {
    const email = (row.email || row.Email || "").trim().toLowerCase();
    const status = (row.status || row.Status || "present").trim().toLowerCase();

    if (!email) { errors.push(`Row missing email`); continue; }

    const student = await User.findOne({ email, role: "student" });
    if (!student) { errors.push(`Student not found: ${email}`); continue; }

    await Attendance.findOneAndUpdate(
      { orientationSession: sessionId, student: student._id },
      { status: ["present", "absent", "late"].includes(status) ? status : "present", markedBy: req.user._id, markedAt: new Date(), source: "csv_upload" },
      { upsert: true }
    );
    processed++;
  }

  res.json({
    success: true,
    message: `Processed ${processed} records`,
    data: { processed, errors, totalRows: results.length },
  });
});

// ── Get attendance for a session ───────────────────────────────────────
export const getSessionAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.find({ orientationSession: req.params.sessionId })
    .populate("student", "name email mobile")
    .populate("markedBy", "name")
    .sort({ markedAt: -1 })
    .lean();

  res.json({ success: true, data: records });
});

// ═══════════════════════════════════════════════════════════════════════
//  QUIZ (Orientation-specific)
// ═══════════════════════════════════════════════════════════════════════

// ── Create quiz for an orientation session ─────────────────────────────
export const createOrientationQuiz = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { title, questions = [], timeLimitMinutes = 0 } = req.body;

  if (!title) throw new ApiError(400, "title is required");

  const session = await OrientationSession.findById(sessionId);
  if (!session) throw new ApiError(404, "Session not found");

  // Create questions
  let questionDocs = [];
  if (questions.length > 0) {
    questionDocs = await Question.insertMany(questions);
  }

  const totalMarks = questionDocs.reduce((sum, q) => sum + (q.marks || 0), 0);

  const quiz = await Quiz.create({
    title,
    courseId: session.course,
    questions: questionDocs.map((q) => q._id),
    totalMarks,
    timeLimitMinutes,
    isPublished: true,
  });

  // Link quiz to session
  session.quiz = quiz._id;
  await session.save();

  res.status(201).json({ success: true, message: "Quiz created and linked to session", data: quiz });
});

// ── Attempt orientation quiz ───────────────────────────────────────────
export const attemptOrientationQuiz = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { answers = [] } = req.body; // [{ questionId, selectedOption, textAnswer }]

  const session = await OrientationSession.findById(sessionId).populate("quiz");
  if (!session) throw new ApiError(404, "Session not found");
  if (!session.quiz) throw new ApiError(400, "No quiz linked to this session");

  // Check attendance first
  const attendance = await Attendance.findOne({
    orientationSession: sessionId,
    student: req.user._id,
    status: "present",
  });
  if (!attendance) {
    throw new ApiError(403, "You must attend the orientation session before taking the quiz");
  }

  // Check existing attempt
  const existing = await QuizAttempt.findOne({ quizId: session.quiz._id, studentId: req.user._id });
  if (existing) throw new ApiError(409, "You have already attempted this quiz");

  // Fetch questions for auto-grading
  const questionDocs = await Question.find({ _id: { $in: session.quiz.questions } }).lean();
  const questionMap = new Map(questionDocs.map((q) => [q._id.toString(), q]));

  let score = 0;
  let totalMarks = 0;

  const processedAnswers = answers.map((ans) => {
    const question = questionMap.get(ans.questionId);
    if (question) {
      totalMarks += question.marks || 0;
      if (question.type === "mcq" && question.correctAnswer) {
        if (ans.selectedOption === question.correctAnswer) {
          score += question.marks || 0;
        }
      }
    }
    return {
      questionId: ans.questionId,
      selectedOption: ans.selectedOption || "",
      textAnswer: ans.textAnswer || "",
    };
  });

  // Calculate percentage
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  const attempt = await QuizAttempt.create({
    quizId: session.quiz._id,
    studentId: req.user._id,
    answers: processedAnswers,
    score: percentage,
    completedAt: new Date(),
  });

  // Update registration if quiz passed
  if (percentage >= (session.passingScore || 50)) {
    await Registration.findOneAndUpdate(
      { student: req.user._id, course: session.course },
      { quizPassed: true, quizScore: percentage, orientationCompleted: true, orientationCompletedAt: new Date() }
    );
  }

  res.status(201).json({
    success: true,
    message: percentage >= (session.passingScore || 50) ? "Quiz passed!" : "Quiz submitted — did not reach passing score",
    data: {
      attempt,
      score: percentage,
      passingScore: session.passingScore || 50,
      passed: percentage >= (session.passingScore || 50),
    },
  });
});

// ── Get quiz results for a session ─────────────────────────────────────
export const getQuizResults = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await OrientationSession.findById(sessionId);
  if (!session || !session.quiz) throw new ApiError(404, "Session or quiz not found");

  const attempts = await QuizAttempt.find({ quizId: session.quiz })
    .populate("studentId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: attempts });
});
