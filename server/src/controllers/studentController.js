// import User from "../models/User.js";
// import Assignment from "../models/Assignment.js";
// import Submission from "../models/Submission.js";

// export const getStudentDashboard = async (req, res) => {
//   try {
//     const student = await User.findById(req.user._id)
//       .select("-passwordHash")
//       .populate("enrolledCourses", "title description thumbnail createdAt");

//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     const enrolledCourseIds = student.enrolledCourses.map((course) => course._id);

//     const assignments = await Assignment.find({
//       courseId: { $in: enrolledCourseIds },
//     })
//       .populate("courseId", "title")
//       .sort({ dueDate: 1, createdAt: -1 });

//     const submissions = await Submission.find({
//       studentId: req.user._id,
//     }).select("assignmentId status totalScore createdAt");

//     const submittedAssignmentIds = new Set(
//       submissions.map((s) => s.assignmentId.toString())
//     );

//     const pendingAssignments = assignments.filter(
//       (assignment) => !submittedAssignmentIds.has(assignment._id.toString())
//     );

//     const gradedCount = submissions.filter((s) => s.status === "graded").length;

//     res.json({
//       student: {
//         id: student._id,
//         name: student.name,
//         email: student.email,
//         role: student.role,
//       },
//       summary: {
//         enrolledCoursesCount: student.enrolledCourses.length,
//         totalAssignmentsCount: assignments.length,
//         submittedAssignmentsCount: submissions.length,
//         pendingAssignmentsCount: pendingAssignments.length,
//         gradedAssignmentsCount: gradedCount,
//       },
//       enrolledCourses: student.enrolledCourses,
//       upcomingAssignments: pendingAssignments.slice(0, 5),
//       recentSubmissions: submissions.slice(0, 5),
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Error fetching student dashboard",
//       error: err.message,
//     });
//   }
// };

// export const getMyCourses = async (req, res) => {
//   try {
//     const student = await User.findById(req.user._id)
//       .select("name email enrolledCourses")
//       .populate({
//         path: "enrolledCourses",
//         populate: {
//           path: "sections",
//           populate: {
//             path: "lessons",
//           },
//         },
//       });

//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     res.json(student.enrolledCourses);
//   } catch (err) {
//     res.status(500).json({
//       message: "Error fetching courses",
//       error: err.message,
//     });
//   }
// };

// export const getMyAssignments = async (req, res) => {
//   try {
//     const student = await User.findById(req.user._id).select("enrolledCourses");
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     const assignments = await Assignment.find({
//       courseId: { $in: student.enrolledCourses },
//     })
//       .populate("courseId", "title")
//       .populate("questions")
//       .sort({ dueDate: 1, createdAt: -1 });

//     const submissions = await Submission.find({
//       studentId: req.user._id,
//     }).select("assignmentId status totalScore feedback");

//     const submissionMap = new Map(
//       submissions.map((s) => [s.assignmentId.toString(), s])
//     );

//     const result = assignments.map((assignment) => {
//       const submission = submissionMap.get(assignment._id.toString());

//       return {
//         ...assignment.toObject(),
//         submissionStatus: submission ? submission.status : "not_submitted",
//         totalScore: submission ? submission.totalScore : null,
//         feedback: submission ? submission.feedback : "",
//       };
//     });

//     res.json(result);
//   } catch (err) {
//     res.status(500).json({
//       message: "Error fetching assignments",
//       error: err.message,
//     });
//   }
// };

import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Progress from "../models/Progress.js";
import Certificate from "../models/Certificate.js";
import Course from "../models/Course.js";
import bcrypt from "bcryptjs";

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getStudentDashboard = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .select("-passwordHash")
      .populate(
        "enrolledCourses",
        "title description thumbnail createdAt status",
      );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const enrolledCourseIds = student.enrolledCourses.map((c) => c._id);

    // Assignments for enrolled courses
    const assignments = await Assignment.find({
      courseId: { $in: enrolledCourseIds },
    })
      .populate("courseId", "title")
      .sort({ dueDate: 1, createdAt: -1 });

    // Student submissions
    const submissions = await Submission.find({
      studentId: req.user._id,
    })
      .populate("assignmentId", "title dueDate totalMarks courseId")
      .select("assignmentId status totalScore createdAt feedback")
      .sort({ createdAt: -1 });

    // Progress per course
    const progressRecords = await Progress.find({
      studentId: req.user._id,
    });

    const progressMap = new Map(
      progressRecords.map((p) => [p.courseId.toString(), p]),
    );

    const submittedAssignmentIds = new Set(
      submissions.map((s) => s.assignmentId?._id?.toString()).filter(Boolean),
    );

    const pendingAssignments = assignments.filter(
      (a) => !submittedAssignmentIds.has(a._id.toString()),
    );

    const gradedCount = submissions.filter((s) => s.status === "graded").length;

    // Enrich courses with progress
    const enrichedCourses = student.enrolledCourses.map((course) => {
      const prog = progressMap.get(course._id.toString());
      return {
        ...course.toObject(),
        progress: prog?.progressPercent ?? 0,
        completedLessons: prog?.completedLessons?.length ?? 0,
        isCompleted: prog?.isCompleted ?? false,
      };
    });

    res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        mobile: student.mobile,
        role: student.role,
        avatar: student.avatar,
      },
      summary: {
        enrolledCoursesCount: student.enrolledCourses.length,
        totalAssignmentsCount: assignments.length,
        submittedAssignmentsCount: submissions.length,
        pendingAssignmentsCount: pendingAssignments.length,
        gradedAssignmentsCount: gradedCount,
      },
      enrolledCourses: enrichedCourses,
      upcomingAssignments: pendingAssignments.slice(0, 5).map((a) => ({
        _id: a._id,
        title: a.title,
        courseName: a.courseId?.title || "—",
        dueDate: a.dueDate,
        totalMarks: a.totalMarks,
      })),
      recentSubmissions: submissions.slice(0, 5).map((s) => ({
        _id: s._id,
        title: s.assignmentId?.title || "Assignment",
        courseName: "",
        status: s.status,
        grade:
          s.status === "graded" && s.totalScore != null ? s.totalScore : null,
        createdAt: s.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching student dashboard",
      error: err.message,
    });
  }
};

