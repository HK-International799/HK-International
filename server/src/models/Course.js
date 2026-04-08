import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    thumbnail: {
      type: String, // Cloudinary URL
      default: "",
    },

    // Sections hold the lessons — no top-level lessons array (avoids duplication)
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],

    // The tutor responsible for this course (assigned by admin)
    assignedTutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // The admin who created this course
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Workflow state
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },

  { timestamps: true },
);

export default mongoose.model("Course", courseSchema);
