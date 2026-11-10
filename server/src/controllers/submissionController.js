
// import asyncHandler from "../utils/asyncHandler.js";
// import apiResponse from "../utils/apiResponse.js";
// import {
//   submitAssignmentService,
//   getMySubmissionService,
//   listSubmissionsService,
//   getSubmissionByIdService,
//   gradeSubmissionService,
//   saveAnnotationsService,
//   resubmitAssignmentService,
//   aiGradeTextService,
//   aiReviewProjectService,
//   acceptAiDraftService,
//   approveSubmissionService,
//   requestResubmissionService,
// } from "../services/submissionService.js";

// // POST /api/assignments/:assignmentId/submit
// export const submitAssignment = asyncHandler(async (req, res) => {
//   let answers = req.body.answers;
//   if (typeof answers === "string") {
//     try { answers = JSON.parse(answers); }
//     catch { answers = []; }
//   }

//   const submission = await submitAssignmentService({
//     assignmentId: req.params.assignmentId,
//     studentId: req.user._id,
//     answers: answers || [],
//     fileBuffer: req.file?.buffer,
//     fileOriginalName: req.file?.originalname,
//   });

//   return apiResponse(res, 201, "Assignment submitted", submission);
// });

// // GET /api/assignments/:assignmentId/my-submission
// export const getMySubmission = asyncHandler(async (req, res) => {
//   const submission = await getMySubmissionService(
//     req.params.assignmentId,
//     req.user._id
//   );
//   return apiResponse(res, 200, "Submission fetched", submission);
// });

// // GET /api/submissions  (Tutor/Admin — list with pagination)
// export const listSubmissions = asyncHandler(async (req, res) => {
//   const result = await listSubmissionsService({
//     assignmentId: req.query.assignmentId,
//     user: req.user,
//     page: req.query.page,
//     limit: req.query.limit,
//     status: req.query.status,
//     assessmentType: req.query.assessmentType,
//     approvalStatus: req.query.approvalStatus,
//   });
//   return apiResponse(res, 200, "Submissions fetched", result);
// });

// // GET /api/submissions/:id
// export const getSubmissionById = asyncHandler(async (req, res) => {
//   const submission = await getSubmissionByIdService(req.params.id, req.user);
//   return apiResponse(res, 200, "Submission fetched", submission);
// });

// // PUT /api/submissions/:id/grade
// export const gradeSubmission = asyncHandler(async (req, res) => {
//   const submission = await gradeSubmissionService(
//     req.params.id,
//     {
//       totalScore: req.body.totalScore,
//       feedback: req.body.feedback,
//       questionGrades: req.body.questionGrades || [],
//       reviewAnnotations: req.body.reviewAnnotations || [],
//       // FIX: Accept both key names — frontend may send either
//       annotations: req.body.annotations,
//       documentAnnotations: req.body.documentAnnotations,
//     },
//     req.user._id
//   );
//   return apiResponse(res, 200, "Submission graded", submission);
// });

// // PATCH /api/submissions/:id/annotations
// export const saveAnnotations = asyncHandler(async (req, res) => {
//   const result = await saveAnnotationsService(
//     req.params.id,
//     req.body.annotations,
//     req.user
//   );
//   return apiResponse(
//     res,
//     200,
//     `Annotations saved (${result.count} total)`,
//     result
//   );
// });

// // PATCH /api/assignments/:assignmentId/resubmit
// // Student replaces their existing submission file with a new PDF
// // (only allowed before due date and before grading).
// export const resubmitAssignment = asyncHandler(async (req, res) => {
//   if (!req.file) {
//     return apiResponse(
//       res,
//       400,
//       "A PDF file is required to resubmit the assignment."
//     );
//   }

//   const submission = await resubmitAssignmentService({
//     assignmentId: req.params.assignmentId,
//     studentId: req.user._id,
//     fileBuffer: req.file.buffer,
//     fileOriginalName: req.file.originalname,
//     fileMimetype: req.file.mimetype,
//   });

//   return apiResponse(
//     res,
//     200,
//     "Submission updated successfully",
//     submission
//   );
// });

// /* ════════════════════════════════════════════════════════════════
//  * MODULE 5 — AI GRADING ENGINE
//  * ════════════════════════════════════════════════════════════════ */

// // POST /api/submissions/:id/ai-grade-text
// export const aiGradeText = asyncHandler(async (req, res) => {
//   const submission = await aiGradeTextService(req.params.id, req.user);
//   return apiResponse(res, 200, "AI grading draft generated", submission);
// });

