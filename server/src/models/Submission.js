

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
      // ✅ Original 3 values kept first and unchanged as the default
      // remains "submitted" — every existing query/filter on these
      // three values keeps working exactly as before. New values are
      // appended for the richer Assessment workflow.
      enum: [
        "not_submitted",
        "submitted",
        "graded",
        "ai_reviewed",
        "approved",
        "resubmission_required",
      ],
      default: "submitted",
    },

    isLate: { type: Boolean, default: false },

    // ─────────────────────────────────────────────────────────────
    // ✅ ASSESSMENT & ASSIGNMENT MODULE — additive fields only.
    // ─────────────────────────────────────────────────────────────

    // Auto-grading outcome (MCQ / objective questions evaluated on submit)
    correctCount: { type: Number, default: null },
    wrongCount: { type: Number, default: null },
    passFail: {
      type: String,
      enum: ["pending", "pass", "fail"],
      default: "pending",
    },

    // Admin completion-approval workflow (independent of `status` so a
    // grade can exist while approval is still pending)
    approvalStatus: {
      type: String,
      enum: ["not_required", "pending", "approved"],
      default: "not_required",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },

    // Resubmission tracking
    resubmissionCount: { type: Number, default: 0 },
    resubmissionFeedback: { type: String, default: "" },
    submissionHistory: [
      {
        submittedAt: { type: Date, default: Date.now },
        submissionFile: {
          url: String,
          public_id: String,
          originalName: String,
        },
        totalScore: { type: Number, default: null },
        feedback: { type: String, default: "" },
        status: { type: String, default: "" },
      },
    ],

    // AI grading draft — generated by geminiService, never auto-applied.
    // Admin must explicitly "Accept Draft" / "Accept & Edit".
    aiDraft: {
      questionGrades: [
        {
          questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
          answerId: { type: mongoose.Schema.Types.ObjectId, ref: "Answer" },
          marksAwarded: { type: Number, default: null },
          isCorrect: { type: Boolean, default: null },
          feedbackText: { type: String, default: "" },
        },
      ],
      feedbackText: { type: String, default: "" },
      overallFeedback: { type: String, default: "" },
      suggestedPass: { type: Boolean, default: null },
      score: { type: Number, default: null },
      generatedAt: { type: Date, default: null },
      accepted: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Prevent duplicate submissions
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);