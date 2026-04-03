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
import Registration from "../models/Registration.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalStudents, totalTutors, totalCourses,
    totalBatches, totalAssignments, totalExams,
    totalCertificates, totalLiveClasses, totalRegistrations,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "tutor" }),
    Course.countDocuments(),
    Batch.countDocuments(),
    Assignment.countDocuments(),
    Exam.countDocuments(),
    Certificate.countDocuments(),
    LiveClass.countDocuments(),
    Registration.countDocuments(),
  ]);

  const totalEnrollments = await User.aggregate([
    { $match: { role: "student" } },
    { $project: { count: { $size: { $ifNull: ["$enrolledCourses", []] } } } },
    { $group: { _id: null, total: { $sum: "$count" } } },
  ]);

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name email role createdAt")
    .lean();

  res.json({
    success: true,
    data: {
      totalUsers, totalStudents, totalTutors, totalCourses,
      totalBatches, totalAssignments, totalExams,
      totalCertificates, totalLiveClasses, totalRegistrations,
      totalEnrollments: totalEnrollments[0]?.total || 0,
      recentUsers,
    },
  });
});

export const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const [monthlyRegistrations, courseEnrollments, roleDistribution, feedbackAvg] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Course.aggregate([
      { $lookup: { from: "users", localField: "_id", foreignField: "enrolledCourses", as: "enrolled" } },
      { $project: { title: 1, enrollmentCount: { $size: "$enrolled" } } },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 10 },
    ]),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Feedback.aggregate([
      { $match: { rating: { $ne: null } } },
      { $group: { _id: "$type", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
  ]);

  // Fixed N+1: use aggregation for assignment stats
  const assignmentStats = await Assignment.aggregate([
    { $lookup: { from: "submissions", localField: "_id", foreignField: "assignmentId", as: "subs" } },
    {
      $project: {
        title: 1,
        totalSubmissions: { $size: "$subs" },
        graded: {
          $size: { $filter: { input: "$subs", cond: { $eq: ["$$this.status", "graded"] } } },
        },
      },
    },
    { $limit: 10 },
  ]);

  res.json({
    success: true,
    data: { monthlyRegistrations, courseEnrollments, assignmentStats, roleDistribution, feedbackAvg },
  });
});

export const getReportsData = asyncHandler(async (req, res) => {
  const { type } = req.query;
  let data;

  switch (type) {
    case "courses":
      data = await Course.aggregate([
        { $lookup: { from: "users", localField: "_id", foreignField: "enrolledCourses", as: "enrolledUsers" } },
        { $lookup: { from: "users", let: { tutorId: "$assignedTutor" }, pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$tutorId"] } } },
          { $project: { name: 1, email: 1 } },
        ], as: "tutor" } },
        { $project: { title: 1, status: 1, enrollmentCount: { $size: "$enrolledUsers" }, tutor: { $arrayElemAt: ["$tutor", 0] }, createdAt: 1 } },
      ]);
      break;

    case "students":
      data = await User.aggregate([
        { $match: { role: "student" } },
        { $lookup: { from: "submissions", localField: "_id", foreignField: "studentId", as: "submissions" } },
        { $lookup: { from: "certificates", localField: "_id", foreignField: "studentId", as: "certs" } },
        { $lookup: { from: "courses", localField: "enrolledCourses", foreignField: "_id", as: "courses" } },
        {
          $project: {
            name: 1, email: 1, createdAt: 1,
            enrolledCount: { $size: "$courses" },
            submissionCount: { $size: "$submissions" },
            certificateCount: { $size: "$certs" },
          },
        },
      ]);
      break;

    case "assignments":
      data = await Assignment.aggregate([
        { $lookup: { from: "submissions", localField: "_id", foreignField: "assignmentId", as: "subs" } },
        { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
        {
          $project: {
            title: 1,
            course: { $arrayElemAt: ["$course.title", 0] },
            submissionCount: { $size: "$subs" },
            gradedCount: { $size: { $filter: { input: "$subs", cond: { $eq: ["$$this.status", "graded"] } } } },
          },
        },
      ]);
      break;

    case "exams":
      data = await Exam.aggregate([
        { $lookup: { from: "examattempts", localField: "_id", foreignField: "examId", as: "attempts" } },
        { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
        {
          $project: {
            title: 1,
            course: { $arrayElemAt: ["$course.title", 0] },
            totalAttempts: { $size: "$attempts" },
            avgScore: { $avg: "$attempts.totalScore" },
          },
        },
      ]);
      break;

    case "registrations":
      data = await Registration.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);
      break;

    default:
      return res.status(400).json({ success: false, message: "Invalid report type. Use: courses, students, assignments, exams, registrations" });
  }

  res.json({ success: true, data });
});
