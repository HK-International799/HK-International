import Notification from "../models/Notification.js";

const notificationService = {
  /**
   * Create an in-app notification.
   * @param {Object} opts
   * @param {string} opts.userId - Recipient user ID
   * @param {string} opts.type - info | warning | assignment | grade | message | registration
   * @param {string} opts.title
   * @param {string} opts.body
   * @param {string} [opts.referenceId]
   * @param {string} [opts.link]
   */
  create: async ({ userId, type = "info", title, body = "", referenceId = null, link = "" }) => {
    try {
      return await Notification.create({ userId, type, title, body, referenceId, link });
    } catch (err) {
      console.error("Notification service error:", err.message);
      return null;
    }
  },

  /**
   * Create notifications for multiple users.
   */
  createBulk: async (userIds, { type = "info", title, body = "", referenceId = null, link = "" }) => {
    try {
      const docs = userIds.map((userId) => ({
        userId,
        type,
        title,
        body,
        referenceId,
        link,
      }));
      return await Notification.insertMany(docs);
    } catch (err) {
      console.error("Bulk notification error:", err.message);
      return [];
    }
  },
};

export default notificationService;
