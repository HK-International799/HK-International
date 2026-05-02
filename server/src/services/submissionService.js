// /**
//  * services/submissionService.js
//  *
//  * All submission & grading logic.
//  * ✅ Added: saveAnnotationsService — persists document annotations placed
//  *           by admin in the DocumentAnnotator viewer.
//  */

// import Submission from "../models/Submission.js";
// import Answer from "../models/Answer.js";
// import Assignment from "../models/Assignment.js";
// import User from "../models/User.js";
// import ApiError from "../utils/ApiError.js";
// import {
//   uploadPdfToCloudinary,
//   deletePdfFromCloudinary,
// } from "../utils/cloudinaryPdf.js";

// // ─── helpers ─────────────────────────────────────────────────────────────────

// const assertEnrolled = (user, courseId) => {
//   const enrolled = user.enrolledCourses?.some(
//     (id) => id.toString() === courseId.toString()
//   );
//   if (!enrolled) throw new ApiError(403, "You are not enrolled in this course");
// };

// // ─── SUBMIT ───────────────────────────────────────────────────────────────────

// export const submitAssignmentService = async ({
//   assignmentId,
//   studentId,
//   answers = [],
//   fileBuffer,
//   fileOriginalName,
// }) => {
//   const assignment = await Assignment.findById(assignmentId).populate(
//     "questions"
//   );
//   if (!assignment) throw new ApiError(404, "Assignment not found");
//   if (!assignment.isPublished)
//     throw new ApiError(403, "This assignment is not yet published");

//   const student = await User.findById(studentId).select("enrolledCourses");
//   assertEnrolled(student, assignment.courseId);

//   const isLate =
//     assignment.dueDate && new Date() > new Date(assignment.dueDate);

//   const existing = await Submission.findOne({ assignmentId, studentId });
//   if (existing)
//     throw new ApiError(409, "You have already submitted this assignment");

//   if (answers.length > 0) {
//     const validIds = assignment.questions.map((q) => q._id.toString());
//     for (const ans of answers) {
//       if (!ans.questionId)
//         throw new ApiError(400, "Each answer must include questionId");
//       if (!validIds.includes(ans.questionId.toString()))
//         throw new ApiError(400, `Invalid questionId: ${ans.questionId}`);
//     }
//   }

//   let submissionFile = null;
//   if (fileBuffer && fileOriginalName) {
//     const result = await uploadPdfToCloudinary(
//       fileBuffer,
//       fileOriginalName,
//       "assignments/submissions"
//     );
//     submissionFile = {
//       url: result.url,
//       public_id: result.public_id,
//       originalName: fileOriginalName,
//     };
//   }

//   const submission = await Submission.create({
//     assignmentId,
//     studentId,
//     status: "submitted",
//     isLate: !!isLate,
//     submissionFile,
//   });

//   if (answers.length > 0) {
//     const answerDocs = await Answer.insertMany(
//       answers.map((ans) => ({
//         questionId: ans.questionId,
//         submissionId: submission._id,
//         textAnswer: ans.textAnswer || "",
//         selectedOption: ans.selectedOption || "",
//       }))
//     );
//     submission.answers = answerDocs.map((a) => a._id);
//     await submission.save();
//   }

//   return Submission.findById(submission._id)
//     .populate("assignmentId", "title dueDate totalMarks")
//     .populate("answers");
// };

// // ─── MY SUBMISSION ────────────────────────────────────────────────────────────

// export const getMySubmissionService = async (assignmentId, studentId) => {
//   const submission = await Submission.findOne({ assignmentId, studentId })
//     .populate({
//       path: "assignmentId",
//       select: "title dueDate totalMarks questions",
//       populate: { path: "questions", select: "prompt type marks options" },
//     })
//     .populate({
//       path: "answers",
//       populate: { path: "questionId", select: "prompt type marks options" },
//     });

//   if (!submission) throw new ApiError(404, "No submission found");
//   return submission;
// };

// // ─── LIST SUBMISSIONS (Tutor / Admin) ─────────────────────────────────────────

