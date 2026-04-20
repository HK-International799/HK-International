import api from "./api";

/* ─── Course Messages ─── */

export const adminGetCourseMessages = async (courseId, { page = 1, limit = 100, from, to } = {}) => {
  const params = { page, limit };
  if (from) params.from = from;
  if (to) params.to = to;
  const { data } = await api.get(`/messages/admin/course/${courseId}`, { params });
  return data;
};

export const adminSendMessage = async ({ courseId, content }) => {
  const { data } = await api.post("/messages/admin/send", { courseId, content });
  return data;
};

export const adminDeleteMessages = async ({ courseId, from, to } = {}) => {
  const payload = { courseId };
  if (from) payload.from = from;
  if (to) payload.to = to;
  const { data } = await api.delete("/messages/admin/delete", { data: payload });
  return data;
};

export const adminDeleteSingleMessage = async (messageId) => {
  const { data } = await api.delete(`/messages/admin/message/${messageId}`);
  return data;
};

export const adminDownloadMessages = async ({ courseId, from, to } = {}) => {
  const params = { courseId };
  if (from) params.from = from;
  if (to) params.to = to;
  const response = await api.get("/messages/admin/download", {
    params,
    responseType: "blob",
  });
  return response;
};

/* ─── Block System ─── */

export const blockUser = async ({ userId, reason }) => {
  const { data } = await api.post("/messages/admin/block", { userId, reason });
  return data;
};

export const unblockUser = async (userId) => {
  const { data } = await api.delete(`/messages/admin/block/${userId}`);
  return data;
};

export const getBlockedUsers = async () => {
  const { data } = await api.get("/messages/admin/blocked");
  return data;
};