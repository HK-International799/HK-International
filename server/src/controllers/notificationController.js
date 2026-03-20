// import Notification from "../models/Notification.js";

// export const pushNotification = async (req, res) => {
//   try {
//     const { userId, type, title, body } = req.body;
//     const notification = await Notification.create({ userId, type, title, body });
//     res.status(201).json(notification);
//   } catch (err) {
//     res.status(500).json({ message: "Error creating notification", error: err.message });
//   }
// };

// export const getNotifications = async (req, res) => {
//   try {
//     const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
//     res.json(notifications);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching notifications", error: err.message });
//   }
// };



import Notification from "../models/Notification.js";
import User from "../models/User.js";

/**
 * Create and push notification
 * POST /api/notifications
 * Body: { userId, type, title, body, referenceId, link }
 * Admin only
 */
export const pushNotification = async (req, res) => {
  try {
    const { userId, type, title, body, referenceId, link } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (!type || !["info", "warning", "assignment", "grade", "message"].includes(type)) {
      return res.status(400).json({
        message: "Type must be info, warning, assignment, grade, or message",
      });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        message: "Notification title is required",
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Create notification
    const notification = await Notification.create({
      userId,
      type,
      title: title.trim(),
      body: body || "",
      referenceId: referenceId || null,
      link: link || "",
      isRead: false,
    });

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (err) {
    console.error("Push notification error:", err);
    res.status(500).json({
      message: "Error creating notification",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Get notifications for current user
 * GET /api/notifications
 * Query: { isRead, type, limit, skip }
 */
export const getNotifications = async (req, res) => {
  try {
    const { isRead, type, limit = 50, skip = 0 } = req.query;

    // Build filter
    const filter = { userId: req.user.id };

    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }

    if (type) {
      if (!["info", "warning", "assignment", "grade", "message"].includes(type)) {
        return res.status(400).json({
          message: "Invalid type",
        });
      }
      filter.type = type;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const totalCount = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    res.json({
      message: "Notifications fetched successfully",
      totalCount,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({
      message: "Error fetching notifications",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Get single notification by ID
 * GET /api/notifications/:id
 */
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid notification ID format",
      });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // Verify user owns this notification
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to view this notification",
      });
    }

    res.json({
      message: "Notification fetched successfully",
      notification,
    });
  } catch (err) {
    console.error("Get notification error:", err);
    res.status(500).json({
      message: "Error fetching notification",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid notification ID format",
      });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // Verify user owns this notification
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to update this notification",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (err) {
    console.error("Mark notification read error:", err);
    res.status(500).json({
      message: "Error marking notification as read",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Mark multiple notifications as read
 * PATCH /api/notifications/batch/read
 * Body: { notificationIds }
 */
export const markNotificationsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        message: "Notification IDs array is required",
      });
    }

    // Verify all notifications belong to user
    const notifications = await Notification.find({
      _id: { $in: notificationIds },
      userId: req.user.id,
    });

    if (notifications.length !== notificationIds.length) {
      return res.status(403).json({
        message: "Some notifications do not belong to you",
      });
    }

    const result = await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { isRead: true }
    );

    res.json({
      message: "Notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Mark notifications read error:", err);
    res.status(500).json({
      message: "Error marking notifications as read",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Mark all notifications as read for user
 * PATCH /api/notifications/mark-all/read
 */
export const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Mark all notifications read error:", err);
    res.status(500).json({
      message: "Error marking all notifications as read",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid notification ID format",
      });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // Verify user owns this notification
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to delete this notification",
      });
    }

    await Notification.findByIdAndDelete(id);

    res.json({
      message: "Notification deleted successfully",
      notification: {
        id: notification._id,
        title: notification.title,
      },
    });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({
      message: "Error deleting notification",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Delete multiple notifications
 * DELETE /api/notifications/batch/delete
 * Body: { notificationIds }
 */
export const deleteNotifications = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        message: "Notification IDs array is required",
      });
    }

    // Verify all notifications belong to user
    const notifications = await Notification.find({
      _id: { $in: notificationIds },
      userId: req.user.id,
    });

    if (notifications.length !== notificationIds.length) {
      return res.status(403).json({
        message: "Some notifications do not belong to you",
      });
    }

    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
    });

    res.json({
      message: "Notifications deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Delete notifications error:", err);
    res.status(500).json({
      message: "Error deleting notifications",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Get unread notification count
 * GET /api/notifications/unread/count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    res.json({
      message: "Unread count fetched successfully",
      unreadCount,
    });
  } catch (err) {
    console.error("Get unread count error:", err);
    res.status(500).json({
      message: "Error fetching unread count",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Clear all notifications for user
 * DELETE /api/notifications/clear/all
 */
export const clearAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      userId: req.user.id,
    });

    res.json({
      message: "All notifications cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Clear all notifications error:", err);
    res.status(500).json({
      message: "Error clearing notifications",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};