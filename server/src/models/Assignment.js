// import mongoose from "mongoose";

// const assignmentSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: String,
//   courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
//   dueDate: Date,
//   questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
//   totalMarks: Number,
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // tutor/admin
// }, { timestamps: true });

// export default mongoose.model("Assignment", assignmentSchema);


import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
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

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Optional: link to a specific lesson this assignment belongs to
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },

    dueDate: {
      type: Date,
    },

    questions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    ],

    totalMarks: {
      type: Number,
      default: 0,
    },

    // Allow tutors to draft before releasing to students
    isPublished: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // tutor or admin
    },
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);