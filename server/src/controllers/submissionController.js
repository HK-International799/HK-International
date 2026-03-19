import Submission from "../models/Submission.js";
import Answer from "../models/Answer.js";

export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, answers } = req.body;
    const submission = new Submission({ assignmentId, studentId: req.user.id });
    await submission.save();

    const answerDocs = await Answer.insertMany(
      answers.map(ans => ({ ...ans, submissionId: submission._id }))
    );
    submission.answers = answerDocs.map(a => a._id);
    await submission.save();

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: "Error submitting assignment", error: err.message });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalScore, feedback } = req.body;
    const submission = await Submission.findById(id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    submission.totalScore = totalScore;
    submission.feedback = feedback;
    submission.status = "graded";
    submission.gradedBy = req.user.id;
    await submission.save();

    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: "Error grading submission", error: err.message });
  }
};
