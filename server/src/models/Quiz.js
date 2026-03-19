import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  totalMarks: Number,
}, { timestamps: true });

export default mongoose.model("Quiz", quizSchema);
