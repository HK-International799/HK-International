import Submission from "../models/Submission.js";
import Answer from "../models/Answer.js";
import Assignment from "../models/Assignment.js";
import User from "../models/User.js";

const isEnrolledInCourse = (user, courseId) => {
  return user.enrolledCourses?.some(
    (id) => id.toString() === courseId.toString()
  );
};

export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, answers = [] } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: "assignmentId is required" });
    }

    const assignment = await Assignment.findById(assignmentId).populate("questions");
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const student = await User.findById(req.user._id).select("enrolledCourses");
    if (!isEnrolledInCourse(student, assignment.courseId)) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }

    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId: req.user._id,
    });

    if (existingSubmission) {
      return res.status(409).json({
        message: "You have already submitted this assignment",
      });
    }

    const validQuestionIds = assignment.questions.map((q) => q._id.toString());

    for (const answer of answers) {
      if (!answer.questionId) {
        return res.status(400).json({
          message: "Each answer must include questionId",
        });
      }

      if (!validQuestionIds.includes(answer.questionId.toString())) {
        return res.status(400).json({
          message: `Invalid questionId: ${answer.questionId}`,
        });
      }
    }

    const submission = await Submission.create({
      assignmentId,
      studentId: req.user._id,
      status: "pending",
    });

    const answerDocs =
      answers.length > 0
        ? await Answer.insertMany(
            answers.map((ans) => ({
              questionId: ans.questionId,
              submissionId: submission._id,
              textAnswer: ans.textAnswer || "",
              fileUrl: ans.fileUrl || "",
              selectedOption: ans.selectedOption || "",
            }))
          )
        : [];

    submission.answers = answerDocs.map((a) => a._id);
    await submission.save();

    const populatedSubmission = await Submission.findById(submission._id)
      .populate("assignmentId", "title dueDate totalMarks")
      .populate("answers");

    res.status(201).json(populatedSubmission);
  } catch (err) {
    res.status(500).json({
      message: "Error submitting assignment",
      error: err.message,
    });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id })
      .populate("assignmentId", "title dueDate totalMarks courseId")
      .populate("answers")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching your submissions",
      error: err.message,
    });
  }
};

export const getMySubmissionForAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submission = await Submission.findOne({
      assignmentId,
      studentId: req.user._id,
    })
      .populate("assignmentId", "title dueDate totalMarks")
      .populate("answers");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json(submission);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching submission",
      error: err.message,
    });
  }
};

export const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignmentId })
      .populate("studentId", "name email")
      .populate("answers")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching submissions",
      error: err.message,
    });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("studentId", "name email")
      .populate("assignmentId", "title dueDate totalMarks")
      .populate("answers");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (
      req.user.role === "student" &&
      submission.studentId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(submission);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching submission",
      error: err.message,
    });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalScore, feedback } = req.body;

    const submission = await Submission.findById(id).populate("assignmentId", "totalMarks");
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (totalScore === undefined || totalScore === null) {
      return res.status(400).json({ message: "totalScore is required" });
    }

    if (Number(totalScore) > Number(submission.assignmentId.totalMarks || 0)) {
      return res.status(400).json({
        message: "totalScore cannot be greater than assignment totalMarks",
      });
    }

    submission.totalScore = totalScore;
    submission.feedback = feedback || "";
    submission.status = "graded";
    submission.gradedBy = req.user._id;

    await submission.save();

    const updatedSubmission = await Submission.findById(submission._id)
      .populate("studentId", "name email")
      .populate("assignmentId", "title totalMarks")
      .populate("answers");

    res.json(updatedSubmission);
  } catch (err) {
    res.status(500).json({
      message: "Error grading submission",
      error: err.message,
    });
  }
};