// import api from "./api";

// const BASE = "/scenario-exams";

// /* ─── Browse exams ───────────────────────────────────── */
// export const getPublishedExams = async () => {
//   const { data } = await api.get(`${BASE}/exams`);
//   return data;
// };

// export const getExamById = async (id) => {
//   const { data } = await api.get(`${BASE}/exams/${id}`);
//   return data;
// };

// /* ─── Attempts ───────────────────────────────────────── */
// export const startExam = async (id) => {
//   const { data } = await api.post(`${BASE}/exams/${id}/start`);
//   return data;
// };

// export const getMyAttempt = async (aId) => {
//   const { data } = await api.get(`${BASE}/attempts/${aId}/me`);
//   return data;
// };

// export const autosaveAttempt = async (aId, payload) => {
//   const { data } = await api.put(`${BASE}/attempts/${aId}/autosave`, payload);
//   return data;
// };

// export const submitAttempt = async (aId, payload) => {
//   const { data } = await api.post(`${BASE}/attempts/${aId}/submit`, payload);
//   return data;
// };

// export const getMyAttempts = async () => {
//   const { data } = await api.get(`${BASE}/my-attempts`);
//   return data;
// };

// export const getFeedback = async (aId) => {
//   const { data } = await api.get(`${BASE}/attempts/${aId}/feedback`);
//   return data;
// };




import api from "./api";

const BASE = "/scenario-exams";

/* ─── Browse exams ───────────────────────────────────── */
export const getPublishedExams = async () => {
  const { data } = await api.get(`${BASE}/exams`);
  return data;
};

export const getExamById = async (id) => {
  const { data } = await api.get(`${BASE}/exams/${id}`);
  return data;
};

/* ─── Attempts ───────────────────────────────────────── */
export const startExam = async (id) => {
  const { data } = await api.post(`${BASE}/exams/${id}/start`);
  return data;
};

export const getMyAttempt = async (aId) => {
  const { data } = await api.get(`${BASE}/attempts/${aId}/me`);
  return data;
};

/**
 * Autosave payload format (matches backend):
 * {
 *   answers: [
 *     { questionId, subAnswers: [{ subQuestionId, answerText }] }
 *   ],
 *   timeSpent: number
 * }
 */
export const autosaveAttempt = async (aId, payload) => {
  const { data } = await api.put(`${BASE}/attempts/${aId}/autosave`, payload);
  return data;
};

export const submitAttempt = async (aId, payload) => {
  const { data } = await api.post(`${BASE}/attempts/${aId}/submit`, payload);
  return data;
};

export const getMyAttempts = async () => {
  const { data } = await api.get(`${BASE}/my-attempts`);
  return data;
};

export const getFeedback = async (aId) => {
  const { data } = await api.get(`${BASE}/attempts/${aId}/feedback`);
  return data;
};