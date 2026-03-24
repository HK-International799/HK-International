import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    certificateNumber: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
    grade: { type: String, default: "" },
    score: { type: Number, default: null },
    fileUrl: { type: String, default: "" },
    status: { type: String, enum: ["issued", "revoked"], default: "issued" },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

certificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("Certificate", certificateSchema);
