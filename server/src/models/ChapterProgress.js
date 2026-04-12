import mongoose from "mongoose";

const chapterResultSchema = new mongoose.Schema(
  {
    score:      { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed:     { type: Boolean, required: true },
  },
  { _id: false }
);

const chapterProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Array of chapter IDs the student has passed
    completedChapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
      },
    ],
    // Map of chapterId → last quiz result
    // e.g. { "663abc...": { score: 8, totalMarks: 10, percentage: 80, passed: true } }
    chapterResults: {
      type: Map,
      of: chapterResultSchema,
      default: {},
    },
  },
  { timestamps: true }
);

// One progress document per student per course
chapterProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("ChapterProgress", chapterProgressSchema);