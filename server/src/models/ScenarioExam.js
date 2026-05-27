import mongoose from "mongoose";

const scenarioExamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    duration: { type: Number, required: true, min: 1 }, // minutes
    passingScore: { type: Number, default: 0 },
    questions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ScenarioQuestion" },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    allowReattempt: { type: Boolean, default: false },
    // Optional course association — kept backward-compatible.
    // Existing scenario exams without a courseId remain visible to all students.
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

scenarioExamSchema.index({ status: 1 });
scenarioExamSchema.index({ createdBy: 1 });
scenarioExamSchema.index({ courseId: 1 });

export default mongoose.model("ScenarioExam", scenarioExamSchema);