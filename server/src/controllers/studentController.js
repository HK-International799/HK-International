import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Chapter from "../models/Chapter.js";
import ChapterProgress from "../models/ChapterProgress.js";


/* ================================
   STUDENT DASHBOARD
================================ */

export const getStudentDashboard = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .select("-passwordHash")
      .populate("enrolledCourses", "title description thumbnail createdAt");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const enrolledCourseIds = student.enrolledCourses.map((c) => c._id);

    /* ===============================
       GET CHAPTER DATA FOR PROGRESS
    =============================== */
    const coursesWithProgress = await Promise.all(
      student.enrolledCourses.map(async (course) => {
        const totalChapters = await Chapter.countDocuments({
          courseId: course._id,
        });

        const completedChapters = await ChapterProgress.countDocuments({
          courseId: course._id,
          studentId: req.user._id,
          completed: true,
        });

        const progress =
          totalChapters > 0
            ? Math.round((completedChapters / totalChapters) * 100)
            : 0;

        return {
          ...course.toObject(),
          totalChapters,
          completedChapters,
          progress,
        };
      })
    );

    /* ===============================
       ASSIGNMENTS
    =============================== */
    const assignments = await Assignment.find({
      courseId: { $in: enrolledCourseIds },
    }).populate("courseId", "title");

    const submissions = await Submission.find({
      studentId: req.user._id,
    });

    const pendingAssignments = assignments.filter(
      (a) =>
        !submissions.find(
          (s) => s.assignmentId.toString() === a._id.toString()
        )
    );

    /* ===============================
       SUMMARY (IMPORTANT)
    =============================== */
    const summary = {
      enrolledCoursesCount: coursesWithProgress.length,
      totalAssignmentsCount: assignments.length,
      submittedAssignmentsCount: submissions.length,
      pendingAssignmentsCount: pendingAssignments.length,
      gradedAssignmentsCount: submissions.filter(
        (s) => s.status === "graded"
      ).length,
    };

    res.json({
      student,
      summary,
      enrolledCourses: coursesWithProgress, // ✅ IMPORTANT
      upcomingAssignments: pendingAssignments.slice(0, 5),
      recentSubmissions: submissions.slice(0, 5),
    });
  } catch (err) {
    console.error("Dashboard Error:", err); // 👈 ADD THIS
    res.status(500).json({ message: err.message });
  }
};


/* ================================
   MY COURSES
================================ */

export const getMyCourses = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .populate({
        path: "enrolledCourses",
        populate: {
          path: "sections",
          populate: {
            path: "lessons",
            select: "title order",
          },
        },
      });

    res.json(student.enrolledCourses);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   COURSE PLAYER
================================ */

export const getCoursePlayer = async (req, res) => {
  try {

    const courseId = req.params.id;

    const course = await Course.findById(courseId)
      .populate({
        path: "sections",
        populate: {
          path: "lessons",
          populate: {
            path: "quizId",
            select: "title totalMarks isPublished"
          }
        }
      });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const attempts = await QuizAttempt.find({
      studentId: req.user._id
    });

    course.sections.forEach(section => {

      section.lessons.sort((a, b) => a.order - b.order);

      section.lessons.forEach((lesson, index) => {

        if (index === 0) {
          lesson._doc.unlocked = true;
          return;
        }

        const prevLesson = section.lessons[index - 1];

        const attempt = attempts.find(
          a =>
            a.quizId?.toString() ===
            prevLesson.quizId?._id?.toString()
        );

        lesson._doc.unlocked = !!attempt;
      });

    });

    res.json(course);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   LESSON CONTENT
================================ */

export const getLessonContent = async (req, res) => {
  try {

    const lesson = await Lesson.findById(req.params.id)
      .populate("quizId");

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json(lesson);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   SUBMIT QUIZ
================================ */

export const submitQuiz = async (req, res) => {
  try {

    const { quizId, answers } = req.body;

    const quiz = await Quiz.findById(quizId)
      .populate("questions");

    let score = 0;

    answers.forEach(ans => {

      const question = quiz.questions.find(
        q => q._id.toString() === ans.questionId
      );

      if (question.correctAnswer === ans.selectedOption) {
        score += question.marks;
      }

    });

    const attempt = await QuizAttempt.create({
      quizId,
      studentId: req.user._id,
      answers,
      score,
      completedAt: new Date()
    });

    res.json({
      message: "Quiz submitted",
      score,
      attempt
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET QUIZ ATTEMPT
================================ */

export const getQuizAttempt = async (req, res) => {
  try {

    const attempt = await QuizAttempt.findOne({
      quizId: req.params.quizId,
      studentId: req.user._id
    });

    res.json(attempt);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   MY ASSIGNMENTS
================================ */

export const getMyAssignments = async (req, res) => {
  try {

    const student = await User.findById(req.user._id);

    const assignments = await Assignment.find({
      courseId: { $in: student.enrolledCourses }
    }).populate("courseId", "title");

    res.json(assignments);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};