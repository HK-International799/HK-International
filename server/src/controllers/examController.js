
// controllers/examController.js

import mongoose from "mongoose";
import Exam from "../models/Exam.js";
import User from "../models/User.js";
import { buildQuestionSet, getQuestionsByCourse } from "../utils/questionUtils.js";

// ─── HELPER: check whether a courseId is in the student's enrolledCourses ───
// Mirrors the enrollment-check pattern from src/services/assignmentService.js
const _isStudentEnrolled = (enrolledCourses = [], courseId) => {
  if (!courseId) return false;
  const target = courseId.toString();
  return enrolledCourses.some((id) => id?.toString() === target);
};

// ─── CREATE EXAM ─────────────────────────────────────────────────────────────
// POST /api/exams/create
const createExam = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const {
      title,
      description,
      courseId,
      timeLimit,
      totalQuestions,
      passingScore,
      maxAttempts,
      allowReattempt,
      reattemptNewQuestions,
      manualQuestions = [],
    } = req.body;

    if (!title || !courseId || !timeLimit || !totalQuestions) {
      return res.status(400).json({
        message: "title, courseId, timeLimit, totalQuestions are required",
      });
    }

    const { questionSet, error } = await buildQuestionSet(
      courseId,
      Number(totalQuestions),
      manualQuestions
    );

    if (error) return res.status(422).json({ message: error });

    if (!questionSet || !questionSet.length) {
      return res.status(500).json({ message: "Failed to generate question set" });
    }

    const exam = await Exam.create({
      title,
      description,
      courseId,
      timeLimit: Number(timeLimit),
      totalQuestions: Number(totalQuestions),
      questions: questionSet,
      passingScore: passingScore !== undefined ? Number(passingScore) : 40,
      maxAttempts: maxAttempts !== undefined ? Number(maxAttempts) : 1,
      allowReattempt: Boolean(allowReattempt),
      reattemptNewQuestions:
        reattemptNewQuestions !== undefined ? Boolean(reattemptNewQuestions) : true,
      isActive: true,
      createdBy: req.user._id,
    });

    return res.status(201).json({ message: "Exam created successfully", exam });
  } catch (err) {
    console.error("❌ createExam ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── LIST ALL EXAMS (ADMIN) ───────────────────────────────────────────────────
// GET /api/exams
const listExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("courseId", "title name")
      .populate("createdBy", "name email")
      .select("-questions")
      .sort({ createdAt: -1 });

    return res.json(exams);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── LIST ACTIVE EXAMS (STUDENT) ─────────────────────────────────────────────
// GET /api/exams/active
const listActiveExams = async (req, res) => {
  try {
    const filter = { isActive: true };

    // Students: restrict to exams whose courseId is in their enrolledCourses
    if (req.user?.role === "student") {
      const student = await User.findById(req.user._id).select("enrolledCourses");
      const enrolled = student?.enrolledCourses || [];

      // No enrollments -> return empty list (NOT an error)
      if (enrolled.length === 0) {
        return res.json([]);
      }

      filter.courseId = { $in: enrolled };
    }
    // Admin/tutor: no extra filter — preserve existing behavior

    const exams = await Exam.find(filter)
      .populate("courseId", "title name")
      .select("-questions")
      .sort({ createdAt: -1 });

    return res.json(exams);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── GET SINGLE EXAM ──────────────────────────────────────────────────────────
// GET /api/exams/:id
const getExam = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid exam ID" });
    }

    const exam = await Exam.findById(req.params.id)
      .populate("courseId", "title name")
      .populate("createdBy", "name email");

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    // Enrollment guard: students can only fetch exams for courses they're enrolled in
    if (req.user?.role === "student") {
      const student = await User.findById(req.user._id).select("enrolledCourses");
      const examCourseId =
        exam.courseId?._id?.toString() || exam.courseId?.toString();

      if (!_isStudentEnrolled(student?.enrolledCourses, examCourseId)) {
        return res
          .status(403)
          .json({ message: "You are not enrolled in the course for this exam" });
      }
    }

    return res.json(exam);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── UPDATE EXAM ──────────────────────────────────────────────────────────────
// PUT /api/exams/:id
const updateExam = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid exam ID" });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const {
      title,
      description,
      timeLimit,
      passingScore,
      maxAttempts,
      allowReattempt,
      reattemptNewQuestions,
      // courseId and questions are intentionally NOT updatable via this route
      // to prevent data inconsistency. Use regenerateQuestions route instead.
    } = req.body;

    if (title !== undefined) exam.title = title;
    if (description !== undefined) exam.description = description;
    if (timeLimit !== undefined) exam.timeLimit = Number(timeLimit);
    if (passingScore !== undefined) exam.passingScore = Number(passingScore);
    if (maxAttempts !== undefined) exam.maxAttempts = Number(maxAttempts);
    if (allowReattempt !== undefined) exam.allowReattempt = Boolean(allowReattempt);
    if (reattemptNewQuestions !== undefined)
      exam.reattemptNewQuestions = Boolean(reattemptNewQuestions);

    await exam.save();

    return res.json({ message: "Exam updated successfully", exam });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── DELETE EXAM ──────────────────────────────────────────────────────────────
// DELETE /api/exams/:id
const deleteExam = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid exam ID" });
    }

    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    return res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── TOGGLE ACTIVE STATUS ─────────────────────────────────────────────────────
// PATCH /api/exams/:id/toggle
const toggleExamStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid exam ID" });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    exam.isActive = !exam.isActive;
    await exam.save();

    return res.json({
      message: `Exam ${exam.isActive ? "activated" : "deactivated"}`,
      isActive: exam.isActive,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── REGENERATE QUESTION POOL ─────────────────────────────────────────────────
// POST /api/exams/:id/regenerate
// Useful when you want to reshuffle the question set for an existing exam.
const regenerateQuestions = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid exam ID" });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const { manualQuestions = [] } = req.body;

    const { questionSet, error } = await buildQuestionSet(
      exam.courseId,
      exam.totalQuestions,
      manualQuestions
    );

    if (error) return res.status(422).json({ message: error });

    exam.questions = questionSet;
    await exam.save();

    return res.json({ message: "Question pool regenerated", questionCount: questionSet.length });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── GET QUESTION COUNT FOR COURSE ───────────────────────────────────────────
// GET /api/exams/course/:courseId/question-count
const getCourseQuestionCount = async (req, res) => {
  try {
    const questions = await getQuestionsByCourse(req.params.courseId);
    return res.json({ count: questions.length, courseId: req.params.courseId });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export default {
  createExam,
  listExams,
  listActiveExams,
  getExam,
  updateExam,
  deleteExam,
  toggleExamStatus,
  regenerateQuestions,
  getCourseQuestionCount,
};