import mongoose from "mongoose";

const examAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    selectedOption: { type: String, default: "" },
    textAnswer: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    marksObtained: { type: Number, default: null },
  },
  { _id: false }
);

const examAttemptSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: [examAnswerSchema],
    totalScore: { type: Number, default: null },
    status: { type: String, enum: ["in-progress", "submitted", "graded"], default: "in-progress" },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    feedback: { type: String, default: "" },
  },
  { timestamps: true }
);

examAttemptSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("ExamAttempt", examAttemptSchema);
