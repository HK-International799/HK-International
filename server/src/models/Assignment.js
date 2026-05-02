// import mongoose from "mongoose";

// const assignmentSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     description: {
//       type: String,
//       default: "",
//     },

//     courseId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Course",
//       required: true,
//     },

//     // Optional: link to a specific lesson this assignment belongs to
//     lessonId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Lesson",
//       default: null,
//     },

//     dueDate: {
//       type: Date,
//     },

//     questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],

//     totalMarks: {
//       type: Number,
//       default: 0,
//     },

//     file: {
//       url: String,
//       originalName: String,
//     },

//     // Allow tutors to draft before releasing to students
//     isPublished: {
//       type: Boolean,
//       default: false,
//     },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // tutor or admin
//     },
//   },
//   { timestamps: true },
// );

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

    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },

    dueDate: {
      type: Date,
    },

    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],

    totalMarks: {
      type: Number,
      default: 0,
    },

    // ✅ Cloudinary file (replaces local storage)
    file: {
      url: { type: String, default: null },
      public_id: { type: String, default: null },   // Cloudinary public_id for deletion
      originalName: { type: String, default: null },
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Virtual: isOverdue
assignmentSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate) return false;
  return new Date() > new Date(this.dueDate);
});

export default mongoose.model("Assignment", assignmentSchema);
