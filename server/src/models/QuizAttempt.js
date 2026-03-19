import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Answer" }],
  score: Number,
  completedAt: Date,
}, { timestamps: true });

export default mongoose.model("QuizAttempt", quizAttemptSchema);