// // POST /api/submissions/:id/ai-review-project
// export const aiReviewProject = asyncHandler(async (req, res) => {
//   const submission = await aiReviewProjectService(req.params.id, req.user);
//   return apiResponse(res, 200, "AI project review draft generated", submission);
// });

// /* ════════════════════════════════════════════════════════════════
//  * MODULE 6 — ADMIN SUBMISSION REVIEW (AI accept + approval workflow)
//  * ════════════════════════════════════════════════════════════════ */

// // PATCH /api/submissions/:id/accept-ai-draft
// // Body (optional, for "Accept & Edit"): { totalScore, feedback, questionGrades }
// // Omit body fields entirely for plain "Accept Draft".
// export const acceptAiDraft = asyncHandler(async (req, res) => {
//   const submission = await acceptAiDraftService(
//     req.params.id,
//     {
//       totalScore: req.body.totalScore,
//       feedback: req.body.feedback,
//       questionGrades: req.body.questionGrades,
//     },
//     req.user._id
//   );
//   return apiResponse(res, 200, "AI draft accepted as grade", submission);
// });

// // PATCH /api/submissions/:id/approve
// export const approveSubmission = asyncHandler(async (req, res) => {
//   const submission = await approveSubmissionService(req.params.id, req.user._id);
//   return apiResponse(res, 200, "Submission approved", submission);
// });

// // PATCH /api/submissions/:id/request-resubmission
// // Body: { feedback }
// export const requestResubmission = asyncHandler(async (req, res) => {
//   const submission = await requestResubmissionService(
//     req.params.id,
//     req.body.feedback,
//     req.user
//   );
//   return apiResponse(res, 200, "Resubmission requested", submission);
// });








import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import {
  submitAssignmentService,
  getMySubmissionService,
  listSubmissionsService,
  getSubmissionByIdService,
  gradeSubmissionService,
  saveAnnotationsService,
  resubmitAssignmentService,
  aiGradeTextService,
  aiReviewProjectService,
  acceptAiDraftService,
  approveSubmissionService,
  requestResubmissionService,
} from "../services/submissionService.js";
import {
  listEligibleLearnersService,
  adminCreateSubmissionService,
  adminUpdateSubmissionService,
  adminDeleteSubmissionService,
} from "../services/adminSubmissionService.js";

// POST /api/assignments/:assignmentId/submit
export const submitAssignment = asyncHandler(async (req, res) => {
  let answers = req.body.answers;
  if (typeof answers === "string") {
    try { answers = JSON.parse(answers); }
    catch { answers = []; }
  }

  const submission = await submitAssignmentService({
    assignmentId: req.params.assignmentId,
    studentId: req.user._id,
    answers: answers || [],
    fileBuffer: req.file?.buffer,
    fileOriginalName: req.file?.originalname,
  });

  return apiResponse(res, 201, "Assignment submitted", submission);
});

// GET /api/assignments/:assignmentId/my-submission
export const getMySubmission = asyncHandler(async (req, res) => {
  const submission = await getMySubmissionService(
    req.params.assignmentId,
    req.user._id
  );
  return apiResponse(res, 200, "Submission fetched", submission);
});

// GET /api/submissions  (Tutor/Admin — list with pagination)
export const listSubmissions = asyncHandler(async (req, res) => {
  const result = await listSubmissionsService({
    assignmentId: req.query.assignmentId,
    user: req.user,
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    assessmentType: req.query.assessmentType,
    approvalStatus: req.query.approvalStatus,
  });
  return apiResponse(res, 200, "Submissions fetched", result);
});

// GET /api/submissions/:id
export const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await getSubmissionByIdService(req.params.id, req.user);
  return apiResponse(res, 200, "Submission fetched", submission);
});

// PUT /api/submissions/:id/grade
export const gradeSubmission = asyncHandler(async (req, res) => {
  const submission = await gradeSubmissionService(
    req.params.id,
    {
      totalScore: req.body.totalScore,
      feedback: req.body.feedback,
      questionGrades: req.body.questionGrades || [],
      reviewAnnotations: req.body.reviewAnnotations || [],
      // FIX: Accept both key names — frontend may send either
      annotations: req.body.annotations,
      documentAnnotations: req.body.documentAnnotations,
    },
    req.user._id
  );
  return apiResponse(res, 200, "Submission graded", submission);
});

// PATCH /api/submissions/:id/annotations
export const saveAnnotations = asyncHandler(async (req, res) => {
  const result = await saveAnnotationsService(
    req.params.id,
    req.body.annotations,
    req.user
  );
  return apiResponse(
    res,
    200,
    `Annotations saved (${result.count} total)`,
    result
  );
});

