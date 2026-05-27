import mongoose from "mongoose";
import ScenarioExam from "../models/ScenarioExam.js";
import ScenarioQuestion from "../models/ScenarioQuestion.js";
import ScenarioExamAttempt from "../models/ScenarioExamAttempt.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import {
  uploadPdfToCloudinary,
  deletePdfFromCloudinary,
} from "../utils/cloudinaryPdf.js";
import { checkScenarioAnswers } from "../services/geminiService.js";
import Course from "../models/Course.js"; // ✅ ADD

/* ───────────────────────── Helpers ───────────────────────── */

const assertObjectId = (id, label = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
};

const findExamOr404 = async (id) => {
  assertObjectId(id, "exam id");
  const exam = await ScenarioExam.findById(id);
  if (!exam) throw new ApiError(404, "Scenario exam not found");
  return exam;
};

const findQuestionOr404 = async (id) => {
  assertObjectId(id, "question id");
  const q = await ScenarioQuestion.findById(id);
  if (!q) throw new ApiError(404, "Scenario question not found");
  return q;
};

const findAttemptOr404 = async (id) => {
  assertObjectId(id, "attempt id");
  const a = await ScenarioExamAttempt.findById(id);
  if (!a) throw new ApiError(404, "Attempt not found");
  return a;
};

// ─── Enrollment helper (mirrors assignmentService.js pattern) ───────────────
// Returns true if courseId is null/undefined (backward-compat: legacy exams
// without a courseId remain visible to all students).
const _studentMayAccessScenarioExam = (enrolledCourses = [], courseId) => {
  if (!courseId) return true;
  const target = courseId.toString();
  return enrolledCourses.some((id) => id?.toString() === target);
};

/* ═════════════════════════════════════════════════════════════
 *                         ADMIN ROUTES
 * ═════════════════════════════════════════════════════════════ */

/* ── Create exam ──────────────────────────────────────────── */
export const createExam = asyncHandler(async (req, res) => {
  const {
    title,
    description = "",
    duration,
    passingScore = 0,
    allowReattempt = false,
    status = "draft",
    courseId, // optional — backward compatible
  } = req.body;

  if (!title || !title.trim()) throw new ApiError(400, "Title is required");
  if (!duration || Number(duration) < 1)
    throw new ApiError(400, "Duration must be at least 1 minute");

  // Validate courseId only if provided
  let normalizedCourseId = null;
  if (courseId) {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new ApiError(400, "Invalid courseId");
    }

    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      throw new ApiError(404, "Course not found");
    }

    normalizedCourseId = courseId;
  }

  const exam = await ScenarioExam.create({
    title: title.trim(),
    description,
    duration: Number(duration),
    passingScore: Number(passingScore) || 0,
    allowReattempt: !!allowReattempt,
    status,
    courseId: normalizedCourseId,
    createdBy: req.user._id,
    questions: [],
  });

  return apiResponse(res, 201, "Scenario exam created", exam);
});

/* ── Update exam ──────────────────────────────────────────── */
export const updateExam = asyncHandler(async (req, res) => {
  const exam = await findExamOr404(req.params.id);

  const allowedFields = [
    "title",
    "description",
    "duration",
    "passingScore",
    "allowReattempt",
    "status",
    "courseId",
  ];
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      if (key === "courseId") {
        const v = req.body.courseId;

        if (v === null || v === "") {
          exam.courseId = null;
        } else {
          if (!mongoose.Types.ObjectId.isValid(v)) {
            throw new ApiError(400, "Invalid courseId");
          }

          const courseExists = await Course.findById(v).select("_id"); // ✅ ADD
          if (!courseExists) {
            throw new ApiError(404, "Course not found");
          }

          exam.courseId = v;
        }
      } else {
        exam[key] =
          key === "duration" || key === "passingScore"
            ? Number(req.body[key])
            : req.body[key];
      }
    }
  }

  await exam.save();
  return apiResponse(res, 200, "Scenario exam updated", exam);
});

/* ── Archive (soft delete) ────────────────────────────────── */
export const archiveExam = asyncHandler(async (req, res) => {
  const exam = await findExamOr404(req.params.id);
  exam.status = "archived";
  await exam.save();
  return apiResponse(res, 200, "Scenario exam archived", exam);
});

