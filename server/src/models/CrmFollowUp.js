import mongoose from "mongoose";

const crmFollowUpSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrmLead",
      required: true,
    },

    scheduledAt: { type: Date, required: true },

    type: {
      type: String,
      enum: ["call", "email", "meeting", "whatsapp", "other"],
      default: "call",
    },

    outcome: {
      type: String,
      enum: ["pending", "completed", "no_answer", "rescheduled"],
      default: "pending",
    },

    remarks:     { type: String, default: "" },
    completedAt: { type: Date,   default: null },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

crmFollowUpSchema.index({ lead: 1 });
crmFollowUpSchema.index({ scheduledAt: 1 });
crmFollowUpSchema.index({ outcome: 1 });

export default mongoose.model("CrmFollowUp", crmFollowUpSchema);