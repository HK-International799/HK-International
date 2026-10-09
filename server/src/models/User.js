
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

//     // ── Learner 360° / Public Self-Registration fields (additive) ─────────
//     // All optional/defaulted so existing users and existing auth/login code
//     // paths are completely unaffected.
//     firstName: { type: String, default: "" },
//     // ── Registration Requirement 1 (additive) ──────────────────────────
//     // Optional — most existing records won't have one. Never required,
//     // so nothing that currently reads/writes firstName/lastName breaks.
//     middleName: { type: String, default: "" },
//     lastName: { type: String, default: "" },
//     dateOfBirth: { type: Date, default: null },
//     countryCode: { type: String, default: "" },

//     // `address` (single free-text field) is kept exactly as-is for
//     // backward compatibility with any existing record/consumer that reads
//     // it. Registration Requirement 2 asks for a structured postal address
//     // — those fields are added alongside it, additively, rather than
//     // replacing it. New code should prefer the structured fields; `address`
//     // is kept in sync (best-effort) as a human-readable combined string.
//     address: { type: String, default: "" },
//     addressLine1: { type: String, default: "" },
//     addressLine2: { type: String, default: "" },
//     city: { type: String, default: "" },
//     state: { type: String, default: "" },
//     postalCode: { type: String, default: "" },
//     country: { type: String, default: "" },
//     lastLoginAt: { type: Date, default: null },

//     // How this user account was created — purely informational, never read
//     // by existing auth/login logic.
//     registeredVia: {
//       type: String,
//       enum: ["self", "institute", "admin"],
//       default: "admin",
//     },

//     // ── Forgot / Reset Password (additive) ────────────────────────────────
//     // passwordResetToken holds the SHA-256 HASH of the emailed token — the
//     // raw token is never stored. Both fields are `select: false` so they can
//     // never leak through getMe, populate(), admin lists or any other query
//     // that doesn't explicitly ask for them.
//     passwordResetToken: { type: String, default: undefined, select: false },
//     passwordResetExpires: { type: Date, default: undefined, select: false },
//   },
//   { timestamps: true },
// );

// userSchema.index({ role: 1 });
// userSchema.index({ mobile: 1 });
// // Fast lookup of a reset token hash (sparse: most users have none).
// userSchema.index({ passwordResetToken: 1 }, { sparse: true });

// // ── Registration Requirement 1: Full Name derivation ────────────────────
// // Derived consistently from firstName/middleName/lastName when available
// // (correctly skipping an empty middle name — never "John  Smith" or
// // "John null Smith"); falls back to the legacy `name` field for records
// // that predate structured names, so nothing existing breaks.
// userSchema.virtual("displayName").get(function () {
//   const first = (this.firstName || "").trim();
//   const middle = (this.middleName || "").trim();
//   const last = (this.lastName || "").trim();

//   // If both first and last are missing, use legacy name
//   if (!first && !last) {
//     return (this.name || "").trim();
//   }

//   return [first, middle, last].filter(Boolean).join(" ");
// });

// userSchema.virtual("fullName").get(function () {
//   return this.displayName;
// });

// userSchema.set("toJSON", { virtuals: true });
// userSchema.set("toObject", { virtuals: true });

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
    // ── Registration Requirement 1 (additive) ──────────────────────────
    // Optional — most existing records won't have one. Never required,
    // so nothing that currently reads/writes firstName/lastName breaks.
    middleName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    dateOfBirth: { type: Date, default: null },
    countryCode: { type: String, default: "" },

    // `address` (single free-text field) is kept exactly as-is for
    // backward compatibility with any existing record/consumer that reads
    // it. Registration Requirement 2 asks for a structured postal address
    // — those fields are added alongside it, additively, rather than
    // replacing it. New code should prefer the structured fields; `address`
    // is kept in sync (best-effort) as a human-readable combined string.
    address: { type: String, default: "" },
    addressLine1: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "" },
    lastLoginAt: { type: Date, default: null },

    // How this user account was created — purely informational, never read
    // by existing auth/login logic.
    registeredVia: {
      type: String,
      enum: ["self", "institute", "admin"],
      default: "admin",
    },

    // ── Forgot / Reset Password (additive) ────────────────────────────────
    // passwordResetToken holds the SHA-256 HASH of the emailed token — the
    // raw token is never stored. Both fields are `select: false` so they can
    // never leak through getMe, populate(), admin lists or any other query
    // that doesn't explicitly ask for them.
    passwordResetToken: { type: String, default: undefined, select: false },
    passwordResetExpires: { type: Date, default: undefined, select: false },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });
userSchema.index({ mobile: 1 });
// Fast lookup of a reset token hash (sparse: most users have none).
userSchema.index({ passwordResetToken: 1 }, { sparse: true });

// ── Learners page: server-side filter / sort / stats (additive) ─────────
// createdAt: default sort + registration-date range + "registered
//   today/week/month/year" stat cards.
// role + createdAt: the most common combination (role filter, newest first).
// enrolledCourses (multikey): course filter and search-by-course-title.
// dateOfBirth: DOB range filter / DOB sort.
// Index builds are additive and non-blocking for existing queries.
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ enrolledCourses: 1 });
userSchema.index({ dateOfBirth: 1 });

// ── Registration Requirement 1: Full Name derivation ────────────────────
// Derived consistently from firstName/middleName/lastName when available
// (correctly skipping an empty middle name — never "John  Smith" or
// "John null Smith"); falls back to the legacy `name` field for records
// that predate structured names, so nothing existing breaks.
userSchema.virtual("displayName").get(function () {
  const first = (this.firstName || "").trim();
  const middle = (this.middleName || "").trim();
  const last = (this.lastName || "").trim();

  // If both first and last are missing, use legacy name
  if (!first && !last) {
    return (this.name || "").trim();
  }

  return [first, middle, last].filter(Boolean).join(" ");
});

userSchema.virtual("fullName").get(function () {
  return this.displayName;
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export default mongoose.model("User", userSchema);
