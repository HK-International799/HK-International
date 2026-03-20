// import mongoose from "mongoose";

// const submissionSchema = new mongoose.Schema({
//   assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
//   studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   answers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Answer" }],
//   totalScore: Number,
//   gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   feedback: String,
//   status: { type: String, enum: ["pending", "graded"], default: "pending" },
// }, { timestamps: true });

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

    answers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Answer" },
    ],

    totalScore: {
      type: Number,
      default: null,
    },

    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    feedback: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "graded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Prevent duplicate submissions: one student → one submission per assignment
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);