import mongoose from "mongoose";

const orientationSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null },

    scheduledDate: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    meetingLink: { type: String, default: "" },
    recordingUrl: { type: String, default: "" },

    // Quiz linked to this session
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", default: null },

    // Minimum quiz score to pass (percentage 0-100)
    passingScore: { type: Number, default: 50 },

    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

orientationSessionSchema.index({ course: 1 });
orientationSessionSchema.index({ scheduledDate: 1 });

export default mongoose.model("OrientationSession", orientationSessionSchema);
