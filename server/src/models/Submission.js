

// import mongoose from "mongoose";

// const submissionSchema = new mongoose.Schema(
//   {
//     assignmentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Assignment",
//       required: true,
//     },

//     studentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     answers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Answer" }],

//     // File submitted by student (Cloudinary)
//     submissionFile: {
//       url: { type: String, default: null },
//       public_id: { type: String, default: null },
//       originalName: { type: String, default: null },
//     },

//     totalScore: { type: Number, default: null },

//     gradedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },

//     gradedAt: { type: Date, default: null },

//     feedback: { type: String, default: "" },

//     // Per-question review annotations (legacy — kept for backward compat)
//     reviewAnnotations: [
//       {
//         questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
//         icon: {
//           type: String,
//           enum: ["correct", "wrong", "partial"],
//           default: "partial",
//         },
//         note: { type: String, default: "" },
//       },
//     ],

//     // ✅ NEW: Document-level annotations placed by admin on the PDF/DOCX viewer
//     // Each entry stores the exact page + % position so they render at the
//     // correct spot regardless of zoom level or viewport size.
//     annotations: [
//       {
//         id: { type: String, required: true },          // uid generated on frontend
//         page: { type: Number, required: true },        // 1-based page number
//         xPct: { type: Number, required: true },        // 0-100 % from left
//         yPct: { type: Number, required: true },        // 0-100 % from top
//         type: {
//           type: String,
//           enum: ["correct", "wrong", "partial", "note", "star"],
//           required: true,
//         },
//         note: { type: String, default: "" },           // optional label/comment
//       },
//     ],

//     status: {
//       type: String,
//       enum: ["not_submitted", "submitted", "graded"],
//       default: "submitted",
//     },

//     isLate: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// // Prevent duplicate submissions
// submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

// export default mongoose.model("Submission", submissionSchema);





import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    answers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Answer" }],

    // File submitted by student (Cloudinary)
    submissionFile: {
      url: { type: String, default: null },
      public_id: { type: String, default: null },
      originalName: { type: String, default: null },
    },

    totalScore: { type: Number, default: null },

    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    gradedAt: { type: Date, default: null },

    feedback: { type: String, default: "" },

    // Per-question review annotations (legacy — kept for backward compat)
    reviewAnnotations: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        icon: {
          type: String,
          enum: ["correct", "wrong", "partial"],
          default: "partial",
        },
        note: { type: String, default: "" },
      },
    ],

    // ✅ NEW: Document-level annotations placed by admin on the PDF/DOCX viewer
    // Each entry stores the exact page + % position so they render at the
    // correct spot regardless of zoom level or viewport size.
    annotations: [
      {
        id: { type: String, required: true },          // uid generated on frontend
        page: { type: Number, required: true },        // 1-based page number
        xPct: { type: Number, required: true },        // 0-100 % from left
        yPct: { type: Number, required: true },        // 0-100 % from top
        type: {
          type: String,
          enum: ["correct", "wrong", "partial", "note", "star"],
          required: true,
        },
        note: { type: String, default: "" },           // optional label/comment
      },
    ],

    status: {
      type: String,
      enum: ["not_submitted", "submitted", "graded"],
      default: "submitted",
    },

    isLate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent duplicate submissions
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);