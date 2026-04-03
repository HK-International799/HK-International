import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    partnerInstitute: { type: mongoose.Schema.Types.ObjectId, ref: "PartnerInstitute", default: null },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "withdrawn"],
      default: "pending",
    },

    // LMS access granted after approval
    lmsAccessGranted: { type: Boolean, default: false },
    lmsAccessGrantedAt: { type: Date, default: null },

    // Orientation tracking
    orientationCompleted: { type: Boolean, default: false },
    orientationCompletedAt: { type: Date, default: null },

    // Quiz tracking
    quizPassed: { type: Boolean, default: false },
    quizScore: { type: Number, default: null },

    // Certificate
    certificateIssued: { type: Boolean, default: false },

    remarks: { type: String, default: "" },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

registrationSchema.index({ student: 1, course: 1 }, { unique: true });
registrationSchema.index({ partnerInstitute: 1 });
registrationSchema.index({ status: 1 });

export default mongoose.model("Registration", registrationSchema);
