import mongoose from "mongoose";

const crmLeadSchema = new mongoose.Schema(
  {
    fullName:  { type: String, required: true, trim: true },
    email:     { type: String, trim: true, lowercase: true, default: "" },
    phone:     { type: String, trim: true, default: "" },
    dob:       { type: Date,   default: null },
    age:       { type: Number, default: null },
    country:   { type: String, default: "" },

    courseInterest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    source: {
      type: String,
      enum: ["website", "referral", "social", "partner", "cold_call", "event", "other"],
      default: "other",
    },

    probability: { type: Number, min: 0, max: 100, default: 0 },

    status: {
      type: String,
      enum: ["new", "contacted", "interested", "proposal_sent", "payment_pending", "converted", "lost"],
      default: "new",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    notes: { type: String, default: "" },

    documents: [
      {
        title:      { type: String },
        fileUrl:    { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    tags: [{ type: String, trim: true }],

    // Set when lead is converted to a learner
    learnerRef:    { type: mongoose.Schema.Types.ObjectId, ref: "User",   default: null },
    convertedAt:   { type: Date,                                          default: null },
    convertedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User",   default: null },

    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
  },
  { timestamps: true }
);

crmLeadSchema.index({ status: 1 });
crmLeadSchema.index({ assignedTo: 1 });
crmLeadSchema.index({ source: 1 });
crmLeadSchema.index({ createdAt: -1 });
crmLeadSchema.index({ email: 1 });

export default mongoose.model("CrmLead", crmLeadSchema);