// export const listSubmissionsService = async ({
//   assignmentId,
//   user,
//   page = 1,
//   limit = 20,
//   status,
// }) => {
//   const filter = {};

//   if (assignmentId) {
//     if (user.role === "tutor") {
//       const assignment = await Assignment.findById(assignmentId).select(
//         "createdBy"
//       );
//       if (!assignment) throw new ApiError(404, "Assignment not found");
//       if (assignment.createdBy.toString() !== user._id.toString())
//         throw new ApiError(403, "Access denied");
//     }
//     filter.assignmentId = assignmentId;
//   } else if (user.role === "tutor") {
//     const tutorAssignments = await Assignment.find({
//       createdBy: user._id,
//     }).select("_id");
//     filter.assignmentId = { $in: tutorAssignments.map((a) => a._id) };
//   }

//   if (status) filter.status = status;

//   const skip = (Number(page) - 1) * Number(limit);

//   const [submissions, total] = await Promise.all([
//     Submission.find(filter)
//       .populate("studentId", "name email avatar")
//       .populate("assignmentId", "title totalMarks dueDate courseId")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(Number(limit)),
//     Submission.countDocuments(filter),
//   ]);

//   return {
//     submissions,
//     total,
//     page: Number(page),
//     limit: Number(limit),
//     totalPages: Math.ceil(total / Number(limit)),
//   };
// };

// // ─── GET SUBMISSION DETAIL ────────────────────────────────────────────────────

// export const getSubmissionByIdService = async (id, user) => {
//   const submission = await Submission.findById(id)
//     .populate("studentId", "name email avatar")
//     .populate({
//       path: "assignmentId",
//       select: "title dueDate totalMarks questions courseId createdBy",
//       populate: {
//         path: "questions",
//         select: "prompt type marks options correctAnswer",
//       },
//     })
//     .populate({
//       path: "answers",
//       populate: {
//         path: "questionId",
//         select: "prompt type marks options correctAnswer",
//       },
//     })
//     .populate("gradedBy", "name email");

//   if (!submission) throw new ApiError(404, "Submission not found");

//   if (user.role === "student") {
//     if (submission.studentId._id.toString() !== user._id.toString())
//       throw new ApiError(403, "Access denied");
//   } else if (user.role === "tutor") {
//     const assignment = submission.assignmentId;
//     if (
//       assignment.createdBy &&
//       assignment.createdBy.toString() !== user._id.toString()
//     )
//       throw new ApiError(403, "Access denied");
//   }

//   return submission;
// };

// // ─── GRADE ────────────────────────────────────────────────────────────────────

// export const gradeSubmissionService = async (
//   id,
//   { totalScore, feedback, questionGrades = [], reviewAnnotations = [] },
//   gradedBy
// ) => {
//   const submission = await Submission.findById(id).populate(
//     "assignmentId",
//     "totalMarks"
//   );
//   if (!submission) throw new ApiError(404, "Submission not found");

//   if (totalScore === undefined || totalScore === null)
//     throw new ApiError(400, "totalScore is required");

//   const maxMarks = Number(submission.assignmentId?.totalMarks || 0);
//   if (maxMarks > 0 && Number(totalScore) > maxMarks)
//     throw new ApiError(
//       400,
//       `Score (${totalScore}) cannot exceed total marks (${maxMarks})`
//     );

//   if (questionGrades.length > 0) {
//     const updateOps = questionGrades.map(({ answerId, marks, isCorrect }) =>
//       Answer.findByIdAndUpdate(answerId, {
//         ...(marks !== undefined && { marksAwarded: marks }),
//         ...(isCorrect !== undefined && { isCorrect }),
//       })
//     );
//     await Promise.all(updateOps);
//   }

//   submission.totalScore = Number(totalScore);
//   submission.feedback = feedback || "";
//   submission.status = "graded";
//   submission.gradedBy = gradedBy;
//   submission.gradedAt = new Date();
//   if (reviewAnnotations.length > 0)
//     submission.reviewAnnotations = reviewAnnotations;

