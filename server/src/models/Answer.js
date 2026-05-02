// // import mongoose from "mongoose";

// // const answerSchema = new mongoose.Schema({
// //   questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
// //   submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
// //   textAnswer: String,
// //   fileUrl: String,
// //   selectedOption: String,
// // }, { timestamps: true });

// // export default mongoose.model("Answer", answerSchema);



// import mongoose from "mongoose";

// const answerSchema = new mongoose.Schema(
//   {
//     questionId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Question",
//       required: true,
//     },

//     submissionId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Submission",
//       required: true,
//     },

//     textAnswer: {
//       type: String,
//       default: "",
//     },

//     fileUrl: {
//       type: String, // Cloudinary URL for file uploads
//       default: "",
//     },

//     selectedOption: {
//       type: String, // For MCQ
//       default: "",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Answer", answerSchema);

import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },

    textAnswer: {
      type: String,
      default: "",
    },

    // Cloudinary URL — only used when question.type === "file"
    fileUrl: {
      type: String,
      default: "",
    },

    selectedOption: {
      type: String, // MCQ
      default: "",
    },

    // ✅ Grading fields
    marksAwarded: {
      type: Number,
      default: null,
    },

    isCorrect: {
      type: Boolean,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Answer", answerSchema);
