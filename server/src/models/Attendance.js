import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    orientationSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrientationSession",
      required: true,
    },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: {
      type: String,
      enum: ["present", "absent", "late"],
      default: "present",
    },

    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    markedAt: { type: Date, default: Date.now },

    // Source of attendance record
    source: {
      type: String,
      enum: ["manual", "csv_upload", "live"],
      default: "manual",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ orientationSession: 1, student: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
