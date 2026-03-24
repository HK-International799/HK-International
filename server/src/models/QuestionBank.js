import mongoose from "mongoose";

const questionBankSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    category: { type: String, default: "General", trim: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("QuestionBank", questionBankSchema);
