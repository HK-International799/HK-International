import mongoose from "mongoose";

const crmContactSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, default: "",    trim: true },
    email:     { type: String, default: "",    lowercase: true, trim: true },
    phone:     { type: String, default: "" },

    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrmOrganisation",
      default: null,
    },

    position: { type: String, default: "" },
    country:  { type: String, default: "" },
    notes:    { type: String, default: "" },

    relatedLeads: [{ type: mongoose.Schema.Types.ObjectId, ref: "CrmLead" }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

crmContactSchema.index({ email: 1 });
crmContactSchema.index({ organisation: 1 });

export default mongoose.model("CrmContact", crmContactSchema);