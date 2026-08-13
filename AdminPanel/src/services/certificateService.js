import api from "./api";

const unwrap = (res) => res.data || res;

export const getAllCertificates = async () => { const { data } = await api.get("/certificates"); return unwrap(data); };
export const getCertificateById = async (id) => { const { data } = await api.get(`/certificates/${id}`); return unwrap(data); };
export const issueCertificate = async (payload) => { const { data } = await api.post("/certificates", payload); return unwrap(data); };
export const revokeCertificate = async (id, reason) => { const { data } = await api.patch(`/certificates/${id}/revoke`, { reason }); return unwrap(data); };
export const deleteCertificate = async (id) => { const { data } = await api.delete(`/certificates/${id}`); return unwrap(data); };
export const regenerateCertificatePDF = async (id, templateKey) => { const { data } = await api.post(`/certificates/${id}/regenerate`, templateKey ? { templateKey } : {}); return unwrap(data); };
export const downloadCertificatePDF = async (id) => {
  const response = await api.get(`/certificates/${id}/download`, { responseType: "blob" });
  return response.data;
};
export const verifyCertificate = async (certNumber) => { const { data } = await api.get(`/certificates/verify/${certNumber}`); return unwrap(data); };

export const CERTIFICATE_TEMPLATES = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "accredited", label: "Accredited (dual branding)" },
];
