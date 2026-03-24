import api from "./api";
export const getAllBatches = async () => { const { data } = await api.get("/batches"); return data; };
export const getBatchById = async (id) => { const { data } = await api.get(`/batches/${id}`); return data; };
export const createBatch = async (payload) => { const { data } = await api.post("/batches", payload); return data; };
export const updateBatch = async (id, payload) => { const { data } = await api.put(`/batches/${id}`, payload); return data; };
export const deleteBatch = async (id) => { const { data } = await api.delete(`/batches/${id}`); return data; };
export const addStudentToBatch = async (id, studentId) => { const { data } = await api.post(`/batches/${id}/add-student`, { studentId }); return data; };
export const removeStudentFromBatch = async (id, studentId) => { const { data } = await api.post(`/batches/${id}/remove-student`, { studentId }); return data; };
