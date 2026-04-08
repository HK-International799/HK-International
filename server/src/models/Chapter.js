import mongoose from "mongoose";

/**
 * Chapter Model
 * Each chapter belongs to a course and has:
 *  - title / description
 *  - an optional uploaded document (PDF, DOC, etc.)
 *  - an optional linked quiz (for gate-keeping next chapter)
 *  - an order field to maintain sequence
 */
const chapterSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    // Uploaded document URL (stored via multer on disk / Cloudinary)
    documentUrl: {
      type: String,
      default: "",
    },

    documentName: {
      type: String,
      default: "",
    },

    // Linked quiz — created separately, then attached here
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },

    // Sequence position within the course (1-based)
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chapter", chapterSchema);
