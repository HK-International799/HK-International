import api from "./api";

/* ─── Student / Tutor ─── */

export const sendMessage = async ({ receiverId, courseId, content }) => {
  const { data } = await api.post("/messages", { receiverId, courseId, content });
  return data;
};

export const getMessages = async ({ courseId, userId, page = 1, limit = 50 } = {}) => {
  const params = { page, limit };
  if (courseId) params.courseId = courseId;
  if (userId) params.userId = userId;
  const { data } = await api.get("/messages", { params });
  // Support both response shapes: array or paginated object
  return Array.isArray(data) ? data : data.messages || [];
};

export const markMessageRead = async (id) => {
  const { data } = await api.put(`/messages/${id}/read`);
  return data;
};