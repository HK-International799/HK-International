import mongoose from "mongoose";

/**
 * ScenarioExamAttempt
 *
 * Each attempt stores answers per sub-question.
 * Admin can provide feedback per sub-question answer.
 */

const subAnswerSchema = new mongoose.Schema(
  {
    subQuestionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    answerText: { type: String, default: "" },

    // ── Admin review fields ─────────────────────────────────────────
    marksObtained: { type: Number, default: 0 },
    isCorrect: { type: Boolean, default: null }, // null = not reviewed yet
    feedbackText: { type: String, default: "" },
    improvementNotes: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
  },
  { _id: false }
);

const scenarioAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScenarioQuestion",
      required: true,
    },
    subAnswers: { type: [subAnswerSchema], default: [] },
  },
  { _id: false }
);

const scenarioExamAttemptSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScenarioExam",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    attemptNumber: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "reviewed"],
      default: "in_progress",
    },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
    timeSpent: { type: Number, default: 0 }, // seconds

    answers: { type: [scenarioAnswerSchema], default: [] },

    overallFeedback: { type: String, default: "" },
    totalMarksObtained: { type: Number, default: 0 },
    reviewedAt: { type: Date, default: null },
    reattemptAllowed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

scenarioExamAttemptSchema.index({ examId: 1, studentId: 1, attemptNumber: 1 });

export default mongoose.model(
  "ScenarioExamAttempt",
  scenarioExamAttemptSchema
);