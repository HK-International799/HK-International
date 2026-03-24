import Batch from "../models/Batch.js";
import User from "../models/User.js";

export const createBatch = async (req, res) => {
  try {
    const batch = await Batch.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(batch);
  } catch (err) {
    res.status(500).json({ message: "Error creating batch", error: err.message });
  }
};

export const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate("courseId", "title")
      .populate("tutorId", "name email")
      .populate("students", "name email")
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: "Error fetching batches", error: err.message });
  }
};

export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("courseId", "title")
      .populate("tutorId", "name email")
      .populate("students", "name email avatar");
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: "Error fetching batch", error: err.message });
  }
};

export const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: "Error updating batch", error: err.message });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: "Batch deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting batch", error: err.message });
  }
};

export const addStudentToBatch = async (req, res) => {
  try {
    const { studentId } = req.body;
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    if (batch.students.includes(studentId)) return res.status(400).json({ message: "Student already in batch" });
    if (batch.students.length >= batch.maxStudents) return res.status(400).json({ message: "Batch is full" });
    batch.students.push(studentId);
    await batch.save();
    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: "Error adding student", error: err.message });
  }
};

export const removeStudentFromBatch = async (req, res) => {
  try {
    const { studentId } = req.body;
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    batch.students = batch.students.filter((s) => s.toString() !== studentId);
    await batch.save();
    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: "Error removing student", error: err.message });
  }
};
