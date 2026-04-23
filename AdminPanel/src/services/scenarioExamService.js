import api from "./api";

const BASE = "/scenario-exams";

/* ─── Exams ─────────────────────────────────────────────── */
export const getAllScenarioExams = async () => {
  const { data } = await api.get(`${BASE}/admin/exams`);
  return data;
};

export const getAdminExamDetails = async (id) => {
  const { data } = await api.get(`${BASE}/admin/exams/${id}`);
  return data;
};

export const createScenarioExam = async (payload) => {
  const { data } = await api.post(`${BASE}/exams`, payload);
  return data;
};

export const updateScenarioExam = async (id, payload) => {
  const { data } = await api.put(`${BASE}/exams/${id}`, payload);
  return data;
};

export const archiveScenarioExam = async (id) => {
  const { data } = await api.delete(`${BASE}/exams/${id}`);
  return data;
};

export const publishScenarioExam = async (id) => {
  const { data } = await api.put(`${BASE}/exams/${id}/publish`);
  return data;
};

/* ─── PDF Upload ─────────────────────────────────────────── */
/**
 * Uploads a PDF file to Cloudinary via the server.
 * @param {string} examId
 * @param {File} file - the PDF File object from <input type="file">
 * @returns {{ pdfUrl, cloudinaryPublicId }}
 */
export const uploadScenarioPdf = async (examId, file) => {
  const formData = new FormData();
  formData.append("scenarioPdf", file);

  const { data } = await api.post(
    `${BASE}/exams/${examId}/upload-pdf`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data; // { success, data: { pdfUrl, cloudinaryPublicId } }
};

/* ─── Scenarios (question blocks) ───────────────────────── */
/**
 * payload: {
 *   scenarioPdfUrl,
 *   cloudinaryPublicId,
 *   subQuestions: [{ questionText, maxMarks }],
 *   maxMarks,
 *   questionNumber (optional)
 * }
 */
export const addScenario = async (examId, payload) => {
  const { data } = await api.post(`${BASE}/exams/${examId}/scenarios`, payload);
  return data;
};

export const updateScenario = async (qId, payload) => {
  const { data } = await api.put(`${BASE}/scenarios/${qId}`, payload);
  return data;
};

export const deleteScenario = async (qId) => {
  const { data } = await api.delete(`${BASE}/scenarios/${qId}`);
  return data;
};

/* ─── Submissions / Attempts ───────────────────────────── */
export const getExamSubmissions = async (id) => {
  const { data } = await api.get(`${BASE}/exams/${id}/submissions`);
  return data;
};

export const getAttemptDetails = async (aId) => {
  const { data } = await api.get(`${BASE}/attempts/${aId}`);
  return data;
};

export const reviewAttempt = async (aId, payload) => {
  const { data } = await api.post(`${BASE}/attempts/${aId}/review`, payload);
  return data;
};

export const allowReattempt = async (aId) => {
  const { data } = await api.post(`${BASE}/attempts/${aId}/allow-reattempt`);
  return data;
};
