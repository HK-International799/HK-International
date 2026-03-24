import api from "./api";
export const getAllDocuments = async (status) => { const { data } = await api.get("/documents", { params: { status } }); return data; };
export const getDocumentById = async (id) => { const { data } = await api.get(`/documents/${id}`); return data; };
export const uploadDocument = async (payload) => { const { data } = await api.post("/documents", payload); return data; };
export const reviewDocument = async (id, payload) => { const { data } = await api.put(`/documents/${id}/review`, payload); return data; };
export const deleteDocument = async (id) => { const { data } = await api.delete(`/documents/${id}`); return data; };