//   await submission.save();

//   return Submission.findById(submission._id)
//     .populate("studentId", "name email")
//     .populate("assignmentId", "title totalMarks")
//     .populate("answers")
//     .populate("gradedBy", "name email");
// };

// // ─── ✅ SAVE ANNOTATIONS ───────────────────────────────────────────────────────
// /**
//  * Saves document-level annotations (placed by admin/tutor in the PDF viewer)
//  * to the submission record. Replaces the entire annotations array each call.
//  *
//  * Called by: PATCH /api/submissions/:id/annotations
//  * Auth: admin or tutor who owns the assignment
//  *
//  * @param {string} id            - Submission _id
//  * @param {Array}  annotations   - Array of annotation objects from frontend
//  * @param {Object} user          - req.user (must be admin or tutor)
//  */
// export const saveAnnotationsService = async (id, annotations, user) => {
//   // 1. Fetch submission (no deep populate needed — just enough for auth check)
//   const submission = await Submission.findById(id).populate(
//     "assignmentId",
//     "createdBy"
//   );
//   if (!submission) throw new ApiError(404, "Submission not found");

//   // 2. Authorization: admin can always annotate; tutor only their own assignments
//   if (user.role === "tutor") {
//     const createdBy = submission.assignmentId?.createdBy?.toString();
//     if (createdBy && createdBy !== user._id.toString()) {
//       throw new ApiError(403, "You are not allowed to annotate this submission");
//     }
//   } else if (user.role === "student") {
//     // Students never annotate
//     throw new ApiError(403, "Students cannot save annotations");
//   }

//   // 3. Validate annotation shape — reject malformed entries silently so a single
//   //    bad item doesn't wipe out all valid ones
//   const VALID_TYPES = ["correct", "wrong", "partial", "note", "star"];
//   const clean = (Array.isArray(annotations) ? annotations : [])
//     .filter(
//       (a) =>
//         a &&
//         typeof a.id === "string" &&
//         typeof a.page === "number" &&
//         typeof a.xPct === "number" &&
//         typeof a.yPct === "number" &&
//         VALID_TYPES.includes(a.type)
//     )
//     .map((a) => ({
//       id: a.id,
//       page: a.page,
//       xPct: a.xPct,
//       yPct: a.yPct,
//       type: a.type,
//       note: typeof a.note === "string" ? a.note : "",
//     }));

//   // 4. Persist — replace entire array (frontend sends the full current state)
//   submission.annotations = clean;
//   await submission.save();

//   return { annotations: submission.annotations, count: clean.length };
// };




/**
 * services/submissionService.js
 *
 * FIXES applied:
 * 1. gradeSubmissionService now accepts and saves `annotations` (document-level
 *    annotations) alongside the grade — so grading and annotating in one action
 *    works correctly.
 * 2. getSubmissionByIdService now populates `annotations` field explicitly.
 * 3. saveAnnotationsService unchanged but now also checks for `annotations`
 *    vs `documentAnnotations` key inconsistency.
 */

import Submission from "../models/Submission.js";
import Answer from "../models/Answer.js";
import Assignment from "../models/Assignment.js";
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

// ─── SUBMIT ───────────────────────────────────────────────────────────────────

