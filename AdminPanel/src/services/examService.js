


// services/examService.js
// All API calls use the /exams prefix which maps to examRoutes.js

import api from "./api";

// ── Exam CRUD ─────────────────────────────────────────────────────────────────

/** Create a new exam */
export const createExam = async (payload) => {
  const { data } = await api.post("/exams/create", payload);
  return data;
};

/** List all exams (admin view, no question payload) */
export const listExams = async () => {
  const { data } = await api.get("/exams");
  return data;
};

/** List only active exams (student-facing) */
export const listActiveExams = async () => {
  const { data } = await api.get("/exams/active");
  return data;
};

/** Get a single exam with full question set (admin) */
export const getExam = async (id) => {
  const { data } = await api.get(`/exams/${id}`);
  return data;
};

/** Update exam settings (title, timeLimit, passingScore, etc.) */
export const updateExam = async (id, payload) => {
  const { data } = await api.put(`/exams/${id}`, payload);
  return data;
};

/** Delete an exam */
export const deleteExam = async (id) => {
  const { data } = await api.delete(`/exams/${id}`);
  return data;
};

/** Toggle exam active / inactive */
export const toggleExam = async (id) => {
  const { data } = await api.patch(`/exams/${id}/toggle`);
  return data;
};

/** Regenerate (reshuffle) the question pool for an existing exam */
export const regenerateQuestions = async (id) => {
  const { data } = await api.post(`/exams/${id}/regenerate`);
  return data;
};

/** Get question count available for a course */
export const getCourseQuestionCount = async (courseId) => {
  const { data } = await api.get(`/exams/course/${courseId}/question-count`);
  return data;
};

// ── Courses ───────────────────────────────────────────────────────────────────

/** Fetch course list for dropdowns */
export const listCourses = async () => {
  const { data } = await api.get("/courses");
  return data;
};

// ── Student Attempt Flow ──────────────────────────────────────────────────────

/** Start (or resume) an exam attempt */
export const startExam = async (examId) => {
  const { data } = await api.post(`/exams/${examId}/start`);
  return data;
};

/** Save a single answer during the exam */
export const saveAnswer = async (examId, payload) => {
  const { data } = await api.patch(`/exams/${examId}/answer`, payload);
  return data;
};

/** Submit exam with optional final answers batch */
export const submitExam = async (examId, payload) => {
  const { data } = await api.post(`/exams/${examId}/submit`, payload);
  return data;
};

/** Get result for a completed attempt */
export const getAttemptResult = async (examId, attemptId) => {
  const { data } = await api.get(`/exams/${examId}/result/${attemptId}`);
  return data;
};

// ── Admin Reports & Feedback ──────────────────────────────────────────────────

/** Get all attempt summaries for an exam */
export const getExamReport = async (examId) => {
  const { data } = await api.get(`/exams/${examId}/report`);
  return data;
};

/** Get detailed question breakdown for a specific attempt */
export const getAttemptDetail = async (examId, attemptId) => {
  const { data } = await api.get(`/exams/${examId}/report/${attemptId}`);
  return data;
};

/** Add or update admin feedback on an attempt */
export const addFeedback = async (examId, attemptId, text) => {
  const { data } = await api.post(`/exams/${examId}/feedback/${attemptId}`, { text });
  return data;
};


/** Download full exam report (CSV) */
export const downloadExamReport = async (examId) => {
  const response = await api.get(`/exams/${examId}/report/download`, {
    responseType: "blob", // IMPORTANT for file download
  });

  return response.data;
};