// PATCH /api/assignments/:assignmentId/resubmit
// Student replaces their existing submission file with a new PDF
// (only allowed before due date and before grading).
export const resubmitAssignment = asyncHandler(async (req, res) => {
  if (!req.file) {
    return apiResponse(
      res,
      400,
      "A PDF file is required to resubmit the assignment."
    );
  }

  const submission = await resubmitAssignmentService({
    assignmentId: req.params.assignmentId,
    studentId: req.user._id,
    fileBuffer: req.file.buffer,
    fileOriginalName: req.file.originalname,
    fileMimetype: req.file.mimetype,
  });

  return apiResponse(
    res,
    200,
    "Submission updated successfully",
    submission
  );
});

/* ════════════════════════════════════════════════════════════════
 * MODULE 5 — AI GRADING ENGINE
 * ════════════════════════════════════════════════════════════════ */

// POST /api/submissions/:id/ai-grade-text
export const aiGradeText = asyncHandler(async (req, res) => {
  const submission = await aiGradeTextService(req.params.id, req.user);
  return apiResponse(res, 200, "AI grading draft generated", submission);
});

// POST /api/submissions/:id/ai-review-project
export const aiReviewProject = asyncHandler(async (req, res) => {
  const submission = await aiReviewProjectService(req.params.id, req.user);
  return apiResponse(res, 200, "AI project review draft generated", submission);
});

/* ════════════════════════════════════════════════════════════════
 * MODULE 6 — ADMIN SUBMISSION REVIEW (AI accept + approval workflow)
 * ════════════════════════════════════════════════════════════════ */

// PATCH /api/submissions/:id/accept-ai-draft
// Body (optional, for "Accept & Edit"): { totalScore, feedback, questionGrades }
// Omit body fields entirely for plain "Accept Draft".
export const acceptAiDraft = asyncHandler(async (req, res) => {
  const submission = await acceptAiDraftService(
    req.params.id,
    {
      totalScore: req.body.totalScore,
      feedback: req.body.feedback,
      questionGrades: req.body.questionGrades,
    },
    req.user._id
  );
  return apiResponse(res, 200, "AI draft accepted as grade", submission);
});

// PATCH /api/submissions/:id/approve
export const approveSubmission = asyncHandler(async (req, res) => {
  const submission = await approveSubmissionService(req.params.id, req.user._id);
  return apiResponse(res, 200, "Submission approved", submission);
});

// PATCH /api/submissions/:id/request-resubmission
// Body: { feedback }
export const requestResubmission = asyncHandler(async (req, res) => {
  const submission = await requestResubmissionService(
    req.params.id,
    req.body.feedback,
    req.user
  );
  return apiResponse(res, 200, "Resubmission requested", submission);
});
/* ════════════════════════════════════════════════════════════════
 * ADMIN MANAGEMENT OF LEARNER SUBMISSIONS (additive)
 * Routes are admin / super_admin only (see routes/submissionRoutes.js).
 * ════════════════════════════════════════════════════════════════ */

export const adminListEligibleLearners = asyncHandler(async (req, res) => {
  const result = await listEligibleLearnersService({
    assignmentId: req.query.assignmentId,
    search: req.query.search,
    page: req.query.page,
    limit: req.query.limit,
  });
  return apiResponse(res, 200, "Eligible learners fetched", result);
});

export const adminCreateSubmission = asyncHandler(async (req, res) => {
  // Express 5 leaves req.body undefined when no body was sent.
  const body = req.body || {};
  const submission = await adminCreateSubmissionService(
    {
      assignmentId: body.assignmentId,
      studentId: body.studentId,
      answers: body.answers,
      isLate: body.isLate,
      note: body.note,
      file: req.file,
    },
    req.user,
  );
  return apiResponse(res, 201, "Submission uploaded on behalf of the learner", submission);
});

export const adminUpdateSubmission = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const submission = await adminUpdateSubmissionService(
    req.params.id,
    {
      answers: body.answers,
      isLate: body.isLate,
      note: body.note,
      resetGrading: body.resetGrading,
      file: req.file,
    },
    req.user,
  );
  return apiResponse(
    res,
    200,
    req.file ? "Submission file replaced" : "Submission updated",
    submission,
  );
});

export const adminDeleteSubmission = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const result = await adminDeleteSubmissionService(
    req.params.id,
    { confirm: body.confirm, reason: body.reason },
    req.user,
  );
  return apiResponse(res, 200, "Submission deleted", result);
});