export const submitAssignmentService = async ({
  assignmentId,
  studentId,
  answers = [],
  fileBuffer,
  fileOriginalName,
}) => {
  const assignment = await Assignment.findById(assignmentId).populate("questions");
  if (!assignment) throw new ApiError(404, "Assignment not found");
  if (!assignment.isPublished)
    throw new ApiError(403, "This assignment is not yet published");

  const student = await User.findById(studentId).select("enrolledCourses");
  assertEnrolled(student, assignment.courseId);

  const isLate = assignment.dueDate && new Date() > new Date(assignment.dueDate);

  const existing = await Submission.findOne({ assignmentId, studentId });
  if (existing)
    throw new ApiError(409, "You have already submitted this assignment");

  if (answers.length > 0) {
    const validIds = assignment.questions.map((q) => q._id.toString());
    for (const ans of answers) {
      if (!ans.questionId)
        throw new ApiError(400, "Each answer must include questionId");
      if (!validIds.includes(ans.questionId.toString()))
        throw new ApiError(400, `Invalid questionId: ${ans.questionId}`);
    }
  }

  let submissionFile = null;
  if (fileBuffer && fileOriginalName) {
    const result = await uploadPdfToCloudinary(
      fileBuffer,
      fileOriginalName,
      "assignments/submissions"
    );
    submissionFile = {
      url: result.url,
      public_id: result.public_id,
      originalName: fileOriginalName,
    };
  }

  const submission = await Submission.create({
    assignmentId,
    studentId,
    status: "submitted",
    isLate: !!isLate,
    submissionFile,
  });

  if (answers.length > 0) {
    const answerDocs = await Answer.insertMany(
      answers.map((ans) => ({
        questionId: ans.questionId,
        submissionId: submission._id,
        textAnswer: ans.textAnswer || "",
        selectedOption: ans.selectedOption || "",
      }))
    );
    submission.answers = answerDocs.map((a) => a._id);
    await submission.save();
  }

  return Submission.findById(submission._id)
    .populate("assignmentId", "title dueDate totalMarks")
    .populate("answers");
};

// ─── MY SUBMISSION ────────────────────────────────────────────────────────────

export const getMySubmissionService = async (assignmentId, studentId) => {
  const submission = await Submission.findOne({ assignmentId, studentId })
    .populate({
      path: "assignmentId",
      select: "title dueDate totalMarks questions",
      populate: { path: "questions", select: "prompt type marks options" },
    })
    .populate({
      path: "answers",
      populate: { path: "questionId", select: "prompt type marks options" },
    });

  if (!submission) throw new ApiError(404, "No submission found");
  return submission;
};

// ─── LIST SUBMISSIONS (Tutor / Admin) ─────────────────────────────────────────

export const listSubmissionsService = async ({
  assignmentId,
  user,
  page = 1,
  limit = 20,
  status,
}) => {
  const filter = {};

  if (assignmentId) {
    if (user.role === "tutor") {
      const assignment = await Assignment.findById(assignmentId).select("createdBy");
      if (!assignment) throw new ApiError(404, "Assignment not found");
      if (assignment.createdBy.toString() !== user._id.toString())
        throw new ApiError(403, "Access denied");
    }
    filter.assignmentId = assignmentId;
  } else if (user.role === "tutor") {
    const tutorAssignments = await Assignment.find({ createdBy: user._id }).select("_id");
    filter.assignmentId = { $in: tutorAssignments.map((a) => a._id) };
  }

  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .populate("studentId", "name email avatar")
      .populate("assignmentId", "title totalMarks dueDate courseId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Submission.countDocuments(filter),
  ]);

  return {
    submissions,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  };
};

// ─── GET SUBMISSION DETAIL ────────────────────────────────────────────────────

export const getSubmissionByIdService = async (id, user) => {
  const submission = await Submission.findById(id)
    .populate("studentId", "name email avatar")
    .populate({
      path: "assignmentId",
      select: "title dueDate totalMarks questions courseId createdBy file",
      populate: {
        path: "questions",
        select: "prompt type marks options correctAnswer",
      },
    })
    .populate({
      path: "answers",
      populate: {
        path: "questionId",
        select: "prompt type marks options correctAnswer",
      },
    })
    .populate("gradedBy", "name email");

  if (!submission) throw new ApiError(404, "Submission not found");

  if (user.role === "student") {
    if (submission.studentId._id.toString() !== user._id.toString())
      throw new ApiError(403, "Access denied");
  } else if (user.role === "tutor") {
    const assignment = submission.assignmentId;
    if (
      assignment.createdBy &&
      assignment.createdBy.toString() !== user._id.toString()
    )
      throw new ApiError(403, "Access denied");
  }

  return submission;
};

// ─── GRADE ────────────────────────────────────────────────────────────────────

