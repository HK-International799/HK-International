import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, trim: true },
    entity: { type: String, required: true, trim: true }, // e.g. "Registration", "User"
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    details: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    changes: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
