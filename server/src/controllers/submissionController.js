
// import asyncHandler from "../utils/asyncHandler.js";
// import apiResponse from "../utils/apiResponse.js";
// import {
//   submitAssignmentService,
//   getMySubmissionService,
//   listSubmissionsService,
//   getSubmissionByIdService,
//   gradeSubmissionService,
//   saveAnnotationsService,   // ✅ new
// } from "../services/submissionService.js";

// // POST /api/assignments/:assignmentId/submit
// export const submitAssignment = asyncHandler(async (req, res) => {
//   let answers = req.body.answers;
//   if (typeof answers === "string") {
//     try {
//       answers = JSON.parse(answers);
//     } catch {
//       answers = [];
//     }
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
//     },
//     req.user._id
//   );

//   return apiResponse(res, 200, "Submission graded", submission);
// });

// // ✅ PATCH /api/submissions/:id/annotations
// // Saves document-level annotations placed by admin/tutor in the PDF viewer.
// // Body: { annotations: [{ id, page, xPct, yPct, type, note }] }
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




import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import {
  submitAssignmentService,
  getMySubmissionService,
  listSubmissionsService,
  getSubmissionByIdService,
  gradeSubmissionService,
  saveAnnotationsService,
} from "../services/submissionService.js";

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
