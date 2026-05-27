// controllers/attemptController.js

import Exam from "../models/Exam.js";
import Attempt from "../models/Attempt.js";
import User from "../models/User.js";
import { randomSelect } from "../utils/questionUtils.js";

// ─── START EXAM ATTEMPT ───────────────────────────────────────────────────────
// POST /api/exams/:id/start
const startExam = async (req, res) => {
  try {
    const studentId = req.user._id;
    const examId = req.params.id;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (!exam.isActive) {
      return res.status(403).json({ message: "Exam is not active" });
    }

    // ─── ENROLLMENT GUARD (students only) ────────────────────────────────────
    // Mirrors the enrollment-check pattern used in assignmentService.js
    if (req.user?.role === "student") {
      const student = await User.findById(req.user._id).select("enrolledCourses");
      const examCourseId = exam.courseId?.toString();
      const enrolled = (student?.enrolledCourses || []).some(
        (id) => id?.toString() === examCourseId
      );
      if (!enrolled) {
        return res
          .status(403)
          .json({ message: "You are not enrolled in this course" });
      }
    }

    // Count all attempts for this student + exam
    const existingAttempts = await Attempt.countDocuments({
      studentId,
      examId,
      status: { $in: ["submitted", "expired", "in_progress"] },
    });

    // Max attempts check
    if (existingAttempts >= exam.maxAttempts) {
      return res.status(403).json({
        message: `Maximum attempts (${exam.maxAttempts}) reached`,
      });
    }

    // ─── CHECK FOR IN-PROGRESS ATTEMPT ──────────────────────────────────────

    const inProgress = await Attempt.findOne({
      studentId,
      examId,
      status: "in_progress",
    });

    if (inProgress) {
      // If expired -> auto submit
      if (new Date() > inProgress.endTime) {
        await _autoSubmit(inProgress, exam);

        // Re-check max attempts after auto-submit
        const freshCount = await Attempt.countDocuments({
          studentId,
          examId,
        });

        if (freshCount >= exam.maxAttempts) {
          return res.status(403).json({
            message: "Maximum attempts reached",
          });
        }
      } else {
        // Resume running attempt
        const safeQuestions = inProgress.questionSet.map(_stripAnswers);

        return res.json({
          message: "Resuming existing attempt",
          attemptId: inProgress._id,
          questions: safeQuestions,
          startTime: inProgress.startTime,
          endTime: inProgress.endTime,
          answers: inProgress.answers,
        });
      }
    }

    // ─── GENERATE QUESTION SET ──────────────────────────────────────────────

    let questionSet;

    if (exam.reattemptNewQuestions || existingAttempts === 0) {
      questionSet = randomSelect(exam.questions, exam.totalQuestions);
    } else {
      // Reuse same questions
      questionSet = exam.questions.slice(0, exam.totalQuestions);
    }

    const now = new Date();

    const endTime = new Date(now.getTime() + exam.timeLimit * 60 * 1000);

    // ─── SAFE ATTEMPT CREATION (FIXED) ─────────────────────────────────────

    let attempt;
    let created = false;

    while (!created) {
      try {
        // Get latest attempt safely
        const latestAttempt = await Attempt.findOne({
          studentId,
          examId,
        }).sort({ attemptNumber: -1 });

        const nextAttemptNumber = latestAttempt
          ? latestAttempt.attemptNumber + 1
          : 1;

        attempt = await Attempt.create({
          studentId,
          examId,
          attemptNumber: nextAttemptNumber,
          questionSet,
          answers: [],
          startTime: now,
          endTime,
          status: "in_progress",
        });

        created = true;
      } catch (err) {
        // Retry only for duplicate key race condition
        if (err.code === 11000) {
          continue;
        }

        throw err;
      }
    }

    // ─── RESPONSE ───────────────────────────────────────────────────────────

    return res.status(201).json({
      message: "Exam started",
      attemptId: attempt._id,
      questions: questionSet.map(_stripAnswers),
      startTime: now,
      endTime,
    });
  } catch (err) {
    console.error("startExam error:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ─── SAVE ANSWER (auto-save while exam is running) ────────────────────────────
// PATCH /api/exams/:id/answer
const saveAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, selectedOption } = req.body;
    const studentId = req.user._id;

    if (!attemptId || !questionId) {
      return res
        .status(400)
        .json({ message: "attemptId and questionId are required" });
    }

    const attempt = await Attempt.findOne({
      _id: attemptId,
      studentId,
      status: "in_progress",
    });

    if (!attempt) {
      return res.status(404).json({ message: "Active attempt not found" });
    }

    if (new Date() > attempt.endTime) {
      const exam = await Exam.findById(attempt.examId);
      await _autoSubmit(attempt, exam);
      return res
        .status(410)
        .json({ message: "Exam time expired. Auto-submitted." });
    }

    const existing = attempt.answers.find(
      (a) => a.questionId.toString() === questionId,
    );

    // if (existing) {
    //   existing.selectedOption = selectedOption;
    // } else {
    //   attempt.answers.push({ questionId, selectedOption });
    // }

    //above code replaced with bellow
    if (selectedOption === null) {
      // Remove cleared answer completely
      attempt.answers = attempt.answers.filter(
        (a) => a.questionId.toString() !== questionId,
      );
    } else {
      const existing = attempt.answers.find(
        (a) => a.questionId.toString() === questionId,
      );

      if (existing) {
        existing.selectedOption = selectedOption;
      } else {
        attempt.answers.push({
          questionId,
          selectedOption,
        });
      }
    }

    await attempt.save();
    return res.json({ message: "Answer saved" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ─── SUBMIT EXAM ──────────────────────────────────────────────────────────────
// POST /api/exams/:id/submit
const submitExam = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    const studentId = req.user._id;

    if (!attemptId) {
      return res.status(400).json({ message: "attemptId is required" });
    }

    const attempt = await Attempt.findOne({ _id: attemptId, studentId });
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    if (attempt.status !== "in_progress") {
      return res.status(400).json({ message: "Attempt already submitted" });
    }

    const exam = await Exam.findById(attempt.examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    // Merge any last-minute answers sent with the submit request
    if (answers && Array.isArray(answers)) {
      for (const ans of answers) {
        const existing = attempt.answers.find(
          (a) => a.questionId.toString() === ans.questionId,
        );
        if (existing) {
          existing.selectedOption = ans.selectedOption;
        } else {
          attempt.answers.push({
            questionId: ans.questionId,
            selectedOption: ans.selectedOption,
          });
        }
      }
    }

    const result = _calculateResult(attempt, exam);

    attempt.answers = result.scoredAnswers;
    attempt.result = result.summary;
    attempt.submittedAt = new Date();
    attempt.status = "submitted";

    await attempt.save();

    return res.json({
      message: "Exam submitted successfully",
      result: result.summary,
    });
  } catch (err) {
    console.error("submitExam error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ─── GET ATTEMPT RESULT (STUDENT) ─────────────────────────────────────────────
// GET /api/exams/:id/result/:attemptId
const getAttemptResult = async (req, res) => {
  try {
    const studentId = req.user._id;

    const attempt = await Attempt.findOne({
      _id: req.params.attemptId,
      studentId,
      examId: req.params.id,
    }).populate("examId", "title passingScore");

    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    if (attempt.status === "in_progress") {
      return res.status(400).json({ message: "Exam not yet submitted" });
    }

    return res.json({
      attempt: {
        _id: attempt._id,
        attemptNumber: attempt.attemptNumber,
        status: attempt.status,
        startTime: attempt.startTime,
        submittedAt: attempt.submittedAt,
        result: attempt.result,
        feedback: attempt.feedback,
      },
      questionBreakdown: attempt.questionSet.map((q) => {
        const ans = attempt.answers.find(
          (a) => a.questionId.toString() === q._id.toString(),
        );
        return {
          questionId: q._id,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          selectedOption: ans ? ans.selectedOption : null,
          isCorrect: ans ? ans.isCorrect : false,
          marksAwarded: ans ? ans.marksAwarded : 0,
        };
      }),
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ─── EXAM REPORT (ADMIN) ──────────────────────────────────────────────────────
// GET /api/exams/:id/report
const getExamReport = async (req, res) => {
  try {
    const attempts = await Attempt.find({
      examId: req.params.id,
      status: { $ne: "in_progress" },
    })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    const report = attempts.map((a) => ({
      attemptId: a._id,
      student: a.studentId,
      attemptNumber: a.attemptNumber,
      status: a.status,
      startTime: a.startTime,
      submittedAt: a.submittedAt,
      timeTaken: a.result?.timeTaken || 0,
      score: a.result?.marksObtained || 0,
      totalMarks: a.result?.totalMarks || 0,
      percentage: a.result?.percentage || 0,
      correct: a.result?.correct || 0,
      incorrect: a.result?.incorrect || 0,
      skipped: a.result?.skipped || 0,
      isPassed: a.result?.isPassed || false,
      feedback: a.feedback,
    }));

    return res.json({
      examId: req.params.id,
      totalAttempts: attempts.length,
      report,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ─── DETAILED ATTEMPT VIEW (ADMIN) ────────────────────────────────────────────
// GET /api/exams/:id/report/:attemptId
const getAttemptDetail = async (req, res) => {
  try {
    const attempt = await Attempt.findOne({
      _id: req.params.attemptId,
      examId: req.params.id,
    }).populate("studentId", "name email");

    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    return res.json({
      attempt,
      questionBreakdown: attempt.questionSet.map((q) => {
        const ans = attempt.answers.find(
          (a) => a.questionId.toString() === q._id.toString(),
        );
        return {
          questionId: q._id,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          selectedOption: ans ? ans.selectedOption : null,
          isCorrect: ans ? ans.isCorrect : false,
          marksAwarded: ans ? ans.marksAwarded : 0,
        };
      }),
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ─── ADD FEEDBACK (ADMIN) ─────────────────────────────────────────────────────
// POST /api/exams/:id/feedback/:attemptId
const addFeedback = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ message: "Feedback text required" });

    const attempt = await Attempt.findOne({
      _id: req.params.attemptId,
      examId: req.params.id,
    });
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    attempt.feedback = { text, addedBy: req.user._id, addedAt: new Date() };
    await attempt.save();

    return res.json({ message: "Feedback added", feedback: attempt.feedback });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Strip correct answer and explanation before sending to student.
 */
function _stripAnswers(q) {
  // Return a plain object without correctAnswer / explanation
  return {
    _id: q._id,
    questionText: q.questionText,
    options: q.options,
    marks: q.marks,
    negativeMarks: q.negativeMarks,
  };
}

/**
 * Score all answers and compute summary statistics.
 * correctAnswer is stored as a label letter ("A", "B", "C", "D").
 * selectedOption is also a label letter.
 */
function _calculateResult(attempt, exam) {
  let totalMarks = 0;
  let marksObtained = 0;
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;

  const scoredAnswers = attempt.questionSet.map((q) => {
    const marks = q.marks || 1;
    const negativeMarks = q.negativeMarks || 0;
    totalMarks += marks;

    const answer = attempt.answers.find(
      (a) => a.questionId.toString() === q._id.toString(),
    );

    const selected = answer ? answer.selectedOption : null;

    let isCorrect = false;
    let marksAwarded = 0;

    if (!selected) {
      // Skipped
      skipped++;
    } else if (selected === q.correctAnswer) {
      isCorrect = true;
      marksAwarded = marks;
      marksObtained += marks;
      correct++;
    } else {
      // Wrong
      marksAwarded = -negativeMarks;
      marksObtained -= negativeMarks;
      incorrect++;
    }

    return {
      questionId: q._id,
      selectedOption: selected,
      isCorrect,
      marksAwarded,
    };
  });

  // Clamp to 0 (can't go negative overall)
  marksObtained = Math.max(0, marksObtained);

  const percentage =
    totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;

  const isPassed = percentage >= (exam.passingScore || 40);

  const timeTaken = attempt.submittedAt
    ? Math.round((new Date() - new Date(attempt.startTime)) / 1000)
    : Math.round((new Date() - new Date(attempt.startTime)) / 1000);

  const summary = {
    totalQuestions: attempt.questionSet.length,
    attempted: correct + incorrect,
    correct,
    incorrect,
    skipped,
    totalMarks,
    marksObtained,
    percentage,
    isPassed,
    timeTaken,
  };

  return { scoredAnswers, summary };
}

/**
 * Auto-submit an expired attempt.
 */
async function _autoSubmit(attempt, exam) {
  try {
    if (attempt.status !== "in_progress") return;

    const result = _calculateResult(attempt, exam);
    attempt.answers = result.scoredAnswers;
    attempt.result = result.summary;
    attempt.submittedAt = new Date();
    attempt.status = "submitted";
    attempt.isAutoSubmitted = true;
    await attempt.save();
    console.log("⏱ Auto-submitted attempt:", attempt._id);
  } catch (err) {
    console.error("❌ _autoSubmit ERROR:", err);
  }
}

// ─── DOWNLOAD FULL EXAM REPORT (ADMIN) ───────────────────────────────────────
// GET /api/exams/:id/report/download
const downloadExamReport = async (req, res) => {
  try {
    const examId = req.params.id;

    const attempts = await Attempt.find({
      examId,
      status: { $ne: "in_progress" },
    })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // CSV Header
    let csv =
      "Student Name,Email,Attempt,Score,Total Marks,Percentage,Correct,Incorrect,Skipped,Time Taken (sec),Result,Feedback,Submitted At\n";

    // Rows
    attempts.forEach((a) => {
      csv += `"${a.studentId?.name || ""}",`;
      csv += `"${a.studentId?.email || ""}",`;
      csv += `${a.attemptNumber},`;
      csv += `${a.result?.marksObtained || 0},`;
      csv += `${a.result?.totalMarks || 0},`;
      csv += `${a.result?.percentage || 0},`;
      csv += `${a.result?.correct || 0},`;
      csv += `${a.result?.incorrect || 0},`;
      csv += `${a.result?.skipped || 0},`;
      csv += `${a.result?.timeTaken || 0},`;
      csv += `${a.result?.isPassed ? "Pass" : "Fail"},`;
      csv += `"${a.feedback?.text?.replace(/"/g, '""') || ""}",`;
      csv += `"${a.submittedAt ? new Date(a.submittedAt).toISOString() : ""}"\n`;
    });

    // Response headers for download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=exam-report-${examId}.csv`,
    );

    return res.send(csv);
  } catch (err) {
    console.error("downloadExamReport error:", err);
    return res.status(500).json({
      message: "Failed to download report",
      error: err.message,
    });
  }
};

export default {
  startExam,
  saveAnswer,
  submitExam,
  getAttemptResult,
  getExamReport,
  getAttemptDetail,
  addFeedback,
  downloadExamReport,
};
