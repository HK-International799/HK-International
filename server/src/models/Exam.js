import mongoose from "mongoose";

// Full question snapshot schema
const QuestionSnapshotSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  questionText: { type: String, required: true },
  options: [
    {
      label: { type: String, required: true },
      text: { type: String, required: true },
    },
  ],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: "" },
  marks: { type: Number, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  isManual: { type: Boolean, default: false },
}, { _id: false });

const ExamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    timeLimit: { type: Number, required: true, min: 1 },
    totalQuestions: { type: Number, required: true, min: 1 },
    questions: [QuestionSnapshotSchema],
    passingScore: { type: Number, default: 40 },
    maxAttempts: { type: Number, default: 1, min: 1 },
    allowReattempt: { type: Boolean, default: false },
    reattemptNewQuestions: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Exam = mongoose.model("Exam", ExamSchema);

export default Exam;