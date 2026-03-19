import api from "./api";

export const getAnalytics = async () => {
  const { data } = await api.get("/admin/analytics");
  return data;
};

export const getAssignmentAnalytics = async () => {
  const { data } = await api.get("/admin/analytics/assignments");
  return data;
};

// Get dashboard stats
export const getAdminStats = async () => {
  const { data } = await api.get("/admin/stats");
  return data;
};

