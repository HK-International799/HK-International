import QuestionBank from "../models/QuestionBank.js";
import Question from "../models/Question.js";

export const createQuestionBank = async (req, res) => {
  try {
    const qb = await QuestionBank.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(qb);
  } catch (err) {
    res.status(500).json({ message: "Error creating question bank", error: err.message });
  }
};

export const getAllQuestionBanks = async (req, res) => {
  try {
    const qbs = await QuestionBank.find()
      .populate("courseId", "title")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(qbs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching question banks", error: err.message });
  }
};

export const getQuestionBankById = async (req, res) => {
  try {
    const qb = await QuestionBank.findById(req.params.id)
      .populate("questions")
      .populate("courseId", "title");
    if (!qb) return res.status(404).json({ message: "Question bank not found" });
    res.json(qb);
  } catch (err) {
    res.status(500).json({ message: "Error fetching question bank", error: err.message });
  }
};

export const updateQuestionBank = async (req, res) => {
  try {
    const qb = await QuestionBank.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!qb) return res.status(404).json({ message: "Question bank not found" });
    res.json(qb);
  } catch (err) {
    res.status(500).json({ message: "Error updating", error: err.message });
  }
};

export const deleteQuestionBank = async (req, res) => {
  try {
    await QuestionBank.findByIdAndDelete(req.params.id);
    res.json({ message: "Question bank deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting", error: err.message });
  }
};

export const addQuestionToBank = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    const qb = await QuestionBank.findByIdAndUpdate(
      req.params.id,
      { $push: { questions: question._id } },
      { new: true }
    ).populate("questions");
    res.status(201).json(qb);
  } catch (err) {
    res.status(500).json({ message: "Error adding question", error: err.message });
  }
};

export const removeQuestionFromBank = async (req, res) => {
  try {
    const qb = await QuestionBank.findByIdAndUpdate(
      req.params.id,
      { $pull: { questions: req.params.questionId } },
      { new: true }
    );
    res.json(qb);
  } catch (err) {
    res.status(500).json({ message: "Error removing question", error: err.message });
  }
};