/* ── Publish ──────────────────────────────────────────────── */
export const publishExam = asyncHandler(async (req, res) => {
  const exam = await findExamOr404(req.params.id);
  if (!exam.questions || exam.questions.length === 0) {
    throw new ApiError(400, "Cannot publish an exam with no scenarios");
  }
  exam.status = "published";
  await exam.save();
  return apiResponse(res, 200, "Scenario exam published", exam);
});

/* ── List all exams (admin) ───────────────────────────────── */
export const listAllExamsAdmin = asyncHandler(async (req, res) => {
  const exams = await ScenarioExam.find()
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email")
    .populate("courseId", "title") // ✅ ADD THIS
    .lean();

  return apiResponse(res, 200, "Scenario exams fetched", exams);
});

/* ── Admin exam details (all statuses) ───────────────────── */
export const getExamDetailsAdmin = asyncHandler(async (req, res) => {
  const exam = await ScenarioExam.findById(req.params.id)
    .populate("courseId", "title description") 
    .populate("createdBy", "name email");

  if (!exam) throw new ApiError(404, "Scenario exam not found");

  const questions = await ScenarioQuestion.find({ examId: exam._id })
    .sort({ questionNumber: 1 })
    .lean();

  return apiResponse(res, 200, "Admin exam fetched", { exam, questions });
});

/* ── Upload Scenario PDF ──────────────────────────────────── */
/**
 * POST /scenario-exams/exams/:id/upload-pdf
 * Accepts: multipart/form-data with field "scenarioPdf"
 * Returns: { pdfUrl, cloudinaryPublicId }
 */
export const uploadScenarioPdf = asyncHandler(async (req, res) => {
  await findExamOr404(req.params.id); // verify exam exists

  if (!req.file) {
    throw new ApiError(400, "A PDF file is required");
  }
  if (req.file.mimetype !== "application/pdf") {
    throw new ApiError(400, "Only PDF files are allowed");
  }

  const { url, publicId } = await uploadPdfToCloudinary(
    req.file.buffer,
    "scenario-exams/pdfs",
  );

  return apiResponse(res, 200, "PDF uploaded successfully", {
    pdfUrl: url,
    cloudinaryPublicId: publicId,
  });
});

/* ── Add Scenario (with questions) ───────────────────────── */
/**
 * POST /scenario-exams/exams/:id/scenarios
 * Body (JSON after PDF is already uploaded):
 * {
 *   scenarioPdfUrl,
 *   cloudinaryPublicId,
 *   subQuestions: [{ questionText, maxMarks }],
 *   maxMarks,
 *   questionNumber   (optional, auto-assigned if omitted)
 * }
 */
export const addScenario = asyncHandler(async (req, res) => {
  const exam = await findExamOr404(req.params.id);

  const {
    scenarioPdfUrl,
    cloudinaryPublicId = "",
    subQuestions = [],
    maxMarks = 0,
    questionNumber,
  } = req.body;

  if (!scenarioPdfUrl || !scenarioPdfUrl.trim()) {
    throw new ApiError(400, "scenarioPdfUrl is required");
  }
  if (!Array.isArray(subQuestions) || subQuestions.length === 0) {
    throw new ApiError(400, "At least one question is required per scenario");
  }
  for (const sq of subQuestions) {
    if (!sq.questionText || !sq.questionText.trim()) {
      throw new ApiError(400, "Every sub-question must have questionText");
    }
  }

  const nextNumber =
    questionNumber !== undefined
      ? Number(questionNumber)
      : (exam.questions?.length || 0) + 1;

  const scenario = await ScenarioQuestion.create({
    examId: exam._id,
    questionNumber: nextNumber,
    scenarioPdfUrl: scenarioPdfUrl.trim(),
    cloudinaryPublicId,
    subQuestions: subQuestions.map((sq) => ({
      questionText: sq.questionText.trim(),
      maxMarks: Number(sq.maxMarks) || 0,
    })),
    maxMarks: Number(maxMarks) || 0,
  });

  exam.questions.push(scenario._id);
  await exam.save();

  return apiResponse(res, 201, "Scenario added", scenario);
});

