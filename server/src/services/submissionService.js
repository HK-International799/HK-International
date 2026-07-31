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
//   const assignment = await Assignment.findById(assignmentId).populate("questions");
//   if (!assignment) throw new ApiError(404, "Assignment not found");
//   if (!assignment.isPublished)
//     throw new ApiError(403, "This assignment is not yet published");

//   const student = await User.findById(studentId).select("enrolledCourses");
//   assertEnrolled(student, assignment.courseId);

//   const isLate = assignment.dueDate && new Date() > new Date(assignment.dueDate);

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
//       const assignment = await Assignment.findById(assignmentId).select("createdBy");
//       if (!assignment) throw new ApiError(404, "Assignment not found");
//       if (assignment.createdBy.toString() !== user._id.toString())
//         throw new ApiError(403, "Access denied");
//     }
//     filter.assignmentId = assignmentId;
//   } else if (user.role === "tutor") {
//     const tutorAssignments = await Assignment.find({ createdBy: user._id }).select("_id");
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
//       select: "title dueDate totalMarks questions courseId createdBy file",
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
//   {
//     totalScore,
//     feedback,
//     questionGrades = [],
//     reviewAnnotations = [],
//     // FIX: Accept both key names for backward compat
//     annotations: docAnnotations,
//     documentAnnotations,
//   },
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

//   // FIX: Save document annotations when grading.
//   // Resolve which field was provided (frontend may send either name)
//   const incomingDocAnnotations = docAnnotations ?? documentAnnotations;
//   if (Array.isArray(incomingDocAnnotations)) {
//     const VALID_TYPES = ["correct", "wrong", "partial", "note", "star"];
//     submission.annotations = incomingDocAnnotations
//       .filter(
//         (a) =>
//           a &&
//           typeof a.id === "string" &&
//           typeof a.page === "number" &&
//           typeof a.xPct === "number" &&
//           typeof a.yPct === "number" &&
//           VALID_TYPES.includes(a.type)
//       )
//       .map((a) => ({
//         id: a.id,
//         page: a.page,
//         xPct: a.xPct,
//         yPct: a.yPct,
//         type: a.type,
//         note: typeof a.note === "string" ? a.note : "",
//       }));
//   }

//   await submission.save();

//   return Submission.findById(submission._id)
//     .populate("studentId", "name email")
//     .populate("assignmentId", "title totalMarks file")
//     .populate("answers")
//     .populate("gradedBy", "name email");
// };

// // ─── SAVE ANNOTATIONS (standalone) ───────────────────────────────────────────
// /**
//  * Saves document-level annotations independently (from the "Save Annotations"
//  * button in the PDF viewer modal).
//  *
//  * Called by: PATCH /api/submissions/:id/annotations
//  */
// export const saveAnnotationsService = async (id, annotations, user) => {
//   const submission = await Submission.findById(id).populate(
//     "assignmentId",
//     "createdBy"
//   );
//   if (!submission) throw new ApiError(404, "Submission not found");

//   if (user.role === "tutor") {
//     const createdBy = submission.assignmentId?.createdBy?.toString();
//     if (createdBy && createdBy !== user._id.toString()) {
//       throw new ApiError(403, "You are not allowed to annotate this submission");
//     }
//   } else if (user.role === "student") {
//     throw new ApiError(403, "Students cannot save annotations");
//   }

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

//   submission.annotations = clean;
//   await submission.save();

//   return { annotations: submission.annotations, count: clean.length };
// };

// // ─── RESUBMIT (Student) ──────────────────────────────────────────────────────
// /**
//  * Replace an existing submission's file (PDF) before the due date.
//  *
//  * Rules:
//  *  - Submission must already exist for this (assignment, student) pair
//  *  - Due date must not have passed
//  *  - Submission must NOT already be graded
//  *  - Old Cloudinary file is deleted; new file is uploaded
//  *  - All grading state is reset
//  *
//  * Called by: PATCH /api/assignments/:assignmentId/resubmit
//  */
// export const resubmitAssignmentService = async ({
//   assignmentId,
//   studentId,
//   fileBuffer,
//   fileOriginalName,
//   fileMimetype,
// }) => {
//   // 1. File required
//   if (!fileBuffer || !fileOriginalName) {
//     throw new ApiError(400, "A PDF file is required to resubmit.");
//   }

//   // PDF-only validation
//   const isPdfByMime = fileMimetype === "application/pdf";
//   const isPdfByExt = /\.pdf$/i.test(fileOriginalName);
//   if (!isPdfByMime && !isPdfByExt) {
//     throw new ApiError(400, "Only PDF files are allowed for resubmission.");
//   }

