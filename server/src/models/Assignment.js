import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  dueDate: Date,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  totalMarks: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // tutor/admin
}, { timestamps: true });

export default mongoose.model("Assignment", assignmentSchema);