/* ── Update Scenario ──────────────────────────────────────── */
export const updateScenario = asyncHandler(async (req, res) => {
  const scenario = await findQuestionOr404(req.params.qId);

  const {
    scenarioPdfUrl,
    cloudinaryPublicId,
    subQuestions,
    maxMarks,
    questionNumber,
  } = req.body;

  // If a new PDF is being set and old one existed, delete old from Cloudinary
  if (
    scenarioPdfUrl &&
    scenarioPdfUrl !== scenario.scenarioPdfUrl &&
    scenario.cloudinaryPublicId
  ) {
    await deletePdfFromCloudinary(scenario.cloudinaryPublicId);
  }

  if (scenarioPdfUrl !== undefined)
    scenario.scenarioPdfUrl = scenarioPdfUrl.trim();
  if (cloudinaryPublicId !== undefined)
    scenario.cloudinaryPublicId = cloudinaryPublicId;
  if (maxMarks !== undefined) scenario.maxMarks = Number(maxMarks) || 0;
  if (questionNumber !== undefined)
    scenario.questionNumber = Number(questionNumber);

  if (Array.isArray(subQuestions)) {
    for (const sq of subQuestions) {
      if (!sq.questionText || !sq.questionText.trim()) {
        throw new ApiError(400, "Every sub-question must have questionText");
      }
    }
    scenario.subQuestions = subQuestions.map((sq) => ({
      _id: sq._id || new mongoose.Types.ObjectId(),
      questionText: sq.questionText.trim(),
      maxMarks: Number(sq.maxMarks) || 0,
    }));
  }

  await scenario.save();
  return apiResponse(res, 200, "Scenario updated", scenario);
});

/* ── Delete Scenario ──────────────────────────────────────── */
export const deleteScenario = asyncHandler(async (req, res) => {
  const scenario = await findQuestionOr404(req.params.qId);

  // Delete PDF from Cloudinary
  if (scenario.cloudinaryPublicId) {
    await deletePdfFromCloudinary(scenario.cloudinaryPublicId);
  }

  // Remove ref from parent exam
  await ScenarioExam.updateOne(
    { _id: scenario.examId },
    { $pull: { questions: scenario._id } },
  );

  await scenario.deleteOne();
  return apiResponse(res, 200, "Scenario deleted");
});

/* ── List submissions for an exam ─────────────────────────── */
export const listSubmissions = asyncHandler(async (req, res) => {
  await findExamOr404(req.params.id);

  const attempts = await ScenarioExamAttempt.find({ examId: req.params.id })
    .sort({ createdAt: -1 })
    .populate("studentId", "name email")
    .lean();

  return apiResponse(res, 200, "Submissions fetched", attempts);
});

/* ── Attempt details (admin) ──────────────────────────────── */
export const getAttemptDetailsAdmin = asyncHandler(async (req, res) => {
  const attempt = await ScenarioExamAttempt.findById(req.params.aId)
    .populate("studentId", "name email")
    .populate("examId")
    .lean();

  if (!attempt) throw new ApiError(404, "Attempt not found");

  const questions = await ScenarioQuestion.find({
    examId: attempt.examId._id,
  })
    .sort({ questionNumber: 1 })
    .lean();

  return apiResponse(res, 200, "Attempt fetched", { attempt, questions });
});

/* ── Review an attempt ────────────────────────────────────── */
/**
 * Body: {
 *   overallFeedback,
 *   answers: [
 *     {
 *       questionId,
 *       subAnswers: [
 *         { subQuestionId, marksObtained, isCorrect, feedbackText, improvementNotes }
 *       ]
 *     }
 *   ]
 * }
 */
export const reviewAttempt = asyncHandler(async (req, res) => {
  const attempt = await findAttemptOr404(req.params.aId);

  if (attempt.status === "in_progress") {
    throw new ApiError(400, "Cannot review an attempt still in progress");
  }

  const { answers: reviewAnswers = [], overallFeedback = "" } = req.body;

  // Build fast lookup of existing answers by questionId
  const existing = new Map(
    attempt.answers.map((a) => [String(a.questionId), a]),
  );

  let totalMarks = 0;
  const now = new Date();

  for (const r of reviewAnswers) {
    const key = String(r.questionId);
    const prev = existing.get(key);
    if (!prev) continue;

    if (Array.isArray(r.subAnswers)) {
      const subMap = new Map(
        prev.subAnswers.map((sa) => [String(sa.subQuestionId), sa]),
      );

      for (const rsa of r.subAnswers) {
        const sa = subMap.get(String(rsa.subQuestionId));
        if (!sa) continue;
        if (rsa.marksObtained !== undefined)
          sa.marksObtained = Number(rsa.marksObtained) || 0;
        if (rsa.isCorrect !== undefined) sa.isCorrect = !!rsa.isCorrect;
        if (rsa.feedbackText !== undefined) sa.feedbackText = rsa.feedbackText;
        if (rsa.improvementNotes !== undefined)
          sa.improvementNotes = rsa.improvementNotes;
        sa.reviewedAt = now;
        totalMarks += Number(sa.marksObtained) || 0;
      }
    }
  }

  attempt.overallFeedback = overallFeedback;
  attempt.totalMarksObtained = totalMarks;
  attempt.status = "reviewed";
  attempt.reviewedAt = now;
  attempt.markModified("answers");

  await attempt.save();
  return apiResponse(res, 200, "Attempt reviewed", attempt);
});

