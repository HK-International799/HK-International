import api from "./api";
export const getAllLiveClasses = async () => { const { data } = await api.get("/live-classes"); return data; };
export const getLiveClassById = async (id) => { const { data } = await api.get(`/live-classes/${id}`); return data; };
export const createLiveClass = async (payload) => { const { data } = await api.post("/live-classes", payload); return data; };
export const updateLiveClass = async (id, payload) => { const { data } = await api.put(`/live-classes/${id}`, payload); return data; };
export const deleteLiveClass = async (id) => { const { data } = await api.delete(`/live-classes/${id}`); return data; };