//   // 2. Load assignment (need dueDate, courseId for late check)
//   const assignment = await Assignment.findById(assignmentId);
//   if (!assignment) throw new ApiError(404, "Assignment not found");

//   // 3. Find existing submission
//   const submission = await Submission.findOne({ assignmentId, studentId });
//   if (!submission) {
//     throw new ApiError(
//       404,
//       "No existing submission found. Use the submit endpoint to create one first."
//     );
//   }

//   // 4. Due-date validation
//   if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
//     throw new ApiError(
//       403,
//       "Due date has passed. You cannot update your submission."
//     );
//   }

//   // 5. Prevent replacing graded submissions
//   if (submission.status === "graded") {
//     throw new ApiError(403, "Graded submissions cannot be replaced.");
//   }

//   // 6. Delete previous Cloudinary file (best-effort, swallow errors)
//   if (submission.submissionFile?.public_id) {
//     try {
//       await deletePdfFromCloudinary(submission.submissionFile.public_id);
//     } catch (err) {
//       console.error("Cloudinary delete failed during resubmit:", err.message);
//     }
//   }

//   // 7. Upload new file
//   const uploaded = await uploadPdfToCloudinary(
//     fileBuffer,
//     fileOriginalName,
//     "assignments/submissions"
//   );

//   // 8. Update submissionFile
//   submission.submissionFile = {
//     url: uploaded.url,
//     public_id: uploaded.public_id,
//     originalName: fileOriginalName,
//   };

//   // 9. Recalculate isLate
//   submission.isLate = !!(
//     assignment.dueDate && new Date() > new Date(assignment.dueDate)
//   );

//   // 10. Reset grading state completely
//   submission.status = "submitted";
//   submission.totalScore = null;
//   submission.feedback = "";
//   submission.gradedBy = null;
//   submission.gradedAt = null;
//   submission.annotations = [];
//   submission.reviewAnnotations = [];

//   // 11. Save and return populated submission
//   await submission.save();

//   return Submission.findById(submission._id)
//     .populate("assignmentId", "title dueDate totalMarks")
//     .populate("answers");
// };

import Submission from "../models/Submission.js";
import Answer from "../models/Answer.js";
import Assignment from "../models/Assignment.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import {
  uploadPdfToCloudinary,
  deletePdfFromCloudinary,
} from "../utils/cloudinaryPdf.js";
import {
  gradeWrittenAnswers,
  reviewProjectSubmission,
} from "./geminiService.js";

// ─── helpers ─────────────────────────────────────────────────────────────────

const assertEnrolled = (user, courseId) => {
  const enrolled = user.enrolledCourses?.some(
    (id) => id.toString() === courseId.toString(),
  );
  if (!enrolled) throw new ApiError(403, "You are not enrolled in this course");
};

// ─── MODULE 4 — MCQ AUTO GRADING helpers ──────────────────────────────────────

// Question types that can be auto-graded instantly on submit.
const AUTO_GRADABLE_TYPES = [
  "mcq",
  "single_choice",
  "multiple_choice",
  "true_false",
];

const isAutoGradable = (question) =>
  AUTO_GRADABLE_TYPES.includes(question.type) &&
  (question.correctAnswer || (question.correctAnswers || []).length > 0);

/**
 * Auto-grades a single answer against its question definition.
 * Supports single-answer (mcq/single_choice/true_false) via
 * `selectedOption` vs `correctAnswer`, and multi-answer
 * (multiple_choice) via a comma-joined `selectedOption` vs
 * `correctAnswers`. Returns null if the question type isn't
 * auto-gradable (manual/AI grading required instead).
 */
