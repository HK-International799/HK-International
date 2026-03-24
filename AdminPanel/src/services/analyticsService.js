import api from "./api";
export const getDashboardStats = async () => { const { data } = await api.get("/analytics/dashboard"); return data; };
export const getAnalyticsOverview = async () => { const { data } = await api.get("/analytics/overview"); return data; };
export const getReportsData = async (type) => { const { data } = await api.get("/analytics/reports", { params: { type } }); return data; };
