

// import asyncHandler from "../utils/asyncHandler.js";
// import apiResponse from "../utils/apiResponse.js";
// import {
//   createAssignmentService,
//   getAssignmentsService,
//   getAssignmentByIdService,
//   updateAssignmentService,
//   deleteAssignmentService,
//   togglePublishService,
// } from "../services/assignmentService.js";

// // POST /api/assignments
// export const createAssignment = asyncHandler(async (req, res) => {
//   let questions = req.body.questions;
//   if (typeof questions === "string") {
//     try {
//       questions = JSON.parse(questions);
//     } catch {
//       questions = [];
//     }
//   }

//   const assignment = await createAssignmentService({
//     ...req.body,
//     questions: questions || [],
//     createdBy: req.user._id,
//     fileBuffer: req.file?.buffer,
//     fileOriginalName: req.file?.originalname,
//   });

//   return apiResponse(res, 201, "Assignment created", assignment);
// });

// // GET /api/assignments
// export const getAssignments = asyncHandler(async (req, res) => {
//   const result = await getAssignmentsService({
//     user: req.user,
//     courseId: req.query.courseId,
//     page: req.query.page,
//     limit: req.query.limit,
//   });

//   return apiResponse(res, 200, "Assignments fetched", result);
// });

// // GET /api/assignments/:id
// export const getAssignmentById = asyncHandler(async (req, res) => {
//   const assignment = await getAssignmentByIdService(req.params.id, req.user);
//   return apiResponse(res, 200, "Assignment fetched", assignment);
// });

// // PUT /api/assignments/:id
// export const updateAssignment = asyncHandler(async (req, res) => {
//   let questions = req.body.questions;
//   if (typeof questions === "string") {
//     try {
//       questions = JSON.parse(questions);
//     } catch {
//       questions = undefined;
//     }
//   }

//   const assignment = await updateAssignmentService(
//     req.params.id,
//     {
//       ...req.body,
//       questions,
//       fileBuffer: req.file?.buffer,
//       fileOriginalName: req.file?.originalname,
//     },
//     req.user
//   );

//   return apiResponse(res, 200, "Assignment updated", assignment);
// });

// // DELETE /api/assignments/:id
// export const deleteAssignment = asyncHandler(async (req, res) => {
//   await deleteAssignmentService(req.params.id, req.user);
//   return apiResponse(res, 200, "Assignment deleted");
// });

// // PATCH /api/assignments/:id/publish
// export const togglePublish = asyncHandler(async (req, res) => {
//   const assignment = await togglePublishService(req.params.id, req.user);
//   return apiResponse(
//     res,
//     200,
//     `Assignment ${assignment.isPublished ? "published" : "unpublished"}`,
//     assignment
//   );
// });






import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import {
  createAssignmentService,
  getAssignmentsService,
  getAssignmentByIdService,
  updateAssignmentService,
  deleteAssignmentService,
  togglePublishService,
} from "../services/assignmentService.js";

// POST /api/assignments
export const createAssignment = asyncHandler(async (req, res) => {
  let questions = req.body.questions;
  if (typeof questions === "string") {
    try {
      questions = JSON.parse(questions);
    } catch {
      questions = [];
    }
  }

  const {
    assessmentType,
    moduleId,
    instructions,
    passingMarks,
    maxAttempts,
    allowResubmission,
    maxResubmissions,
    requireAdminApproval,
    showCorrectAnswers,
    gradingPrompt,
    answerKey,
    useAnswerKeyForGrading,
    aiGradingEnabled,
    status,
  } = req.body;

  const assignment = await createAssignmentService({
    ...req.body,
    questions: questions || [],
    createdBy: req.user._id,
    fileBuffer: req.file?.buffer,
    fileOriginalName: req.file?.originalname,
    assessmentType,
    moduleId,
    instructions,
    passingMarks,
    maxAttempts,
    allowResubmission,
    maxResubmissions,
    requireAdminApproval,
    showCorrectAnswers,
    gradingPrompt,
    answerKey,
    useAnswerKeyForGrading,
    aiGradingEnabled,
    status,
  });

  return apiResponse(res, 201, "Assignment created", assignment);
});

// GET /api/assignments
export const getAssignments = asyncHandler(async (req, res) => {
  const result = await getAssignmentsService({
    user: req.user,
    courseId: req.query.courseId,
    page: req.query.page,
    limit: req.query.limit,
    assessmentType: req.query.assessmentType,
  });

  return apiResponse(res, 200, "Assignments fetched", result);
});

// GET /api/assignments/:id
export const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await getAssignmentByIdService(req.params.id, req.user);
  return apiResponse(res, 200, "Assignment fetched", assignment);
});

// PUT /api/assignments/:id
export const updateAssignment = asyncHandler(async (req, res) => {
  let questions = req.body.questions;
  if (typeof questions === "string") {
    try {
      questions = JSON.parse(questions);
    } catch {
      questions = undefined;
    }
  }

  const {
    assessmentType,
    moduleId,
    instructions,
    passingMarks,
    maxAttempts,
    allowResubmission,
    maxResubmissions,
    requireAdminApproval,
    showCorrectAnswers,
    gradingPrompt,
    answerKey,
    useAnswerKeyForGrading,
    aiGradingEnabled,
    status,
  } = req.body;

  const assignment = await updateAssignmentService(
    req.params.id,
    {
      ...req.body,
      questions,
      fileBuffer: req.file?.buffer,
      fileOriginalName: req.file?.originalname,
      assessmentType,
      moduleId,
      instructions,
      passingMarks,
      maxAttempts,
      allowResubmission,
      maxResubmissions,
      requireAdminApproval,
      showCorrectAnswers,
      gradingPrompt,
      answerKey,
      useAnswerKeyForGrading,
      aiGradingEnabled,
      status,
    },
    req.user
  );

  return apiResponse(res, 200, "Assignment updated", assignment);
});

// DELETE /api/assignments/:id
export const deleteAssignment = asyncHandler(async (req, res) => {
  await deleteAssignmentService(req.params.id, req.user);
  return apiResponse(res, 200, "Assignment deleted");
});

// PATCH /api/assignments/:id/publish
export const togglePublish = asyncHandler(async (req, res) => {
  const assignment = await togglePublishService(req.params.id, req.user);
  return apiResponse(
    res,
    200,
    `Assignment ${assignment.isPublished ? "published" : "unpublished"}`,
    assignment
  );
});