const autoGradeAnswer = (question, rawAnswer) => {
  if (!isAutoGradable(question)) return null;

  const maxMarks = Number(question.marks) || 0;
  const selected = (rawAnswer?.selectedOption || "").trim();

  if (
    question.type === "multiple_choice" &&
    (question.correctAnswers || []).length > 0
  ) {
    const selectedSet = new Set(
      selected
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    const correctSet = new Set(question.correctAnswers.map((s) => s.trim()));
    const isCorrect =
      selectedSet.size === correctSet.size &&
      [...selectedSet].every((s) => correctSet.has(s));
    return {
      isCorrect,
      marksAwarded: isCorrect ? maxMarks : 0,
    };
  }

  const isCorrect =
    selected.length > 0 &&
    selected.toLowerCase() ===
      String(question.correctAnswer || "")
        .trim()
        .toLowerCase();

  return {
    isCorrect,
    marksAwarded: isCorrect ? maxMarks : 0,
  };
};

/**
 * Runs auto-grading across every answer for a submission, given the
 * assignment's full question list. Returns per-answer grading patches
 * (to apply via Answer.updateOne) plus aggregate counts, and whether
 * every question on the assignment was auto-gradable (fully objective).
 */
const runAutoGrading = (questions, answers) => {
  const questionMap = new Map(questions.map((q) => [String(q._id), q]));
  let correctCount = 0;
  let wrongCount = 0;
  let autoScore = 0;
  let allAutoGradable = questions.length > 0;
  const patches = [];

  for (const question of questions) {
    if (!isAutoGradable(question)) {
      allAutoGradable = false;
      continue;
    }
    const ans = answers.find(
      (a) => String(a.questionId) === String(question._id),
    );
    const graded = autoGradeAnswer(question, ans || {});
    if (!graded) continue;

    autoScore += graded.marksAwarded;
    if (graded.isCorrect) correctCount += 1;
    else wrongCount += 1;

    if (ans) {
      patches.push({
        answerId: ans._id,
        marksAwarded: graded.marksAwarded,
        isCorrect: graded.isCorrect,
      });
    }
  }

  return { patches, correctCount, wrongCount, autoScore, allAutoGradable };
};

const computePassFail = (score, passingMarks) => {
  if (score === null || score === undefined) return "pending";
  if (!passingMarks || passingMarks <= 0) return "pending";
  return score >= passingMarks ? "pass" : "fail";
};

// ─── SUBMIT ───────────────────────────────────────────────────────────────────

export const submitAssignmentService = async ({
  assignmentId,
  studentId,
  answers = [],
  fileBuffer,
  fileOriginalName,
}) => {
  const assignment =
    await Assignment.findById(assignmentId).populate("questions");
  if (!assignment) throw new ApiError(404, "Assignment not found");
  if (!assignment.isPublished)
    throw new ApiError(403, "This assignment is not yet published");

  const student = await User.findById(studentId).select("enrolledCourses");
  assertEnrolled(student, assignment.courseId);

  const isLate =
    assignment.dueDate && new Date() > new Date(assignment.dueDate);

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
      "assignments/submissions",
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
    approvalStatus: assignment.requireAdminApproval
      ? "pending"
      : "not_required",
  });

  if (answers.length > 0) {
    const answerDocs = await Answer.insertMany(
      answers.map((ans) => ({
        questionId: ans.questionId,
        submissionId: submission._id,
        textAnswer: ans.textAnswer || "",
        selectedOption: ans.selectedOption || "",
      })),
    );
    submission.answers = answerDocs.map((a) => a._id);

    // ✅ MODULE 4 — MCQ AUTO GRADING: evaluate instantly on submit for
    // any auto-gradable question types found on this assignment.
    const { patches, correctCount, wrongCount, autoScore, allAutoGradable } =
      runAutoGrading(assignment.questions, answerDocs);

    if (patches.length > 0) {
      await Promise.all(
        patches.map((p) =>
          Answer.findByIdAndUpdate(p.answerId, {
            marksAwarded: p.marksAwarded,
            isCorrect: p.isCorrect,
          }),
        ),
      );
      submission.correctCount = correctCount;
      submission.wrongCount = wrongCount;

      // Fully objective assessment (e.g. mcq_exam, all questions
      // auto-gradable): finalize score + pass/fail immediately.
      if (allAutoGradable) {
        submission.totalScore = autoScore;
        submission.passFail = computePassFail(
          autoScore,
          assignment.passingMarks,
        );
        submission.status = assignment.requireAdminApproval
          ? "submitted"
          : "graded";
        if (!assignment.requireAdminApproval) {
          submission.gradedAt = new Date();
        }
      }
    }

    await submission.save();
  }

  return Submission.findById(submission._id)
    .populate(
      "assignmentId",
      "title dueDate totalMarks assessmentType passingMarks",
    )
    .populate("answers");
};

// ─── MY SUBMISSION ────────────────────────────────────────────────────────────

