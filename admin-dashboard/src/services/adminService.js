import api from "./api";

export const loginAdmin = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const bulkGrade = async (submissionIds, payload) => {
  const { data } = await api.post("/admin/bulk-grade", { submissionIds, ...payload });
  return data;
};

export const postAnnouncement = async (courseId, text) => {
  const { data } = await api.post(`/admin/courses/${courseId}/announcements`, { text });
  return data;
};
