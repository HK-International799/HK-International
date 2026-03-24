import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxStudents: { type: Number, default: 50 },
    status: { type: String, enum: ["upcoming", "active", "completed"], default: "upcoming" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Batch", batchSchema);
