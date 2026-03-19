import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
  textAnswer: String,
  fileUrl: String,
  selectedOption: String,
}, { timestamps: true });

export default mongoose.model("Answer", answerSchema);