/* ── AI Check an attempt (Gemini) ─────────────────────────── */
/**
 * POST /scenario-exams/attempts/:aId/ai-check
 *
 * Loops through every scenario question in the attempt, sends the
 * scenario PDF + sub-questions + student's answers to Gemini 1.5 Pro,
 * and returns AI-generated marks / correctness / feedback as a DRAFT.
 *
 * IMPORTANT: This endpoint does NOT save anything to the database.
 * The admin reviews/edits the draft on the frontend and then calls
 * the existing reviewAttempt endpoint to persist the review.
 *
 * Returns:
 * {
 *   aiResults: [
 *     {
 *       questionId,
 *       subAnswers: [
 *         { subQuestionId, marksObtained, isCorrect, feedbackText }
 *       ]
 *     }
 *   ],
 *   warnings: [ "Scenario 2: AI check failed — ..." ]
 * }
 */
export const aiCheckAttempt = asyncHandler(async (req, res) => {
  const attempt = await ScenarioExamAttempt.findById(req.params.aId).lean();
  if (!attempt) throw new ApiError(404, "Attempt not found");

  if (attempt.status === "in_progress") {
    throw new ApiError(
      400,
      "Cannot AI-check an attempt that is still in progress",
    );
  }

  // Load all scenario questions for this exam
  const questions = await ScenarioQuestion.find({
    examId: attempt.examId,
  })
    .sort({ questionNumber: 1 })
    .lean();

  // Fast lookup of the student's answers by questionId
  const answersByQuestion = new Map(
    (attempt.answers || []).map((a) => [String(a.questionId), a]),
  );

  const aiResults = [];
  const warnings = [];

  // Process each scenario sequentially (one try/catch per scenario
  // so one large/broken PDF cannot abort the whole batch).
  for (const q of questions) {
    const studentAnswer = answersByQuestion.get(String(q._id));
    const subAnswers = studentAnswer?.subAnswers || [];

    try {
      const results = await checkScenarioAnswers(
        q.scenarioPdfUrl,
        q.subQuestions || [],
        subAnswers,
      );

      aiResults.push({
        questionId: String(q._id),
        subAnswers: results,
      });
    } catch (err) {
      // AI failed for this scenario — record a warning and fill
      // this scenario's sub-answers with safe defaults.
      warnings.push(
        `Scenario ${q.questionNumber}: ${err.message || "AI check failed"}`,
      );

      aiResults.push({
        questionId: String(q._id),
        subAnswers: (q.subQuestions || []).map((sq) => ({
          subQuestionId: String(sq._id),
          marksObtained: 0,
          isCorrect: false,
          feedbackText: "AI check failed — please review manually.",
        })),
      });
    }
  }

  return apiResponse(res, 200, "AI check complete", {
    aiResults,
    warnings,
  });
});

/* ── Allow reattempt ──────────────────────────────────────── */
export const allowReattempt = asyncHandler(async (req, res) => {
  const attempt = await findAttemptOr404(req.params.aId);
  attempt.reattemptAllowed = true;
  await attempt.save();
  return apiResponse(res, 200, "Reattempt allowed", attempt);
});

/* ═════════════════════════════════════════════════════════════
 *                         STUDENT ROUTES
 * ═════════════════════════════════════════════════════════════ */

