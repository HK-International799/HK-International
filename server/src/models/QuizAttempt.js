


import mongoose from "mongoose";

// Separate answer schema for quiz attempts — keeps quiz answers
// independent from assignment submission answers (Answer model)
const quizAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selectedOption: { type: String, default: "" },
    textAnswer: { type: String, default: "" },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [quizAnswerSchema],
    score: { type: Number, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One attempt per student per quiz
quizAttemptSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("QuizAttempt", quizAttemptSchema);