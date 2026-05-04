
// import api from "./api";

// // ── Student: Exam Discovery ───────────────────────────────────────────────────

// /**
//  * GET /api/exams/active
//  * Returns active exams (no questions, safe for listing).
//  */
// export const listActiveExams = async () => {
//   const { data } = await api.get("/exams/active");
//   return data;
// };

// // ── Student: Attempt Flow ─────────────────────────────────────────────────────

// /**
//  * POST /api/exams/:examId/start
//  */
// export const startExam = async (examId) => {
//   const { data } = await api.post(`/exams/${examId}/start`);
//   return data;
// };

// /**
//  * PATCH /api/exams/:examId/answer
//  */
// export const saveAnswer = async (
//   examId,
//   { attemptId, questionId, selectedOption }
// ) => {
//   const { data } = await api.patch(`/exams/${examId}/answer`, {
//     attemptId,
//     questionId: String(questionId),
//     selectedOption,
//   });

//   return data;
// };

// /**
//  * POST /api/exams/:examId/submit
//  */
// export const submitExam = async (
//   examId,
//   { attemptId, answers }
// ) => {
//   const { data } = await api.post(`/exams/${examId}/submit`, {
//     attemptId,
//     answers,
//   });

//   return data;
// };

// /**
//  * GET /api/exams/:examId/result/:attemptId
//  */
// export const getAttemptResult = async (examId, attemptId) => {
//   const { data } = await api.get(
//     `/exams/${examId}/result/${attemptId}`
//   );
//   return data;
// };





// src/services/studentExamService.js
// Uses the axios instance from api.js which handles auth token automatically.
// All routes map to /api/exams/... as defined in examRoutes.js (backend).

import api from "./api";

// ── Student: Exam Discovery ───────────────────────────────────────────────────

/**
 * GET /api/exams/active
 * Returns active exams (no questions payload, safe for listing).
 *
 * Response: Array<{
 *   _id, title, description, courseId: { _id, title|name },
 *   timeLimit, totalQuestions, passingScore, maxAttempts,
 *   allowReattempt, reattemptNewQuestions, isActive, createdAt
 * }>
 */
export const listActiveExams = async () => {
  const { data } = await api.get("/exams/active");
  return Array.isArray(data) ? data : [];
};

/**
 * GET /api/exams/:examId
 * Get a single exam's metadata (admin detail — students use /active list).
 */
export const getExam = async (examId) => {
  const { data } = await api.get(`/exams/${examId}`);
  return data;
};

// ── Student: Attempt Flow ─────────────────────────────────────────────────────

/**
 * POST /api/exams/:examId/start
 * Starts a new attempt or resumes an in-progress one.
 *
 * Response: {
 *   message,
 *   attemptId,
 *   questions: [{ _id, questionText, options:[{label,text}], marks, negativeMarks }],
 *   startTime,
 *   endTime,
 *   answers?: [{ questionId, selectedOption }]   // present when resuming
 * }
 */
export const startExam = async (examId) => {
  const { data } = await api.post(`/exams/${examId}/start`);
  return data;
};

/**
 * PATCH /api/exams/:examId/answer
 * Auto-save a single answer during the exam.
 *
 * Body: { attemptId: string, questionId: string, selectedOption: string (label letter A/B/C/D) }
 * Response: { message: "Answer saved" }
 * 410 status means time expired — the attempt was auto-submitted by the backend.
 */
export const saveAnswer = async (examId, { attemptId, questionId, selectedOption }) => {
  const { data } = await api.patch(`/exams/${examId}/answer`, {
    attemptId,
    questionId: String(questionId),
    selectedOption,
  });
  return data;
};

/**
 * POST /api/exams/:examId/submit
 * Finalize and submit an attempt.
 *
 * Body: { attemptId: string, answers: [{ questionId, selectedOption }] }
 * Response: {
 *   message,
 *   result: {
 *     totalQuestions, attempted, correct, incorrect, skipped,
 *     totalMarks, marksObtained, percentage, isPassed, timeTaken
 *   }
 * }
 * NOTE: submit returns only the summary. Full breakdown requires getAttemptResult.
 */
export const submitExam = async (examId, { attemptId, answers }) => {
  const { data } = await api.post(`/exams/${examId}/submit`, {
    attemptId,
    answers,
  });
  return data;
};

/**
 * GET /api/exams/:examId/result/:attemptId
 * Fetch full result with question-by-question breakdown (after submission).
 *
 * Response: {
 *   attempt: { _id, attemptNumber, status, startTime, submittedAt, result, feedback },
 *   questionBreakdown: [{
 *     questionId, questionText,
 *     options: [{ label, text }],
 *     correctAnswer,   // label letter e.g. "A"
 *     explanation,
 *     selectedOption,  // label letter | null
 *     isCorrect,
 *     marksAwarded
 *   }]
 * }
 */
export const getAttemptResult = async (examId, attemptId) => {
  const { data } = await api.get(`/exams/${examId}/result/${attemptId}`);
  return data;
};
