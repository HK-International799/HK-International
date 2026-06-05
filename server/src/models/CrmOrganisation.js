import mongoose from "mongoose";

const crmOrganisationSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true, unique: true },
    industry: { type: String, default: "" },
    website:  { type: String, default: "" },
    phone:    { type: String, default: "" },
    email:    { type: String, default: "", lowercase: true, trim: true },
    address:  { type: String, default: "" },
    country:  { type: String, default: "" },
    notes:    { type: String, default: "" },
    createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

crmOrganisationSchema.index({ name: 1 });

export default mongoose.model("CrmOrganisation", crmOrganisationSchema);