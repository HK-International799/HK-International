import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";

export const getStudentDashboard = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .select("-passwordHash")
      .populate("enrolledCourses", "title description thumbnail createdAt");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const enrolledCourseIds = student.enrolledCourses.map((course) => course._id);

    const assignments = await Assignment.find({
      courseId: { $in: enrolledCourseIds },
    })
      .populate("courseId", "title")
      .sort({ dueDate: 1, createdAt: -1 });

    const submissions = await Submission.find({
      studentId: req.user._id,
    }).select("assignmentId status totalScore createdAt");

    const submittedAssignmentIds = new Set(
      submissions.map((s) => s.assignmentId.toString())
    );

    const pendingAssignments = assignments.filter(
      (assignment) => !submittedAssignmentIds.has(assignment._id.toString())
    );

    const gradedCount = submissions.filter((s) => s.status === "graded").length;

    res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
      },
      summary: {
        enrolledCoursesCount: student.enrolledCourses.length,
        totalAssignmentsCount: assignments.length,
        submittedAssignmentsCount: submissions.length,
        pendingAssignmentsCount: pendingAssignments.length,
        gradedAssignmentsCount: gradedCount,
      },
      enrolledCourses: student.enrolledCourses,
      upcomingAssignments: pendingAssignments.slice(0, 5),
      recentSubmissions: submissions.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching student dashboard",
      error: err.message,
    });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .select("name email enrolledCourses")
      .populate({
        path: "enrolledCourses",
        populate: {
          path: "sections",
          populate: {
            path: "lessons",
          },
        },
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student.enrolledCourses);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching courses",
      error: err.message,
    });
  }
};

export const getMyAssignments = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select("enrolledCourses");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const assignments = await Assignment.find({
      courseId: { $in: student.enrolledCourses },
    })
      .populate("courseId", "title")
      .populate("questions")
      .sort({ dueDate: 1, createdAt: -1 });

    const submissions = await Submission.find({
      studentId: req.user._id,
    }).select("assignmentId status totalScore feedback");

    const submissionMap = new Map(
      submissions.map((s) => [s.assignmentId.toString(), s])
    );

    const result = assignments.map((assignment) => {
      const submission = submissionMap.get(assignment._id.toString());

      return {
        ...assignment.toObject(),
        submissionStatus: submission ? submission.status : "not_submitted",
        totalScore: submission ? submission.totalScore : null,
        feedback: submission ? submission.feedback : "",
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching assignments",
      error: err.message,
    });
  }
};