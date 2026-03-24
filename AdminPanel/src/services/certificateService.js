import api from "./api";
export const getAllCertificates = async () => { const { data } = await api.get("/certificates"); return data; };
export const getCertificateById = async (id) => { const { data } = await api.get(`/certificates/${id}`); return data; };
export const issueCertificate = async (payload) => { const { data } = await api.post("/certificates", payload); return data; };
export const revokeCertificate = async (id) => { const { data } = await api.patch(`/certificates/${id}/revoke`); return data; };
export const deleteCertificate = async (id) => { const { data } = await api.delete(`/certificates/${id}`); return data; };
