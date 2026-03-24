import api from "./api";
export const getAllQuestionBanks = async () => { const { data } = await api.get("/question-banks"); return data; };
export const getQuestionBankById = async (id) => { const { data } = await api.get(`/question-banks/${id}`); return data; };
export const createQuestionBank = async (payload) => { const { data } = await api.post("/question-banks", payload); return data; };
export const updateQuestionBank = async (id, payload) => { const { data } = await api.put(`/question-banks/${id}`, payload); return data; };
export const deleteQuestionBank = async (id) => { const { data } = await api.delete(`/question-banks/${id}`); return data; };
export const addQuestionToBank = async (id, payload) => { const { data } = await api.post(`/question-banks/${id}/questions`, payload); return data; };
export const removeQuestionFromBank = async (id, questionId) => { const { data } = await api.delete(`/question-banks/${id}/questions/${questionId}`); return data; };
