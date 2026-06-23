// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       lowercase: true,
//     },
//     mobile: { type: String, required: true },
//     passwordHash: { type: String, required: true },

//     role: {
//       type: String,
//       enum: [
//         "student",
//         "tutor",
//         "admin",
//         "super_admin",
//         "partner_institute",
//         "ao",
//         "sales_agent",
//         "finance",
//       ],
//       default: "student",
//     },

//     isFirstLogin: { type: Boolean, default: true },
//     enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
//     assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
//     avatar: { type: String, default: "" },

//     // Link to PartnerInstitute (for partner_institute role users)
//     partnerInstitute: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "PartnerInstitute",
//       default: null,
//     },

//     // Link to AwardingOrganisation (for ao role users)
//     awardingOrganisation: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "AwardingOrganisation",
//       default: null,
//     },
//   },
//   { timestamps: true },
// );

// userSchema.index({ role: 1 });

// export default mongoose.model("User", userSchema);




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
      enum: [
        "student",
        "tutor",
        "admin",
        "super_admin",
        "partner_institute",
        "ao",
        "sales_agent",
        "finance",
      ],
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

    // ── Learner 360° / Public Self-Registration fields (additive) ─────────
    // All optional/defaulted so existing users and existing auth/login code
    // paths are completely unaffected.
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    dateOfBirth: { type: Date, default: null },
    countryCode: { type: String, default: "" },
    address: { type: String, default: "" },
    country: { type: String, default: "" },
    lastLoginAt: { type: Date, default: null },

    // How this user account was created — purely informational, never read
    // by existing auth/login logic.
    registeredVia: {
      type: String,
      enum: ["self", "institute", "admin"],
      default: "admin",
    },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });
userSchema.index({ mobile: 1 });

export default mongoose.model("User", userSchema);
