import Assignment from "../models/Assignment.js";
import Course from "../models/Course.js";
import Question from "../models/Question.js";
import Submission from "../models/Submission.js";
import Answer from "../models/Answer.js";
import User from "../models/User.js";

const isEnrolledInCourse = (user, courseId) => {
  return user.enrolledCourses?.some(
    (id) => id.toString() === courseId.toString(),
  );
};

export const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      dueDate,
      questions = [],
      totalMarks,
    } = req.body;

    if (!title || !courseId) {
      return res.status(400).json({
        message: "title and courseId are required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let questionDocs = [];
    if (Array.isArray(questions) && questions.length > 0) {
      questionDocs = await Question.insertMany(questions);
    }

    const calculatedTotalMarks =
      totalMarks ??
      questionDocs.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

    // ✅ HANDLE FILE
    let fileData = null;

    if (req.file) {
      fileData = {
        url: `/uploads/${req.file.filename}`, // local path
        originalName: req.file.originalname,
      };
    }

    const assignment = await Assignment.create({
      title,
      description,
      courseId,
      dueDate,
      totalMarks: Number(calculatedTotalMarks),
      questions: questionDocs.map((q) => q._id),
      createdBy: req.user._id,
      file: fileData, // ✅ SAVE FILE
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate("questions")
      .populate("courseId", "title");

    res.status(201).json(populatedAssignment);
  } catch (err) {
    res.status(500).json({
      message: "Error creating assignment",
      error: err.message,
    });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const { courseId } = req.query;
    let filter = {};

    if (req.user.role === "student") {
      const student = await User.findById(req.user._id).select(
        "enrolledCourses",
      );

      if (courseId) {
        if (!isEnrolledInCourse(student, courseId)) {
          return res.status(403).json({
            message: "You are not enrolled in this course",
          });
        }
        filter.courseId = courseId;
      } else {
        filter.courseId = { $in: student.enrolledCourses };
      }
    } else {
      if (courseId) {
        filter.courseId = courseId;
      }
    }

    const assignments = await Assignment.find(filter)
      .populate("questions")
      .populate("courseId", "title")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching assignments",
      error: err.message,
    });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("questions")
      .populate("courseId", "title description");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (req.user.role === "student") {
      const student = await User.findById(req.user._id).select(
        "enrolledCourses",
      );
      if (!isEnrolledInCourse(student, assignment.courseId._id)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json(assignment);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching assignment",
      error: err.message,
    });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, questions, totalMarks } = req.body;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (title !== undefined) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate !== undefined) assignment.dueDate = dueDate;

    if (Array.isArray(questions)) {
      if (assignment.questions.length > 0) {
        await Question.deleteMany({ _id: { $in: assignment.questions } });
      }

      const questionDocs =
        questions.length > 0 ? await Question.insertMany(questions) : [];

      assignment.questions = questionDocs.map((q) => q._id);

      assignment.totalMarks =
        totalMarks ??
        questionDocs.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    } else if (totalMarks !== undefined) {
      assignment.totalMarks = totalMarks;
    }

    await assignment.save();

    const updatedAssignment = await Assignment.findById(assignment._id)
      .populate("questions")
      .populate("courseId", "title");

    res.json(updatedAssignment);
  } catch (err) {
    res.status(500).json({
      message: "Error updating assignment",
      error: err.message,
    });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.questions.length > 0) {
      await Question.deleteMany({ _id: { $in: assignment.questions } });
    }

    const submissions = await Submission.find({
      assignmentId: assignment._id,
    }).select("_id");
    const submissionIds = submissions.map((s) => s._id);

    if (submissionIds.length > 0) {
      await Answer.deleteMany({ submissionId: { $in: submissionIds } });
      await Submission.deleteMany({ assignmentId: assignment._id });
    }

    await Assignment.findByIdAndDelete(assignment._id);

    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting assignment",
      error: err.message,
    });
  }
};
