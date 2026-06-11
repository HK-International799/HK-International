import mongoose from "mongoose";

/**
 * CourseEnrollmentFee
 *
 * Stores the official enrollment fee for each course.
 * Finance staff use this as the baseline when recording learner payments.
 * One document per course (enforced by unique index on courseId).
 */

const courseEnrollmentFeeSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true,
      index: true,
    },

    fee: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "GBP",
      uppercase: true,
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CourseEnrollmentFee", courseEnrollmentFeeSchema);
