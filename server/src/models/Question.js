


// import mongoose from "mongoose";

// const questionSchema = new mongoose.Schema(
//   {
//     type: {
//       type: String,
//       enum: ["mcq", "text", "file"],
//       required: true,
//     },

//     prompt: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // For MCQ: the answer options
//     options: [{ type: String }],

//     // For MCQ: the correct option (used for auto-grading)
//     correctAnswer: {
//       type: String,
//       default: "",
//     },

//     marks: {
//       type: Number,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Question", questionSchema);





import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    // ✅ Original values ("mcq", "text", "file") are kept so existing
    // documents and any other reader of this model (QuestionBank,
    // chapter/orientation quizzes) keep validating exactly as before.
    // New values are appended for Module 2 — Questions Engine.
    type: {
      type: String,
      enum: [
        "mcq",
        "text",
        "file",
        "single_choice",
        "multiple_choice",
        "true_false",
        "short_answer",
        "long_answer",
        "file_upload",
      ],
      required: true,
    },

    prompt: {
      type: String,
      required: true,
      trim: true,
    },

    // For MCQ / single_choice / multiple_choice / true_false: answer options
    options: [{ type: String }],

    // For single-answer types: the correct option (auto-grading)
    correctAnswer: {
      type: String,
      default: "",
    },

    // ✅ NEW: for multiple_choice (more than one correct option)
    correctAnswers: [{ type: String }],

    marks: {
      type: Number,
      required: true,
    },

    // ✅ NEW: rubric text shown to AI / human grader for written answers
    rubric: {
      type: String,
      default: "",
    },

    // ✅ NEW: free-form per-question AI grading hints (keywords, weight, etc.)
    aiRules: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);