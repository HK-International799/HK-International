import api from "./api";
export const getAllFeedback = async (params) => { const { data } = await api.get("/feedback", { params }); return data; };
export const getFeedbackStats = async () => { const { data } = await api.get("/feedback/stats"); return data; };
export const updateFeedbackStatus = async (id, status) => { const { data } = await api.patch(`/feedback/${id}/status`, { status }); return data; };
export const deleteFeedback = async (id) => { const { data } = await api.delete(`/feedback/${id}`); return data; };
