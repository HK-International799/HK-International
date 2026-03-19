import Notification from "../models/Notification.js";

export const pushNotification = async (req, res) => {
  try {
    const { userId, type, title, body } = req.body;
    const notification = await Notification.create({ userId, type, title, body });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: "Error creating notification", error: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications", error: err.message });
  }
};
