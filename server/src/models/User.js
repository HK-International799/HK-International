import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    mobile: { type: String, required: true },
    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "tutor", "admin", "super_admin", "partner_institute", "ao"],
      default: "student",
    },

    isFirstLogin: { type: Boolean, default: true },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    avatar: { type: String, default: "" },

    // Link to PartnerInstitute (for partner_institute role users)
    partnerInstitute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PartnerInstitute",
      default: null,
    },

    // Link to AwardingOrganisation (for ao role users)
    awardingOrganisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AwardingOrganisation",
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export default mongoose.model("User", userSchema);
