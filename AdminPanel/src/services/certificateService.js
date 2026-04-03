import api from "./api";

const unwrap = (res) => res.data || res;

export const getAllCertificates = async () => { const { data } = await api.get("/certificates"); return unwrap(data); };
export const getCertificateById = async (id) => { const { data } = await api.get(`/certificates/${id}`); return unwrap(data); };
export const issueCertificate = async (payload) => { const { data } = await api.post("/certificates", payload); return unwrap(data); };
export const revokeCertificate = async (id) => { const { data } = await api.patch(`/certificates/${id}/revoke`); return unwrap(data); };
export const deleteCertificate = async (id) => { const { data } = await api.delete(`/certificates/${id}`); return unwrap(data); };
export const downloadCertificatePDF = async (id) => {
  const response = await api.get(`/certificates/${id}/download`, { responseType: "blob" });
  return response.data;
};
export const verifyCertificate = async (certNumber) => { const { data } = await api.get(`/certificates/verify/${certNumber}`); return unwrap(data); };
