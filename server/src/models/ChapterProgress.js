import mongoose from "mongoose";

/**
 * ChapterProgress Model
 * Tracks which chapters a student has completed (unlocked) per course.
 * A chapter is considered "completed" once the student submits its quiz
 * (or if the chapter has no quiz).
 *
 * One document per (studentId + courseId) pair.
 */
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

    // Array of chapter IDs the student has completed
    completedChapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
      },
    ],
  },
  { timestamps: true }
);

// One progress record per student per course
chapterProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("ChapterProgress", chapterProgressSchema);
