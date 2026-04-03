import api from "./api";

export const getAllSessions = async (params) => {
  const { data } = await api.get("/orientation/sessions", { params });
  return data.data || data;
};

export const getSessionById = async (id) => {
  const { data } = await api.get(`/orientation/sessions/${id}`);
  return data.data || data;
};

export const createSession = async (payload) => {
  const { data } = await api.post("/orientation/sessions", payload);
  return data.data || data;
};

export const updateSession = async (id, payload) => {
  const { data } = await api.put(`/orientation/sessions/${id}`, payload);
  return data.data || data;
};

export const deleteSession = async (id) => {
  const { data } = await api.delete(`/orientation/sessions/${id}`);
  return data;
};

export const getSessionAttendance = async (sessionId) => {
  const { data } = await api.get(`/orientation/sessions/${sessionId}/attendance`);
  return data.data || data;
};

export const markAttendance = async (sessionId, payload) => {
  const { data } = await api.post(`/orientation/sessions/${sessionId}/attendance`, payload);
  return data.data || data;
};

export const bulkMarkAttendance = async (sessionId, students) => {
  const { data } = await api.post(`/orientation/sessions/${sessionId}/attendance/bulk`, { students });
  return data.data || data;
};

export const uploadAttendanceCSV = async (sessionId, file) => {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post(`/orientation/sessions/${sessionId}/attendance/csv`, fd, { headers: { "Content-Type": "multipart/form-data" } });
  return data.data || data;
};

export const createOrientationQuiz = async (sessionId, payload) => {
  const { data } = await api.post(`/orientation/sessions/${sessionId}/quiz`, payload);
  return data.data || data;
};

export const getQuizResults = async (sessionId) => {
  const { data } = await api.get(`/orientation/sessions/${sessionId}/quiz/results`);
  return data.data || data;
};
