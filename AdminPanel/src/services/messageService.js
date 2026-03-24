import api from "./api";
export const getConversations = async () => { const { data } = await api.get("/messages/conversations"); return data; };
export const getMessages = async (userId) => { const { data } = await api.get(`/messages/${userId}`); return data; };
export const sendMessage = async (payload) => { const { data } = await api.post("/messages", payload); return data; };
