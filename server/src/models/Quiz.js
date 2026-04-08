

import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Link quiz to a specific lesson (optional but recommended)
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },

    questions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    ],

    totalMarks: {
      type: Number,
      default: 0,
    },

    // Time limit in minutes (0 = no limit)
    timeLimitMinutes: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);