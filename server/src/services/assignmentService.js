/**
 * Assignment Service
 * All business logic for assignments — keeps controllers thin.
 */

import Assignment from "../models/Assignment.js";
import Question from "../models/Question.js";
import Submission from "../models/Submission.js";
import Answer from "../models/Answer.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import {
  uploadPdfToCloudinary,
  deletePdfFromCloudinary,
} from "../utils/cloudinaryPdf.js";

// ─── helpers ─────────────────────────────────────────────────────────────────

const assertEnrolled = (user, courseId) => {
  const enrolled = user.enrolledCourses?.some(
    (id) => id.toString() === courseId.toString()
  );
  if (!enrolled) throw new ApiError(403, "You are not enrolled in this course");
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createAssignmentService = async ({
  title,
  description,
  courseId,
  dueDate,
  questions = [],
  totalMarks,
  isPublished,
  createdBy,
  fileBuffer,
  fileOriginalName,
}) => {
  if (!title || !courseId) {
    throw new ApiError(400, "title and courseId are required");
  }

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  // Insert questions
  let questionDocs = [];
  if (Array.isArray(questions) && questions.length > 0) {
    questionDocs = await Question.insertMany(questions);
  }

  const calculatedTotalMarks =
    totalMarks != null
      ? Number(totalMarks)
      : questionDocs.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  // ✅ Upload to Cloudinary
  let fileData = null;
  if (fileBuffer && fileOriginalName) {
    const result = await uploadPdfToCloudinary(
      fileBuffer,
      fileOriginalName,
      "assignments/files"
    );
    fileData = {
      url: result.url,
      public_id: result.public_id,
      originalName: fileOriginalName,
    };
  }

  const assignment = await Assignment.create({
    title,
    description,
    courseId,
    dueDate,
    totalMarks: calculatedTotalMarks,
    questions: questionDocs.map((q) => q._id),
    createdBy,
    file: fileData,
    isPublished: isPublished === true || isPublished === "true",
  });

  return Assignment.findById(assignment._id)
    .populate("questions")
    .populate("courseId", "title")
    .populate("createdBy", "name email");
};

// ─── LIST ─────────────────────────────────────────────────────────────────────

export const getAssignmentsService = async ({
  user,
  courseId,
  page = 1,
  limit = 50,
}) => {
  let filter = {};

  if (user.role === "student") {
    const student = await User.findById(user._id).select("enrolledCourses");
    if (courseId) {
      assertEnrolled(student, courseId);
      filter.courseId = courseId;
    } else {
      filter.courseId = { $in: student.enrolledCourses };
    }
    filter.isPublished = true;
  } else if (user.role === "tutor") {
    filter.createdBy = user._id;
    if (courseId) filter.courseId = courseId;
  } else {
    if (courseId) filter.courseId = courseId;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [assignments, total] = await Promise.all([
    Assignment.find(filter)
      .populate("questions")
      .populate("courseId", "title")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Assignment.countDocuments(filter),
  ]);

  return {
    assignments,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  };
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────

export const getAssignmentByIdService = async (id, user) => {
  const assignment = await Assignment.findById(id)
    .populate("questions")
    .populate("courseId", "title description")
    .populate("createdBy", "name email");

  if (!assignment) throw new ApiError(404, "Assignment not found");

  if (user.role === "student") {
    if (!assignment.isPublished)
      throw new ApiError(404, "Assignment not found");
    const student = await User.findById(user._id).select("enrolledCourses");
    assertEnrolled(student, assignment.courseId._id);
  } else if (user.role === "tutor") {
    if (assignment.createdBy._id.toString() !== user._id.toString())
      throw new ApiError(403, "Access denied");
  }

  return assignment;
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export const updateAssignmentService = async (
  id,
  {
    title,
    description,
    dueDate,
    questions,
    totalMarks,
    isPublished,
    fileBuffer,
    fileOriginalName,
  },
  user
) => {
  const assignment = await Assignment.findById(id);
  if (!assignment) throw new ApiError(404, "Assignment not found");

  if (
    user.role === "tutor" &&
    assignment.createdBy.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "You can only edit your own assignments");
  }

  if (title !== undefined) assignment.title = title;
  if (description !== undefined) assignment.description = description;
  if (dueDate !== undefined) assignment.dueDate = dueDate;
  if (isPublished !== undefined)
    assignment.isPublished = isPublished === true || isPublished === "true";

  // Replace questions
  if (Array.isArray(questions)) {
    if (assignment.questions.length > 0) {
      await Question.deleteMany({ _id: { $in: assignment.questions } });
    }
    const questionDocs =
      questions.length > 0 ? await Question.insertMany(questions) : [];
    assignment.questions = questionDocs.map((q) => q._id);
    assignment.totalMarks =
      totalMarks != null
        ? Number(totalMarks)
        : questionDocs.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  } else if (totalMarks !== undefined) {
    assignment.totalMarks = Number(totalMarks);
  }

  // Replace file on Cloudinary
  if (fileBuffer && fileOriginalName) {
    if (assignment.file?.public_id) {
      await deletePdfFromCloudinary(assignment.file.public_id);
    }
    const result = await uploadPdfToCloudinary(
      fileBuffer,
      fileOriginalName,
      "assignments/files"
    );
    assignment.file = {
      url: result.url,
      public_id: result.public_id,
      originalName: fileOriginalName,
    };
  }

  await assignment.save();

  return Assignment.findById(assignment._id)
    .populate("questions")
    .populate("courseId", "title")
    .populate("createdBy", "name email");
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

export const deleteAssignmentService = async (id, user) => {
  const assignment = await Assignment.findById(id);
  if (!assignment) throw new ApiError(404, "Assignment not found");

  if (
    user.role === "tutor" &&
    assignment.createdBy.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "You can only delete your own assignments");
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

  if (assignment.file?.public_id) {
    await deletePdfFromCloudinary(assignment.file.public_id);
  }

  await Assignment.findByIdAndDelete(id);
};

// ─── TOGGLE PUBLISH ───────────────────────────────────────────────────────────

export const togglePublishService = async (id, user) => {
  const assignment = await Assignment.findById(id);
  if (!assignment) throw new ApiError(404, "Assignment not found");

  if (
    user.role === "tutor" &&
    assignment.createdBy.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Access denied");
  }

  assignment.isPublished = !assignment.isPublished;
  await assignment.save();
  return assignment;
};
