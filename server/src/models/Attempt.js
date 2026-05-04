import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOption: { type: String, default: null },
    isCorrect: { type: Boolean, default: false },
    marksAwarded: { type: Number, default: 0 },
  },
  { _id: false },
);

const AttemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    attemptNumber: { type: Number, required: true, min: 1 },

    questionSet: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        questionText: String,
        options: [{ label: String, text: String }],
        correctAnswer: String,
        explanation: String,
        marks: Number,
        negativeMarks: Number,
      },
    ],

    answers: [AnswerSchema],

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    submittedAt: { type: Date, default: null },
    isAutoSubmitted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "expired"],
      default: "in_progress",
    },

    result: {
      totalQuestions: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      incorrect: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
      totalMarks: { type: Number, default: 0 },
      marksObtained: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      isPassed: { type: Boolean, default: false },
      timeTaken: { type: Number, default: 0 },
    },

    feedback: {
      text: { type: String, default: "" },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      addedAt: { type: Date },
    },
  },
  { timestamps: true },
);

// Unique attempt constraint
AttemptSchema.index(
  { studentId: 1, examId: 1, attemptNumber: 1 },
  { unique: true },
);

// ✅ ESM export
export default mongoose.model("Attempt", AttemptSchema);
