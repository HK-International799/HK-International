import Feedback from "../models/Feedback.js";

export const createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create({ ...req.body, fromUser: req.user._id });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Error creating feedback", error: err.message });
  }
};

export const getAllFeedback = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    const feedbacks = await Feedback.find(filter)
      .populate("fromUser", "name email avatar")
      .populate("toUser", "name email")
      .populate("courseId", "title")
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching feedback", error: err.message });
  }
};

export const updateFeedbackStatus = async (req, res) => {
  try {
    const fb = await Feedback.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!fb) return res.status(404).json({ message: "Feedback not found" });
    res.json(fb);
  } catch (err) {
    res.status(500).json({ message: "Error updating feedback", error: err.message });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: "Feedback deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting feedback", error: err.message });
  }
};

export const getFeedbackStats = async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    const avgRating = await Feedback.aggregate([
      { $match: { rating: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    const byType = await Feedback.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]);
    const byStatus = await Feedback.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    res.json({ total, avgRating: avgRating[0]?.avg || 0, byType, byStatus });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
};
