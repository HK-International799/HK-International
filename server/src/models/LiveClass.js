import mongoose from "mongoose";

const liveClassSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // minutes
    meetingLink: { type: String, default: "" },
    recordingUrl: { type: String, default: "" },
    status: { type: String, enum: ["scheduled", "live", "completed", "cancelled"], default: "scheduled" },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("LiveClass", liveClassSchema);