export const listPublishedExams = asyncHandler(async (req, res) => {
  const filter = { status: "published" };

  // Students: restrict to exams whose courseId is either:
  //   (a) in their enrolledCourses, OR
  //   (b) null  (legacy exams — kept visible for backward compatibility)
  // Admin/tutor: no extra filter — preserve existing behavior.
  if (req.user?.role === "student") {
    const student = await User.findById(req.user._id).select("enrolledCourses");
    const enrolled = student?.enrolledCourses || [];

    filter.$or = [
      { courseId: null },
      { courseId: { $exists: false } },
      { courseId: { $in: enrolled } },
    ];
  }

  const exams = await ScenarioExam.find(filter)
    .sort({ createdAt: -1 })
    .select("-__v")
    .populate("courseId", "title") // ✅ ADD
    .lean();
  return apiResponse(res, 200, "Published exams fetched", exams);
});

export const getExamDetails = asyncHandler(async (req, res) => {
  const exam = await findExamOr404(req.params.id);
  if (exam.status !== "published") {
    throw new ApiError(404, "Exam not available");
  }

  // Enrollment guard: only enforced when the exam has a courseId.
  // Legacy exams without a courseId remain accessible to all students.
  if (req.user?.role === "student" && exam.courseId) {
    const student = await User.findById(req.user._id).select("enrolledCourses");
    if (
      !_studentMayAccessScenarioExam(student?.enrolledCourses, exam.courseId)
    ) {
      throw new ApiError(
        403,
        "You are not enrolled in the course for this exam",
      );
    }
  }

  const questions = await ScenarioQuestion.find({ examId: exam._id })
    .sort({ questionNumber: 1 })
    .lean();
  return apiResponse(res, 200, "Exam fetched", { exam, questions });
});

export const startExam = asyncHandler(async (req, res) => {
  const exam = await findExamOr404(req.params.id);
  if (exam.status !== "published") {
    throw new ApiError(400, "Exam is not available");
  }

  // Enrollment guard for students — only when exam has a courseId
  if (req.user?.role === "student" && exam.courseId) {
    const student = await User.findById(req.user._id).select("enrolledCourses");
    if (
      !_studentMayAccessScenarioExam(student?.enrolledCourses, exam.courseId)
    ) {
      throw new ApiError(403, "You are not enrolled in this course");
    }
  }

  const previousAttempts = await ScenarioExamAttempt.find({
    examId: exam._id,
    studentId: req.user._id,
  }).sort({ attemptNumber: -1 });

  const latest = previousAttempts[0];

  if (latest && latest.status === "in_progress") {
    return apiResponse(res, 200, "Resumed existing attempt", latest);
  }

  if (latest) {
    const canReattempt =
      exam.allowReattempt === true || latest.reattemptAllowed === true;
    if (!canReattempt) {
      throw new ApiError(
        403,
        "Reattempt is not allowed for this exam. Please wait for admin approval.",
      );
    }
  }

  const attemptNumber = latest ? latest.attemptNumber + 1 : 1;

  const attempt = await ScenarioExamAttempt.create({
    examId: exam._id,
    studentId: req.user._id,
    attemptNumber,
    status: "in_progress",
    startedAt: new Date(),
    answers: [],
  });

  return apiResponse(res, 201, "Attempt started", attempt);
});

export const autosaveAttempt = asyncHandler(async (req, res) => {
  const attempt = await findAttemptOr404(req.params.aId);

  if (String(attempt.studentId) !== String(req.user._id)) {
    throw new ApiError(403, "Not your attempt");
  }
  if (attempt.status !== "in_progress") {
    throw new ApiError(400, "Cannot autosave — attempt is not in progress");
  }

  const { answers = [], timeSpent } = req.body;
  if (!Array.isArray(answers)) {
    throw new ApiError(400, "answers must be an array");
  }

  const byQuestion = new Map(
    attempt.answers.map((a) => [String(a.questionId), a]),
  );

  for (const incoming of answers) {
    if (!incoming?.questionId) continue;
    if (!mongoose.Types.ObjectId.isValid(incoming.questionId)) continue;

    const key = String(incoming.questionId);
    const prev = byQuestion.get(key);

    if (prev) {
      // Merge subAnswers
      const subMap = new Map(
        prev.subAnswers.map((sa) => [String(sa.subQuestionId), sa]),
      );
      for (const isa of incoming.subAnswers || []) {
        if (!isa?.subQuestionId) continue;
        const existing = subMap.get(String(isa.subQuestionId));
        if (existing) {
          existing.answerText = isa.answerText ?? existing.answerText;
        } else {
          prev.subAnswers.push({
            subQuestionId: isa.subQuestionId,
            answerText: isa.answerText || "",
          });
        }
      }
    } else {
      attempt.answers.push({
        questionId: incoming.questionId,
        subAnswers: (incoming.subAnswers || []).map((sa) => ({
          subQuestionId: sa.subQuestionId,
          answerText: sa.answerText || "",
        })),
      });
    }
  }

  if (timeSpent !== undefined && !Number.isNaN(Number(timeSpent))) {
    attempt.timeSpent = Number(timeSpent);
  }

  attempt.markModified("answers");
  await attempt.save();

  return apiResponse(res, 200, "Autosaved", {
    savedAt: new Date(),
    answers: attempt.answers,
    timeSpent: attempt.timeSpent,
  });
});

