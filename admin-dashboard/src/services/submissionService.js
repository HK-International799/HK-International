import api from "./api";

export const getAllSubmissions = async (params = {}) => {
  const res = await api.get("/submissions", { params });
  return res.data;
};

export const getSubmissionById = async (id) => {
  const res = await api.get(`/submissions/${id}`);
  return res.data;
};

export const reviewSubmission = async (id, payload) => {
  const res = await api.put(`/submissions/${id}`, payload);
  return res.data;
};

export const deleteSubmission = async (id) => {
  const res = await api.delete(`/submissions/${id}`);
  return res.data;
};