// ─── My Courses (with progress) ──────────────────────────────────────────────
export const getMyCourses = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .select("enrolledCourses")
      .populate({
        path: "enrolledCourses",
        populate: {
          path: "sections",
          populate: { path: "lessons", select: "title duration order" },
        },
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const progressRecords = await Progress.find({
      studentId: req.user._id,
    });

    const progressMap = new Map(
      progressRecords.map((p) => [p.courseId.toString(), p]),
    );

    const courses = student.enrolledCourses.map((course) => {
      const prog = progressMap.get(course._id.toString());
      const totalLessons = course.sections.reduce(
        (sum, s) => sum + (s.lessons?.length || 0),
        0,
      );

      return {
        ...course.toObject(),
        progress: prog?.progressPercent ?? 0,
        completedLessonsCount: prog?.completedLessons?.length ?? 0,
        totalLessons,
        isCompleted: prog?.isCompleted ?? false,
        lastAccessedAt: prog?.lastAccessedAt ?? null,
      };
    });

    res.json(courses);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching courses",
      error: err.message,
    });
  }
};

// ─── My Assignments ───────────────────────────────────────────────────────────
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
      submissions.map((s) => [s.assignmentId.toString(), s]),
    );

    const result = assignments.map((assignment) => {
      const submission = submissionMap.get(assignment._id.toString());
      return {
        ...assignment.toObject(),
        submissionStatus: submission ? submission.status : "not_submitted",
        submissionId: submission?._id || null,
        totalScore: submission?.totalScore ?? null,
        feedback: submission?.feedback ?? "",
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

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .select("-passwordHash")
      .populate("enrolledCourses", "title thumbnail status");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const totalSubmissions = await Submission.countDocuments({
      studentId: req.user._id,
    });

    const certificates = await Certificate.countDocuments({
      studentId: req.user._id,
    });

    res.json({
      ...student.toObject(),
      stats: {
        enrolledCourses: student.enrolledCourses.length,
        totalSubmissions,
        certificates,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching profile",
      error: err.message,
    });
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, mobile, avatar } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (mobile !== undefined) updates.mobile = mobile;
    if (avatar !== undefined) updates.avatar = avatar;

    const student = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-passwordHash");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Profile updated successfully", student });
  } catch (err) {
    res.status(500).json({
      message: "Error updating profile",
      error: err.message,
    });
  }
};

// ─── Certificates ─────────────────────────────────────────────────────────────
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      studentId: req.user._id,
    })
      .populate("courseId", "title thumbnail description")
      .sort({ issuedAt: -1 });

    res.json(certificates);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching certificates",
      error: err.message,
    });
  }
};