export const submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await findAttemptOr404(req.params.aId);

  if (String(attempt.studentId) !== String(req.user._id)) {
    throw new ApiError(403, "Not your attempt");
  }
  if (attempt.status !== "in_progress") {
    throw new ApiError(400, "Attempt already submitted");
  }

  const { answers = [], timeSpent } = req.body || {};

  if (Array.isArray(answers) && answers.length > 0) {
    const byQuestion = new Map(
      attempt.answers.map((a) => [String(a.questionId), a]),
    );
    for (const incoming of answers) {
      if (!incoming?.questionId) continue;
      if (!mongoose.Types.ObjectId.isValid(incoming.questionId)) continue;
      const key = String(incoming.questionId);
      const prev = byQuestion.get(key);
      if (prev) {
        const subMap = new Map(
          prev.subAnswers.map((sa) => [String(sa.subQuestionId), sa]),
        );
        for (const isa of incoming.subAnswers || []) {
          if (!isa?.subQuestionId) continue;
          const existing = subMap.get(String(isa.subQuestionId));
          if (existing) {
            existing.answerText = isa.answerText ?? existing.answerText;
          } else {
            prev.subAnswers.push({
              subQuestionId: isa.subQuestionId,
              answerText: isa.answerText || "",
            });
          }
        }
      } else {
        attempt.answers.push({
          questionId: incoming.questionId,
          subAnswers: (incoming.subAnswers || []).map((sa) => ({
            subQuestionId: sa.subQuestionId,
            answerText: sa.answerText || "",
          })),
        });
      }
    }
  }

  if (timeSpent !== undefined && !Number.isNaN(Number(timeSpent))) {
    attempt.timeSpent = Number(timeSpent);
  }

  attempt.status = "submitted";
  attempt.submittedAt = new Date();
  attempt.markModified("answers");
  await attempt.save();

  return apiResponse(res, 200, "Attempt submitted", attempt);
});

export const listMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await ScenarioExamAttempt.find({
    studentId: req.user._id,
  })
    .sort({ createdAt: -1 })
    .populate("examId", "title duration passingScore status")
    .lean();
  return apiResponse(res, 200, "Attempts fetched", attempts);
});

export const getFeedback = asyncHandler(async (req, res) => {
  const attempt = await ScenarioExamAttempt.findById(req.params.aId)
    .populate("examId", "title duration passingScore")
    .lean();

  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (String(attempt.studentId) !== String(req.user._id)) {
    throw new ApiError(403, "Not your attempt");
  }
  if (attempt.status !== "reviewed") {
    throw new ApiError(403, "Feedback is not yet available.");
  }

  const questions = await ScenarioQuestion.find({
    examId: attempt.examId._id,
  })
    .sort({ questionNumber: 1 })
    .lean();

  return apiResponse(res, 200, "Feedback fetched", { attempt, questions });
});

export const getMyAttempt = asyncHandler(async (req, res) => {
  const attempt = await ScenarioExamAttempt.findById(req.params.aId).lean();
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (String(attempt.studentId) !== String(req.user._id)) {
    throw new ApiError(403, "Not your attempt");
  }

  const questions = await ScenarioQuestion.find({ examId: attempt.examId })
    .sort({ questionNumber: 1 })
    .lean();
  const exam = await ScenarioExam.findById(attempt.examId).lean().populate("courseId", "title");

  return apiResponse(res, 200, "Attempt fetched", { attempt, questions, exam });
});
