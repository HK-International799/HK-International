import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    totalMarks: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 0 },
    timeLimitMinutes: { type: Number, default: 60 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ["draft", "published", "active", "completed"], default: "draft" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Exam", examSchema);
