import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, courseId, content } = req.body;
    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      courseId,
      content
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Error sending message", error: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { courseId } = req.query;
    const messages = await Message.find({ courseId })
      .populate("senderId", "name")
      .populate("receiverId", "name")
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages", error: err.message });
  }
};

export const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: "Error marking message read", error: err.message });
  }
};
