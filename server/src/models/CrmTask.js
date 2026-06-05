import mongoose from "mongoose";

const crmTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrmLead",
      default: null,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    dueDate: { type: Date, default: null },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled"],
      default: "open",
    },

    description: { type: String, default: "" },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

crmTaskSchema.index({ assignedTo: 1 });
crmTaskSchema.index({ status: 1 });
crmTaskSchema.index({ dueDate: 1 });
crmTaskSchema.index({ lead: 1 });

export default mongoose.model("CrmTask", crmTaskSchema);