export const getMySubmissionService = async (assignmentId, studentId) => {
  const submission = await Submission.findOne({ assignmentId, studentId })
    .populate({
      path: "assignmentId",
      select:
        "title dueDate totalMarks questions courseId assessmentType passingMarks showCorrectAnswers requireAdminApproval allowResubmission maxResubmissions instructions",
      populate: [
        {
          path: "questions",
          select: "prompt type marks options correctAnswer correctAnswers",
        },
        { path: "courseId", select: "title" },
      ],
    })
    .populate({
      path: "answers",
      populate: {
        path: "questionId",
        select: "prompt type marks options correctAnswer correctAnswers",
      },
    })
    .populate("gradedBy", "name email")
    .populate("approvedBy", "name email");

  if (!submission) throw new ApiError(404, "No submission found");

  // ✅ MODULE 8 — gate correct-answer visibility: only reveal once the
  // assignment allows it AND the submission has actually been graded
  // (or fully approved), so students can't see answers mid-attempt.
  const canShowAnswers =
    submission.assignmentId?.showCorrectAnswers &&
    ["graded", "ai_reviewed", "approved"].includes(submission.status);

  const result = submission.toObject({ virtuals: true });

  if (!canShowAnswers) {
    if (result.assignmentId?.questions) {
      result.assignmentId.questions = result.assignmentId.questions.map(
        (q) => ({
          ...q,
          correctAnswer: undefined,
          correctAnswers: undefined,
        }),
      );
    }
    if (result.answers) {
      result.answers = result.answers.map((a) => ({
        ...a,
        questionId: a.questionId
          ? {
              ...a.questionId,
              correctAnswer: undefined,
              correctAnswers: undefined,
            }
          : a.questionId,
      }));
    }
  }

  return result;
};

// ─── LIST SUBMISSIONS (Tutor / Admin) ─────────────────────────────────────────

