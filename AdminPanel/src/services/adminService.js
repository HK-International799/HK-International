import api from "./api";

const unwrap = (res) => res.data || res;

export const getAdminStats = async () => {
  const { data } = await api.get("/admin/stats");
  return unwrap(data);
};
export const getRecentActivity = async () => {
  const { data } = await api.get("/admin/activity");
  return unwrap(data);
};
export const createUser = async (payload) => {
  const { data } = await api.post("/admin/users", payload);
  return data;
};
export const getAllUsers = async (params) => {
  const { data } = await api.get("/admin/users", { params });
  return unwrap(data);
};
export const updateUser = async (id, payload) => {
  const { data } = await api.put(`/admin/users/${id}`, payload);
  return unwrap(data);
};
export const deleteUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return unwrap(data);
};
export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  return unwrap(data);
};
export const enrollStudent = async (payload) => {
  const { data } = await api.post("/admin/enroll", payload);
  return unwrap(data);
};