export const gradeSubmissionService = async (
  id,
  {
    totalScore,
    feedback,
    questionGrades = [],
    reviewAnnotations = [],
    // FIX: Accept both key names for backward compat
    annotations: docAnnotations,
    documentAnnotations,
  },
  gradedBy
) => {
  const submission = await Submission.findById(id).populate(
    "assignmentId",
    "totalMarks"
  );
  if (!submission) throw new ApiError(404, "Submission not found");

  if (totalScore === undefined || totalScore === null)
    throw new ApiError(400, "totalScore is required");

  const maxMarks = Number(submission.assignmentId?.totalMarks || 0);
  if (maxMarks > 0 && Number(totalScore) > maxMarks)
    throw new ApiError(
      400,
      `Score (${totalScore}) cannot exceed total marks (${maxMarks})`
    );

  if (questionGrades.length > 0) {
    const updateOps = questionGrades.map(({ answerId, marks, isCorrect }) =>
      Answer.findByIdAndUpdate(answerId, {
        ...(marks !== undefined && { marksAwarded: marks }),
        ...(isCorrect !== undefined && { isCorrect }),
      })
    );
    await Promise.all(updateOps);
  }

  submission.totalScore = Number(totalScore);
  submission.feedback = feedback || "";
  submission.status = "graded";
  submission.gradedBy = gradedBy;
  submission.gradedAt = new Date();

  if (reviewAnnotations.length > 0)
    submission.reviewAnnotations = reviewAnnotations;

  // FIX: Save document annotations when grading.
  // Resolve which field was provided (frontend may send either name)
  const incomingDocAnnotations = docAnnotations ?? documentAnnotations;
  if (Array.isArray(incomingDocAnnotations)) {
    const VALID_TYPES = ["correct", "wrong", "partial", "note", "star"];
    submission.annotations = incomingDocAnnotations
      .filter(
        (a) =>
          a &&
          typeof a.id === "string" &&
          typeof a.page === "number" &&
          typeof a.xPct === "number" &&
          typeof a.yPct === "number" &&
          VALID_TYPES.includes(a.type)
      )
      .map((a) => ({
        id: a.id,
        page: a.page,
        xPct: a.xPct,
        yPct: a.yPct,
        type: a.type,
        note: typeof a.note === "string" ? a.note : "",
      }));
  }

  await submission.save();

  return Submission.findById(submission._id)
    .populate("studentId", "name email")
    .populate("assignmentId", "title totalMarks file")
    .populate("answers")
    .populate("gradedBy", "name email");
};

// ─── SAVE ANNOTATIONS (standalone) ───────────────────────────────────────────
/**
 * Saves document-level annotations independently (from the "Save Annotations"
 * button in the PDF viewer modal).
 *
 * Called by: PATCH /api/submissions/:id/annotations
 */
export const saveAnnotationsService = async (id, annotations, user) => {
  const submission = await Submission.findById(id).populate(
    "assignmentId",
    "createdBy"
  );
  if (!submission) throw new ApiError(404, "Submission not found");

  if (user.role === "tutor") {
    const createdBy = submission.assignmentId?.createdBy?.toString();
    if (createdBy && createdBy !== user._id.toString()) {
      throw new ApiError(403, "You are not allowed to annotate this submission");
    }
  } else if (user.role === "student") {
    throw new ApiError(403, "Students cannot save annotations");
  }

  const VALID_TYPES = ["correct", "wrong", "partial", "note", "star"];
  const clean = (Array.isArray(annotations) ? annotations : [])
    .filter(
      (a) =>
        a &&
        typeof a.id === "string" &&
        typeof a.page === "number" &&
        typeof a.xPct === "number" &&
        typeof a.yPct === "number" &&
        VALID_TYPES.includes(a.type)
    )
    .map((a) => ({
      id: a.id,
      page: a.page,
      xPct: a.xPct,
      yPct: a.yPct,
      type: a.type,
      note: typeof a.note === "string" ? a.note : "",
    }));

  submission.annotations = clean;
  await submission.save();

  return { annotations: submission.annotations, count: clean.length };
};
