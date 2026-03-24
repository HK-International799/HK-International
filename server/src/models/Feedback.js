import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null },
    type: { type: String, enum: ["course", "tutor", "platform", "general"], default: "general" },
    rating: { type: Number, min: 1, max: 5, default: null },
    comment: { type: String, required: true, trim: true },
    status: { type: String, enum: ["new", "read", "resolved"], default: "new" },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
