import api from "./api";

/**
 * 📊 Dashboard
 */
export const getAdminStats = async () => {
  const { data } = await api.get("/admin/stats");
  return data;
};

export const getRecentActivity = async () => {
  const { data } = await api.get("/admin/activity");
  return data;
};

/**
 * 👥 Users
 */
export const createUser = async (payload) => {
  const { data } = await api.post("/admin/users", payload);
  return data;
};

export const getAllUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await api.put(`/admin/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  return data;
};

/**
 * 🎓 Enrollment
 */
export const enrollStudent = async (payload) => {
  const { data } = await api.post("/admin/enroll", payload);
  return data;
};