import mongoose from "mongoose";

const awardingOrganisationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    website: { type: String, default: "" },
    logo: { type: String, default: "" },

    // Primary contact user
    primaryContact: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Courses this AO oversees
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("AwardingOrganisation", awardingOrganisationSchema);
