import mongoose from "mongoose";

const partnerInstituteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // ✅ unique already creates index — no need for schema.index()
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    website: { type: String, default: "" },
    logo: { type: String, default: "" },

    // Primary contact / admin user for this institute
    primaryContact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Documents uploaded by institute
    documents: [
      {
        title: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: { type: Date, default: null },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ Keep this (useful for filtering by status)
partnerInstituteSchema.index({ status: 1 });

// ❌ REMOVE THIS LINE (causing warning)
// partnerInstituteSchema.index({ code: 1 });

export default mongoose.model("PartnerInstitute", partnerInstituteSchema);