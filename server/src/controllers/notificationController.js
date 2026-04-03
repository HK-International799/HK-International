import Notification from "../models/Notification.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const pushNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, body, referenceId, link } = req.body;

  if (!userId) throw new ApiError(400, "User ID is required");
  if (!type || !["info", "warning", "assignment", "grade", "message", "registration"].includes(type)) {
    throw new ApiError(400, "Valid type is required");
  }
  if (!title || title.trim().length === 0) throw new ApiError(400, "Title is required");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const notification = await Notification.create({
    userId, type, title: title.trim(), body: body || "",
    referenceId: referenceId || null, link: link || "",
  });

  res.status(201).json({ success: true, message: "Notification created", data: notification });
});

export const getNotifications = asyncHandler(async (req, res) => {
  const { isRead, type, limit = 50, skip = 0 } = req.query;
  const filter = { userId: req.user._id };

  if (isRead !== undefined) filter.isRead = isRead === "true";
  if (type) filter.type = type;

  const [notifications, totalCount, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit)).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ]);

  res.json({ success: true, data: { totalCount, unreadCount, count: notifications.length, notifications } });
});

export const getNotificationById = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new ApiError(404, "Notification not found");
  if (notification.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied");
  }
  res.json({ success: true, data: notification });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new ApiError(404, "Notification not found");
  if (notification.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied");
  }
  notification.isRead = true;
  await notification.save();
  res.json({ success: true, message: "Marked as read", data: notification });
});

export const markNotificationsRead = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;
  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    throw new ApiError(400, "Notification IDs array is required");
  }
  const result = await Notification.updateMany(
    { _id: { $in: notificationIds }, userId: req.user._id },
    { isRead: true }
  );
  res.json({ success: true, message: "Notifications marked as read", data: { modifiedCount: result.modifiedCount } });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: "All marked as read", data: { modifiedCount: result.modifiedCount } });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new ApiError(404, "Notification not found");
  if (notification.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied");
  }
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Notification deleted" });
});

export const deleteNotifications = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;
  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    throw new ApiError(400, "Notification IDs array is required");
  }
  const result = await Notification.deleteMany({ _id: { $in: notificationIds }, userId: req.user._id });
  res.json({ success: true, message: "Notifications deleted", data: { deletedCount: result.deletedCount } });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
  res.json({ success: true, data: { unreadCount } });
});

export const clearAllNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({ userId: req.user._id });
  res.json({ success: true, message: "All notifications cleared", data: { deletedCount: result.deletedCount } });
});
