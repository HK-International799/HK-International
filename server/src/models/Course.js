import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  thumbnail: String,
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Course", courseSchema);