export const listSubmissionsService = async ({
  assignmentId,
  user,
  page = 1,
  limit = 20,
  status,
  assessmentType,
  approvalStatus,
}) => {
  const filter = {};

  if (assignmentId) {
    if (user.role === "tutor") {
      const assignment =
        await Assignment.findById(assignmentId).select("createdBy");
      if (!assignment) throw new ApiError(404, "Assignment not found");
      if (assignment.createdBy.toString() !== user._id.toString())
        throw new ApiError(403, "Access denied");
    }
    filter.assignmentId = assignmentId;
  } else if (user.role === "tutor") {
    const tutorAssignments = await Assignment.find({
      createdBy: user._id,
    }).select("_id");
    filter.assignmentId = { $in: tutorAssignments.map((a) => a._id) };
  }

  if (status) filter.status = status;
  if (approvalStatus) filter.approvalStatus = approvalStatus;

  // ✅ MODULE 7 — Assessment Type filter. assessmentType lives on the
  // parent Assignment, so resolve matching assignment ids first, then
  // intersect with any existing assignmentId constraint above.
  if (assessmentType) {
    const typedAssignments = await Assignment.find({ assessmentType }).select(
      "_id",
    );
    const typedIds = typedAssignments.map((a) => String(a._id));

    if (filter.assignmentId && filter.assignmentId.$in) {
      const existingIds = filter.assignmentId.$in.map(String);
      filter.assignmentId = {
        $in: existingIds.filter((id) => typedIds.includes(id)),
      };
    } else if (filter.assignmentId) {
      // single explicit assignmentId — keep only if it matches the type
      filter.assignmentId = typedIds.includes(String(filter.assignmentId))
        ? filter.assignmentId
        : null; // forces an empty result set below
    } else {
      filter.assignmentId = { $in: typedIds };
    }
  }

  // A null assignmentId (explicit mismatch above) should yield zero
  // results rather than an unfiltered query.
  if (filter.assignmentId === null) {
    return {
      submissions: [],
      total: 0,
      page: Number(page),
      limit: Number(limit),
      totalPages: 0,
    };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .populate("studentId", "name email avatar")
      .populate(
        "assignmentId",
        "title totalMarks dueDate courseId assessmentType requireAdminApproval",
      )
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
      select:
        "title dueDate totalMarks questions courseId createdBy file assessmentType passingMarks requireAdminApproval gradingPrompt answerKey useAnswerKeyForGrading aiGradingEnabled showCorrectAnswers allowResubmission maxResubmissions",
      populate: {
        path: "questions",
        select:
          "prompt type marks options correctAnswer correctAnswers rubric aiRules",
      },
    })
    .populate({
      path: "answers",
      populate: {
        path: "questionId",
        select:
          "prompt type marks options correctAnswer correctAnswers rubric aiRules",
      },
    })
    .populate("gradedBy", "name email")
    .populate("approvedBy", "name email");

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
  gradedBy,
) => {
  const submission = await Submission.findById(id).populate(
    "assignmentId",
    "totalMarks passingMarks requireAdminApproval",
  );
  if (!submission) throw new ApiError(404, "Submission not found");

  if (totalScore === undefined || totalScore === null)
    throw new ApiError(400, "totalScore is required");

  const maxMarks = Number(submission.assignmentId?.totalMarks || 0);
  if (maxMarks > 0 && Number(totalScore) > maxMarks)
    throw new ApiError(
      400,
      `Score (${totalScore}) cannot exceed total marks (${maxMarks})`,
    );

  if (questionGrades.length > 0) {
    const updateOps = questionGrades.map(({ answerId, marks, isCorrect }) =>
      Answer.findByIdAndUpdate(answerId, {
        ...(marks !== undefined && { marksAwarded: marks }),
        ...(isCorrect !== undefined && { isCorrect }),
      }),
    );
    await Promise.all(updateOps);
  }

  submission.totalScore = Number(totalScore);
  submission.feedback = feedback || "";
  submission.status = "graded";
  submission.gradedBy = gradedBy;
  submission.gradedAt = new Date();
  submission.passFail = computePassFail(
    Number(totalScore),
    submission.assignmentId?.passingMarks,
  );
  // Grading does not by itself complete the approval workflow — if the
  // assignment requires admin approval, the submission still needs an
  // explicit Approve action (MODULE 6) even though it now has a grade.
  if (
    submission.assignmentId?.requireAdminApproval &&
    submission.approvalStatus !== "approved"
  ) {
    submission.approvalStatus = "pending";
  }

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
          VALID_TYPES.includes(a.type),
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
    "createdBy",
  );
  if (!submission) throw new ApiError(404, "Submission not found");

  if (user.role === "tutor") {
    const createdBy = submission.assignmentId?.createdBy?.toString();
    if (createdBy && createdBy !== user._id.toString()) {
      throw new ApiError(
        403,
        "You are not allowed to annotate this submission",
      );
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
        VALID_TYPES.includes(a.type),
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

// ─── RESUBMIT (Student) ──────────────────────────────────────────────────────
/**
 * Replace an existing submission's file (PDF) before the due date.
 *
 * Rules:
 *  - Submission must already exist for this (assignment, student) pair
 *  - Due date must not have passed
 *  - Submission must NOT already be graded
 *  - Old Cloudinary file is deleted; new file is uploaded
 *  - All grading state is reset
 *
 * Called by: PATCH /api/assignments/:assignmentId/resubmit
 */
export const resubmitAssignmentService = async ({
  assignmentId,
  studentId,
  fileBuffer,
  fileOriginalName,
  fileMimetype,
}) => {
  // ============================================================
  // 1. FILE VALIDATION
  // ============================================================

  if (!fileBuffer || !fileOriginalName) {
    throw new ApiError(400, "A PDF file is required to resubmit.");
  }

  const isPdfByMime = fileMimetype === "application/pdf";
  const isPdfByExt = /\.pdf$/i.test(fileOriginalName);

  if (!isPdfByMime || !isPdfByExt) {
    throw new ApiError(
      400,
      "Only PDF files are allowed for resubmission."
    );
  }

  // ============================================================
  // 2. LOAD ASSIGNMENT
  // ============================================================

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  // ============================================================
  // 3. FIND EXISTING SUBMISSION
  // ============================================================

  const submission = await Submission.findOne({
    assignmentId,
    studentId,
  });

  if (!submission) {
    throw new ApiError(
      404,
      "No existing submission found. Use the submit endpoint to create one first."
    );
  }

  // ============================================================
  // 4. DUE DATE VALIDATION
  // ============================================================

  if (
    assignment.dueDate &&
    new Date() > new Date(assignment.dueDate)
  ) {
    throw new ApiError(
      403,
      "Due date has passed. You cannot update your submission."
    );
  }

  // ============================================================
  // 5. RESUBMISSION GATING
  // ============================================================

  const FINALIZED_STATUSES = [
    "graded",
    "ai_reviewed",
    "approved",
  ];

  if (FINALIZED_STATUSES.includes(submission.status)) {
    throw new ApiError(
      403,
      "Graded submissions cannot be replaced."
    );
  }

  if (
    assignment.allowResubmission === false &&
    submission.resubmissionCount > 0
  ) {
    throw new ApiError(
      403,
      "Resubmission is not allowed for this assignment."
    );
  }

  const maxResubmissions = Number(
    assignment.maxResubmissions ?? 3
  );

  if (
    maxResubmissions > 0 &&
    submission.resubmissionCount >= maxResubmissions
  ) {
    throw new ApiError(
      403,
      `Maximum number of resubmissions (${maxResubmissions}) reached.`
    );
  }

  // ============================================================
  // 6. SAVE OLD FILE REFERENCE
  // ============================================================

  const oldPublicId =
    submission.submissionFile?.public_id || null;

  // ============================================================
  // 7. SNAPSHOT PREVIOUS ATTEMPT
  // ============================================================

  submission.submissionHistory =
    submission.submissionHistory || [];

  submission.submissionHistory.push({
    submittedAt:
      submission.updatedAt ||
      submission.createdAt ||
      new Date(),

    submissionFile: submission.submissionFile,
    totalScore: submission.totalScore,
    feedback: submission.feedback,
    status: submission.status,
  });

  // ============================================================
  // 8. UPLOAD NEW PDF FIRST
  // ============================================================

  console.log("RESUBMIT: Starting Cloudinary upload", {
    assignmentId,
    studentId: String(studentId),
    fileOriginalName,
    fileMimetype,
    bufferExists: !!fileBuffer,
    bufferSize: fileBuffer?.length || 0,
  });

  let uploaded;

  try {
    uploaded = await uploadPdfToCloudinary(
      fileBuffer,
      fileOriginalName,
      "assignments/submissions"
    );

    console.log("RESUBMIT: Cloudinary upload successful", {
      public_id: uploaded?.public_id,
      hasUrl: !!uploaded?.url,
    });
  } catch (error) {
    console.error("RESUBMIT: Cloudinary upload FAILED", {
      message: error?.message,
      name: error?.name,
      http_code: error?.http_code,
      stack: error?.stack,
    });

    throw new ApiError(
      500,
      `Failed to upload resubmitted PDF: ${
        error?.message || "Unknown Cloudinary error"
      }`
    );
  }

  // ============================================================
  // 9. UPDATE SUBMISSION FILE
  // ============================================================

  submission.submissionFile = {
    url: uploaded.url,
    public_id: uploaded.public_id,
    originalName: fileOriginalName,
  };

  // ============================================================
  // 10. RECALCULATE LATE STATUS
  // ============================================================

  submission.isLate = !!(
    assignment.dueDate &&
    new Date() > new Date(assignment.dueDate)
  );

  // ============================================================
  // 11. RESET GRADING STATE
  // ============================================================

  submission.status = "submitted";

  submission.totalScore = null;
  submission.feedback = "";

  submission.gradedBy = null;
  submission.gradedAt = null;

  submission.annotations = [];
  submission.reviewAnnotations = [];

  submission.passFail = "pending";

  submission.approvalStatus =
    assignment.requireAdminApproval
      ? "pending"
      : "not_required";

  submission.resubmissionCount =
    (submission.resubmissionCount || 0) + 1;

  // ============================================================
  // 12. SAVE NEW SUBMISSION
  // ============================================================

  await submission.save();

  console.log("RESUBMIT: MongoDB submission updated", {
    submissionId: String(submission._id),
    resubmissionCount: submission.resubmissionCount,
  });

  // ============================================================
  // 13. DELETE OLD CLOUDINARY FILE AFTER SUCCESS
  // ============================================================

  if (
    oldPublicId &&
    oldPublicId !== uploaded.public_id
  ) {
    try {
      await deletePdfFromCloudinary(oldPublicId);

      console.log(
        "RESUBMIT: Previous Cloudinary file deleted",
        {
          oldPublicId,
        }
      );
    } catch (err) {
      // Don't fail the submission if cleanup fails.
      console.error(
        "RESUBMIT: Previous Cloudinary file cleanup failed:",
        err.message
      );
    }
  }

  // ============================================================
  // 14. RETURN UPDATED SUBMISSION
  // ============================================================

  return Submission.findById(submission._id)
    .populate(
      "assignmentId",
      "title dueDate totalMarks"
    )
    .populate("answers");
};

/* ════════════════════════════════════════════════════════════════
 * MODULE 5 — AI GRADING ENGINE (additive)
 * ════════════════════════════════════════════════════════════════ */

/**
 * aiGradeTextService
 * POST /api/submissions/:id/ai-grade-text
 * AI-grades a written_assessment / general submission's text answers.
 * Reuses geminiService.gradeWrittenAnswers. Writes the result into
 * submission.aiDraft ONLY — never into the real grade fields.
 */
export const aiGradeTextService = async (submissionId, user) => {
  const submission = await Submission.findById(submissionId)
    .populate({
      path: "assignmentId",
      select:
        "questions gradingPrompt answerKey useAnswerKeyForGrading aiGradingEnabled createdBy totalMarks",
      populate: {
        path: "questions",
        select: "prompt type marks rubric correctAnswer",
      },
    })
    .populate("answers");

  if (!submission) throw new ApiError(404, "Submission not found");

  const assignment = submission.assignmentId;
  if (
    user.role === "tutor" &&
    assignment.createdBy?.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Access denied");
  }

  const textQuestions = (assignment.questions || []).filter((q) =>
    ["text", "short_answer", "long_answer"].includes(q.type),
  );
  if (textQuestions.length === 0) {
    throw new ApiError(
      400,
      "This submission has no text answers for AI to grade",
    );
  }

  const answersPayload = (submission.answers || []).map((a) => ({
    questionId: a.questionId,
    textAnswer: a.textAnswer,
  }));

  const aiResult = await gradeWrittenAnswers(textQuestions, answersPayload, {
    gradingPrompt: assignment.gradingPrompt,
    answerKey: assignment.answerKey,
    useAnswerKeyForGrading: assignment.useAnswerKeyForGrading,
  });

  // Map AI question grades to their answer ids for later "accept" application
  const answerByQuestion = new Map(
    (submission.answers || []).map((a) => [
      String(a.questionId?._id || a.questionId),
      a,
    ]),
  );
  const questionGradesWithAnswerIds = aiResult.questionGrades.map((g) => ({
    questionId: g.questionId,
    answerId: answerByQuestion.get(String(g.questionId))?._id || null,
    marksAwarded: g.marksAwarded,
    isCorrect: g.isCorrect,
    feedbackText: g.feedbackText,
  }));

  submission.aiDraft = {
    questionGrades: questionGradesWithAnswerIds,
    feedbackText: "",
    overallFeedback: aiResult.overallFeedback,
    suggestedPass: aiResult.suggestedPass,
    score: aiResult.score,
    generatedAt: new Date(),
    accepted: false,
  };
  submission.status = "ai_reviewed";
  await submission.save();

  // Also store per-answer AI suggestions for inline display in the review UI
  await Promise.all(
    questionGradesWithAnswerIds
      .filter((g) => g.answerId)
      .map((g) =>
        Answer.findByIdAndUpdate(g.answerId, {
          aiSuggestedMarks: g.marksAwarded,
          aiSuggestedFeedback: g.feedbackText,
          aiSuggestedCorrect: g.isCorrect,
        }),
      ),
  );

  return Submission.findById(submission._id)
    .populate("studentId", "name email")
    .populate("assignmentId", "title totalMarks")
    .populate("answers");
};

/**
 * aiReviewProjectService
 * POST /api/submissions/:id/ai-review-project
 * AI-reviews a project_submission's uploaded file. Reuses
 * geminiService.reviewProjectSubmission. Draft-only, same as above.
 */
export const aiReviewProjectService = async (submissionId, user) => {
  const submission = await Submission.findById(submissionId).populate({
    path: "assignmentId",
    select:
      "gradingPrompt answerKey useAnswerKeyForGrading totalMarks createdBy",
  });

  if (!submission) throw new ApiError(404, "Submission not found");

  const assignment = submission.assignmentId;
  if (
    user.role === "tutor" &&
    assignment.createdBy?.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Access denied");
  }

  if (!submission.submissionFile?.url) {
    throw new ApiError(
      400,
      "This submission has no uploaded file for AI to review",
    );
  }

  const aiResult = await reviewProjectSubmission(
    submission.submissionFile.url,
    {
      gradingPrompt: assignment.gradingPrompt,
      answerKey: assignment.answerKey,
      useAnswerKeyForGrading: assignment.useAnswerKeyForGrading,
      totalMarks: assignment.totalMarks,
    },
  );

  submission.aiDraft = {
    questionGrades: [],
    feedbackText: "",
    overallFeedback: aiResult.overallFeedback,
    suggestedPass: aiResult.suggestedPass,
    score: aiResult.score,
    generatedAt: new Date(),
    accepted: false,
  };
  submission.status = "ai_reviewed";
  await submission.save();

  return Submission.findById(submission._id)
    .populate("studentId", "name email")
    .populate("assignmentId", "title totalMarks")
    .populate("answers");
};

/* ════════════════════════════════════════════════════════════════
 * MODULE 6 — ADMIN SUBMISSION REVIEW: AI draft accept + approval flow
 * ════════════════════════════════════════════════════════════════ */

/**
 * acceptAiDraftService
 * PATCH /api/submissions/:id/accept-ai-draft
 * Accepts the current AI draft as the real grade. Supports
 * "Accept Draft" (use AI numbers as-is) and "Accept & Edit"
 * (admin supplies edited totalScore/feedback/questionGrades that
 * override the AI draft before committing).
 */
export const acceptAiDraftService = async (
  id,
  { totalScore, feedback, questionGrades } = {},
  gradedBy,
) => {
  const submission = await Submission.findById(id).populate(
    "assignmentId",
    "totalMarks passingMarks requireAdminApproval",
  );
  if (!submission) throw new ApiError(404, "Submission not found");

  if (!submission.aiDraft || submission.aiDraft.generatedAt == null) {
    throw new ApiError(400, "No AI draft exists for this submission yet");
  }

  // Use edited values if provided ("Accept & Edit"), else fall back to
  // the AI draft's own numbers ("Accept Draft").
  const finalScore =
    totalScore !== undefined && totalScore !== null
      ? Number(totalScore)
      : Number(submission.aiDraft.score ?? 0);

  const finalFeedback =
    feedback !== undefined
      ? feedback
      : submission.aiDraft.overallFeedback || "";

  const finalQuestionGrades =
    Array.isArray(questionGrades) && questionGrades.length > 0
      ? questionGrades
      : submission.aiDraft.questionGrades || [];

  const maxMarks = Number(submission.assignmentId?.totalMarks || 0);
  if (maxMarks > 0 && finalScore > maxMarks) {
    throw new ApiError(
      400,
      `Score (${finalScore}) cannot exceed total marks (${maxMarks})`,
    );
  }

  if (finalQuestionGrades.length > 0) {
    await Promise.all(
      finalQuestionGrades
        .filter((g) => g.answerId)
        .map((g) =>
          Answer.findByIdAndUpdate(g.answerId, {
            ...(g.marksAwarded !== undefined && {
              marksAwarded: g.marksAwarded,
            }),
            ...(g.isCorrect !== undefined && { isCorrect: g.isCorrect }),
          }),
        ),
    );
  }

  submission.totalScore = finalScore;
  submission.feedback = finalFeedback;
  submission.status = "graded";
  submission.gradedBy = gradedBy;
  submission.gradedAt = new Date();
  submission.passFail = computePassFail(
    finalScore,
    submission.assignmentId?.passingMarks,
  );
  submission.aiDraft.accepted = true;
  if (
    submission.assignmentId?.requireAdminApproval &&
    submission.approvalStatus !== "approved"
  ) {
    submission.approvalStatus = "pending";
  }

  await submission.save();

  return Submission.findById(submission._id)
    .populate("studentId", "name email")
    .populate("assignmentId", "title totalMarks file")
    .populate("answers")
    .populate("gradedBy", "name email");
};

/**
 * approveSubmissionService
 * PATCH /api/submissions/:id/approve
 * Marks a graded submission as approved for completion. This is the
 * final step before certificate-eligibility checks elsewhere in the
 * LMS can consider the assessment complete.
 */
export const approveSubmissionService = async (id, approvedBy) => {
  const submission = await Submission.findById(id);
  if (!submission) throw new ApiError(404, "Submission not found");

  if (!["graded", "ai_reviewed"].includes(submission.status)) {
    throw new ApiError(
      400,
      "Only graded submissions can be approved. Grade this submission first.",
    );
  }

  submission.approvalStatus = "approved";
  submission.approvedBy = approvedBy;
  submission.approvedAt = new Date();
  submission.status = "approved";
  await submission.save();

  return Submission.findById(submission._id)
    .populate("studentId", "name email")
    .populate("assignmentId", "title totalMarks")
    .populate("approvedBy", "name email");
};

/**
 * requestResubmissionService
 * PATCH /api/submissions/:id/request-resubmission
 * Admin sends a submission back to the student for another attempt,
 * with feedback explaining what needs fixing. Respects the
 * assignment's allowResubmission / maxResubmissions configuration.
 */
export const requestResubmissionService = async (id, feedback, user) => {
  const submission = await Submission.findById(id).populate(
    "assignmentId",
    "allowResubmission maxResubmissions createdBy",
  );
  if (!submission) throw new ApiError(404, "Submission not found");

  const assignment = submission.assignmentId;
  if (
    user.role === "tutor" &&
    assignment.createdBy?.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Access denied");
  }

  if (assignment.allowResubmission === false) {
    throw new ApiError(403, "Resubmission is disabled for this assignment.");
  }

  const maxResubmissions = Number(assignment.maxResubmissions ?? 3);
  if (
    maxResubmissions > 0 &&
    submission.resubmissionCount >= maxResubmissions
  ) {
    throw new ApiError(
      403,
      `Maximum number of resubmissions (${maxResubmissions}) already reached.`,
    );
  }

  submission.status = "resubmission_required";
  submission.resubmissionFeedback = feedback || "";
  submission.approvalStatus = "not_required";
  await submission.save();

  return Submission.findById(submission._id)
    .populate("studentId", "name email")
    .populate("assignmentId", "title totalMarks");
};
