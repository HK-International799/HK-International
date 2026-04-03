import AuditLog from "../models/AuditLog.js";

const auditService = {
  /**
   * Log an action.
   * @param {Object} opts
   */
  log: async ({ action, entity, entityId = null, performedBy, details = "", ipAddress = "", changes = null }) => {
    try {
      return await AuditLog.create({ action, entity, entityId, performedBy, details, ipAddress, changes });
    } catch (err) {
      console.error("Audit log error:", err.message);
      return null;
    }
  },
};

export default auditService;
