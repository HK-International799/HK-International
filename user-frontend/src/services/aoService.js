import api from "./api";

// ─── AO Portal (read-only) ────────────────────────────────────────────────────

export const aoLogin = async (credentials) => {
  const { data } = await api.post("/ao/auth/login", credentials);
  return data;
};

export const getAoDashboard = async () => {
  const { data } = await api.get("/ao/dashboard");
  return data;
};

export const getAllLearners = async (params = {}) => {
  const { data } = await api.get("/ao/learners", { params });
  return data;
};

export const getLearnerById = async (id) => {
  const { data } = await api.get(`/ao/learners/${id}`);
  return data;
};

export const getCertificationStatus = async (params = {}) => {
  const { data } = await api.get("/ao/certifications", { params });
  return data;
};

export const getAuditLogs = async (params = {}) => {
  const { data } = await api.get("/ao/audit-logs", { params });
  return data;
};

export const downloadReport = async (type, params = {}) => {
  const response = await api.get(`/ao/reports/${type}`, {
    params,
    responseType: "blob",
  });
  return response.data;
};

export const getPartnerInstitutes = async () => {
  const { data } = await api.get("/ao/institutes");
  return data;
};

export const getCoursesList = async () => {
  const { data } = await api.get("/ao/courses");
  return data;
};
