import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ["mcq", "text", "file"], required: true },
  prompt: { type: String, required: true },
  options: [String], // for MCQ
  correctAnswer: String, // for MCQ auto-grading
  marks: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model("Question", questionSchema);
