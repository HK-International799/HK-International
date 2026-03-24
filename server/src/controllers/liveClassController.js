import LiveClass from "../models/LiveClass.js";

export const createLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(liveClass);
  } catch (err) {
    res.status(500).json({ message: "Error creating live class", error: err.message });
  }
};

export const getAllLiveClasses = async (req, res) => {
  try {
    const classes = await LiveClass.find()
      .populate("courseId", "title")
      .populate("tutorId", "name email")
      .populate("batchId", "name")
      .sort({ scheduledAt: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching live classes", error: err.message });
  }
};

export const getLiveClassById = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id)
      .populate("courseId", "title")
      .populate("tutorId", "name email")
      .populate("attendees", "name email");
    if (!liveClass) return res.status(404).json({ message: "Live class not found" });
    res.json(liveClass);
  } catch (err) {
    res.status(500).json({ message: "Error fetching live class", error: err.message });
  }
};

export const updateLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!liveClass) return res.status(404).json({ message: "Live class not found" });
    res.json(liveClass);
  } catch (err) {
    res.status(500).json({ message: "Error updating live class", error: err.message });
  }
};

export const deleteLiveClass = async (req, res) => {
  try {
    await LiveClass.findByIdAndDelete(req.params.id);
    res.json({ message: "Live class deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting live class", error: err.message });
  }
};
