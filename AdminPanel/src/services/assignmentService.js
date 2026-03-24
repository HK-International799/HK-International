import api from "./api";
export const getAllAssignments = async () => { const { data } = await api.get("/assignments"); return data; };
export const getAssignmentById = async (id) => { const { data } = await api.get(`/assignments/${id}`); return data; };
export const createAssignment = async (payload) => { const { data } = await api.post("/assignments", payload); return data; };
export const updateAssignment = async (id, payload) => { const { data } = await api.put(`/assignments/${id}`, payload); return data; };
export const deleteAssignment = async (id) => { const { data } = await api.delete(`/assignments/${id}`); return data; };
export const getAssignmentsByCourse = async (courseId) => { const { data } = await api.get(`/assignments/course/${courseId}`); return data; };
