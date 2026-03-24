import User from "../models/User.js";
import Course from "../models/Course.js";
import Batch from "../models/Batch.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Exam from "../models/Exam.js";
import ExamAttempt from "../models/ExamAttempt.js";
import Certificate from "../models/Certificate.js";
import Feedback from "../models/Feedback.js";
import LiveClass from "../models/LiveClass.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalTutors, totalCourses, totalBatches, totalAssignments, totalExams, totalCertificates, totalLiveClasses] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "tutor" }),
      Course.countDocuments(),
      Batch.countDocuments(),
      Assignment.countDocuments(),
      Exam.countDocuments(),
      Certificate.countDocuments(),
      LiveClass.countDocuments(),
    ]);

    const totalEnrollments = await User.aggregate([
      { $match: { role: "student" } },
      { $project: { count: { $size: { $ifNull: ["$enrolledCourses", []] } } } },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt");

    res.json({
      totalUsers,
      totalStudents,
      totalTutors,
      totalCourses,
      totalBatches,
      totalAssignments,
      totalExams,
      totalCertificates,
      totalLiveClasses,
      totalEnrollments: totalEnrollments[0]?.total || 0,
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard stats", error: err.message });
  }
};

export const getAnalyticsOverview = async (req, res) => {
  try {
    // Monthly user registrations (last 12 months)
    const monthlyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Course enrollment distribution
    const courseEnrollments = await Course.aggregate([
      { $lookup: { from: "users", localField: "_id", foreignField: "enrolledCourses", as: "enrolled" } },
      { $project: { title: 1, enrollmentCount: { $size: "$enrolled" } } },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 10 },
    ]);

    // Assignment completion rates
    const assignmentStats = await Assignment.aggregate([
      { $lookup: { from: "submissions", localField: "_id", foreignField: "assignmentId", as: "subs" } },
      { $project: { title: 1, totalSubmissions: { $size: "$subs" }, graded: { $size: { $filter: { input: "$subs", cond: { $eq: ["$$this.status", "graded"] } } } } } },
      { $limit: 10 },
    ]);

    // User role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Feedback ratings
    const feedbackAvg = await Feedback.aggregate([
      { $match: { rating: { $ne: null } } },
      { $group: { _id: "$type", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    res.json({
      monthlyRegistrations,
      courseEnrollments,
      assignmentStats,
      roleDistribution,
      feedbackAvg,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching analytics", error: err.message });
  }
};

export const getReportsData = async (req, res) => {
  try {
    const { type } = req.query; // "courses", "students", "assignments", "exams"

    let data;
    switch (type) {
      case "courses":
        data = await Course.find()
          .populate("assignedTutor", "name email")
          .populate("sections")
          .lean();
        // Enrich with enrollment count
        for (const course of data) {
          course.enrollmentCount = await User.countDocuments({ enrolledCourses: course._id });
        }
        break;

      case "students":
        data = await User.find({ role: "student" })
          .select("name email enrolledCourses createdAt")
          .populate("enrolledCourses", "title")
          .lean();
        for (const student of data) {
          student.submissionCount = await Submission.countDocuments({ studentId: student._id });
          student.certificateCount = await Certificate.countDocuments({ studentId: student._id });
        }
        break;

      case "assignments":
        data = await Assignment.find()
          .populate("courseId", "title")
          .populate("createdBy", "name")
          .lean();
        for (const a of data) {
          a.submissionCount = await Submission.countDocuments({ assignmentId: a._id });
          a.gradedCount = await Submission.countDocuments({ assignmentId: a._id, status: "graded" });
        }
        break;

      case "exams":
        data = await Exam.find()
          .populate("courseId", "title")
          .lean();
        for (const e of data) {
          const attempts = await ExamAttempt.find({ examId: e._id });
          e.totalAttempts = attempts.length;
          e.avgScore = attempts.length > 0
            ? attempts.reduce((sum, a) => sum + (a.totalScore || 0), 0) / attempts.length
            : 0;
        }
        break;

      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reports", error: err.message });
  }
};
