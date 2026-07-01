



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

//     // ✅ Cloudinary file (replaces local storage)
//     file: {
//       url: { type: String, default: null },
//       public_id: { type: String, default: null },   // Cloudinary public_id for deletion
//       originalName: { type: String, default: null },
//     },

//     isPublished: {
//       type: Boolean,
//       default: false,
//     },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // ✅ Virtual: isOverdue
// assignmentSchema.virtual("isOverdue").get(function () {
//   if (!this.dueDate) return false;
//   return new Date() > new Date(this.dueDate);
// });

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

    // ─────────────────────────────────────────────────────────────
    // ✅ ASSESSMENT & ASSIGNMENT MODULE — additive fields only.
    // None of the fields below change the meaning or default
    // behaviour of any existing field above. `isPublished` remains
    // the single source of truth for every existing list/filter
    // query across admin + student. `status` is a richer, optional
    // companion field kept in sync by the service layer.
    // ─────────────────────────────────────────────────────────────

    assessmentType: {
      type: String,
      enum: ["general", "mcq_exam", "written_assessment", "project_submission"],
      default: "general",
    },

    // Generic "module" link — maps to a Chapter in this LMS. Optional,
    // never required, so existing assignments (no module) are unaffected.
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      default: null,
    },

    instructions: {
      type: String,
      default: "",
    },

    passingMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxAttempts: {
      type: Number,
      default: 1,
      min: 1,
    },

    allowResubmission: {
      type: Boolean,
      default: true, // preserves existing resubmit endpoint's current open behaviour
    },

    maxResubmissions: {
      type: Number,
      default: 3,
      min: 0,
    },

    requireAdminApproval: {
      type: Boolean,
      default: false,
    },

    showCorrectAnswers: {
      type: Boolean,
      default: false,
    },

    // AI grading configuration (written_assessment / project_submission)
    gradingPrompt: {
      type: String,
      default: "",
    },

    answerKey: {
      type: String,
      default: "",
    },

    useAnswerKeyForGrading: {
      type: Boolean,
      default: false,
    },

    aiGradingEnabled: {
      type: Boolean,
      default: false,
    },

    // Richer lifecycle status, additive companion to isPublished.
    // draft -> published -> archived. Kept in sync with isPublished
    // by assignmentService (published <=> isPublished true).
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
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

assignmentSchema.index({ assessmentType: 1 });
assignmentSchema.index({ status: 1 });

export default mongoose.model("Assignment", assignmentSchema);
