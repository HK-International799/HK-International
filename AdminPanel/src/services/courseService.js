import api from "./api";

/* ================= COURSES ================= */

export const getCourses = async () => {
  const { data } = await api.get("/courses");
  return data;
};

export const getCourseById = async (id) => {
  const { data } = await api.get(`/courses/${id}`);
  return data;
};

export const createCourse = async (payload) => {
  const { data } = await api.post("/courses", payload);
  return data;
};

export const updateCourse = async (id, payload) => {
  const { data } = await api.put(`/courses/${id}`, payload);
  return data;
};

export const deleteCourse = async (id) => {
  const { data } = await api.delete(`/courses/${id}`);
  return data;
};

/* ================= TUTOR ================= */

export const assignTutor = async (id, tutorId) => {
  const { data } = await api.post(`/courses/${id}/assign-tutor`, { tutorId });
  return data;
};

/* ================= SECTIONS (legacy — kept for backward compatibility) ================= */

export const addSection = async (courseId, payload) => {
  const { data } = await api.post(`/courses/${courseId}/sections`, payload);
  return data;
};

export const updateSection = async (sectionId, payload) => {
  const { data } = await api.put(`/courses/sections/${sectionId}`, payload);
  return data;
};

export const deleteSection = async (sectionId) => {
  const { data } = await api.delete(`/courses/sections/${sectionId}`);
  return data;
};

/* ================= LESSONS (legacy — kept for backward compatibility) ================= */

export const addLesson = async (payload) => {
  const { data } = await api.post(`/lessons`, payload);
  return data;
};

export const uploadMaterial = async (lessonId, formData) => {
  const { data } = await api.post(`/lessons/${lessonId}/material`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const assignQuizToLesson = async (lessonId, quizId) => {
  const { data } = await api.post(`/lessons/${lessonId}/assign-quiz`, { quizId });
  return data;
};

/* ================= QUIZ (legacy) ================= */

export const createQuiz = async (payload) => {
  const { data } = await api.post("/quiz", payload);
  return data;
};

export const addQuestion = async (quizId, payload) => {
  const { data } = await api.post(`/quiz/${quizId}/questions`, payload);
  return data;
};

export const publishQuiz = async (quizId) => {
  const { data } = await api.put(`/quiz/${quizId}/publish`);
  return data;
};

/* ================= CHAPTERS (NEW) ================= */

/**
 * Get all chapters for a course (sorted by order)
 */
export const getChaptersByCourse = async (courseId) => {
  const { data } = await api.get(`/chapters/course/${courseId}`);
  return data; // { chapters, completedChapters }
};

/**
 * Create a new chapter
 */
export const createChapter = async (payload) => {
  // payload: { courseId, title, description, order }
  const { data } = await api.post("/chapters", payload);
  return data;
};

/**
 * Update chapter info (title, description, order)
 */
export const updateChapterById = async (chapterId, payload) => {
  const { data } = await api.put(`/chapters/${chapterId}`, payload);
  return data;
};

/**
 * Delete a chapter (and its quiz)
 */
export const deleteChapterById = async (chapterId) => {
  const { data } = await api.delete(`/chapters/${chapterId}`);
  return data;
};

/**
 * Upload a document to a chapter
 * formData must contain a 'document' field with the file
 */
export const uploadChapterDocument = async (chapterId, formData) => {
  const { data } = await api.post(
    `/chapters/${chapterId}/upload-document`,
    formData
  );

  return data;
};

/**
 * Create a quiz for a chapter
 * payload: { title?, questions?: [...] }
 */
export const createChapterQuiz = async (chapterId, payload = {}) => {
  const { data } = await api.post(`/chapters/${chapterId}/create-quiz`, payload);
  return data;
};

/**
 * Add a question to a chapter's quiz
 * payload: { prompt, options: [], correctAnswer, marks }
 */
export const addChapterQuizQuestion = async (chapterId, payload) => {
  const { data } = await api.post(
    `/chapters/${chapterId}/quiz/add-question`,
    payload
  );
  return data;
};

/**
 * Get the quiz (with questions) for a chapter
 */
export const getChapterQuiz = async (chapterId) => {
  const { data } = await api.get(`/chapters/${chapterId}/quiz`);
  return data; // { quiz }
};

/* ================= ENROLL ================= */

export const enrollStudent = async (courseId, studentId) => {
  const { data } = await api.post(`/courses/${courseId}/enroll-student`, {
    studentId,
  });
  return data;
};

/* ================= PUBLISH ================= */

export const publishCourse = async (id) => {
  const { data } = await api.put(`/courses/${id}`, { status: "published" });
  return data;
};

/* ================= ENROLLMENTS & PROGRESS (NEW) ================= */

/**
 * GET /api/courses/:id/enrollments-progress
 * Admin: Fetch all enrolled students with their chapter progress.
 */
export const getCourseEnrollmentsProgress = async (courseId) => {
  const { data } = await api.get(`/courses/${courseId}/enrollments-progress`);
  return data; // { success, message, data: { course, totalChapters, ... } }
};

/**
 * DELETE /api/courses/:id/enrollment/:studentId
 * Admin: Revoke a student's enrollment from a course.
 */
export const revokeStudentEnrollment = async (courseId, studentId) => {
  const { data } = await api.delete(
    `/courses/${courseId}/enrollment/${studentId}`
  );
  return data;
};
