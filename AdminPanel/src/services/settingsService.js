import api from "./api";
export const getSettings = async (category) => { const { data } = await api.get("/settings", { params: { category } }); return data; };
export const upsertSetting = async (payload) => { const { data } = await api.post("/settings", payload); return data; };
export const bulkUpdateSettings = async (settings) => { const { data } = await api.put("/settings/bulk", { settings }); return data; };
export const deleteSetting = async (id) => { const { data } = await api.delete(`/settings/${id}`); return data; };
