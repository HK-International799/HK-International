import api from "./api";

// ─── Student: Orientation Sessions ───────────────────────────────────────────

export const getMySessions = async () => {
  const { data } = await api.get("/orientation/my-sessions");
  return data;
};

export const getSessionById = async (id) => {
  const { data } = await api.get(`/orientation/sessions/${id}`);
  return data;
};

export const joinSession = async (sessionId) => {
  const { data } = await api.post(`/orientation/sessions/${sessionId}/join`);
  return data;
};

export const markAttendance = async (sessionId, attendanceCode) => {
  const { data } = await api.post(`/orientation/sessions/${sessionId}/attendance`, {
    code: attendanceCode,
  });
  return data;
};

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export const getSessionQuiz = async (sessionId) => {
  const { data } = await api.get(`/orientation/sessions/${sessionId}/quiz`);
  return data;
};

export const submitQuiz = async (sessionId, answers) => {
  const { data } = await api.post(`/orientation/sessions/${sessionId}/quiz/submit`, {
    answers,
  });
  return data;
};

export const getQuizResult = async (sessionId) => {
  const { data } = await api.get(`/orientation/sessions/${sessionId}/quiz/result`);
  return data;
};

// ─── Certificate ──────────────────────────────────────────────────────────────

export const getOrientationCertificate = async (sessionId) => {
  const { data } = await api.get(`/orientation/sessions/${sessionId}/certificate`);
  return data;
};
