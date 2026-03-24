import api from "./api";
export const getAllExams = async () => { const { data } = await api.get("/exams"); return data; };
export const getExamById = async (id) => { const { data } = await api.get(`/exams/${id}`); return data; };
export const createExam = async (payload) => { const { data } = await api.post("/exams", payload); return data; };
export const updateExam = async (id, payload) => { const { data } = await api.put(`/exams/${id}`, payload); return data; };
export const deleteExam = async (id) => { const { data } = await api.delete(`/exams/${id}`); return data; };
export const getExamAttempts = async (id) => { const { data } = await api.get(`/exams/${id}/attempts`); return data; };
