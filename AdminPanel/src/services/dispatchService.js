import api from "./api";

const unwrap = (res) => res.data || res;

// ── Sender Settings ─────────────────────────────────────────────────────────
export const getSenderSettings = async () => {
  const { data } = await api.get("/dispatch/sender");
  return unwrap(data);
};

export const updateSenderSettings = async (payload) => {
  const { data } = await api.put("/dispatch/sender", payload);
  return unwrap(data);
};

// ── Dashboard ────────────────────────────────────────────────────────────────
export const getDispatchDashboard = async () => {
  const { data } = await api.get("/dispatch/dashboard");
  return unwrap(data);
};

// ── Certificates ─────────────────────────────────────────────────────────────
export const listDispatchCertificates = async (params = {}) => {
  const { data } = await api.get("/dispatch/certificates", { params });
  return unwrap(data);
};

export const getDispatchCertificateById = async (id) => {
  const { data } = await api.get(`/dispatch/certificates/${id}`);
  return unwrap(data);
};

export const updateCertificateStatus = async (payload) => {
  const { data } = await api.patch("/dispatch/certificates/status", payload);
  return unwrap(data);
};

export const getLearnerDispatchHistory = async (learnerId) => {
  const { data } = await api.get(`/dispatch/learners/${learnerId}/history`);
  return unwrap(data);
};

// ── Batches ──────────────────────────────────────────────────────────────────
export const createBatch = async (payload) => {
  const { data } = await api.post("/dispatch/batches", payload);
  return unwrap(data);
};

export const getAllBatches = async (params = {}) => {
  const { data } = await api.get("/dispatch/batches", { params });
  return unwrap(data);
};

export const getBatchById = async (id) => {
  const { data } = await api.get(`/dispatch/batches/${id}`);
  return unwrap(data);
};

export const updateBatch = async (id, payload) => {
  const { data } = await api.put(`/dispatch/batches/${id}`, payload);
  return unwrap(data);
};

export const addCertificatesToBatch = async (id, certificateIds) => {
  const { data } = await api.post(`/dispatch/batches/${id}/certificates`, { certificateIds });
  return unwrap(data);
};

export const removeCertificateFromBatch = async (id, certificateId) => {
  const { data } = await api.delete(`/dispatch/batches/${id}/certificates/${certificateId}`);
  return unwrap(data);
};

export const bookSpeedPost = async (id, payload) => {
  const { data } = await api.post(`/dispatch/batches/${id}/book-speed-post`, payload);
  return unwrap(data);
};

export const deleteBatch = async (id) => {
  const { data } = await api.delete(`/dispatch/batches/${id}`);
  return unwrap(data);
};

// ── Expenses ─────────────────────────────────────────────────────────────────
export const getExpenseCategories = async () => {
  const { data } = await api.get("/dispatch/expenses/categories");
  return unwrap(data);
};

export const getAllExpenses = async (params = {}) => {
  const { data } = await api.get("/dispatch/expenses", { params });
  return unwrap(data);
};

export const getExpenseById = async (id) => {
  const { data } = await api.get(`/dispatch/expenses/${id}`);
  return unwrap(data);
};

const toExpenseForm = (payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val !== undefined && val !== null && key !== "bill") {
      form.append(key, val);
    }
  });
  if (payload.bill) form.append("bill", payload.bill);
  return form;
};

export const createExpense = async (payload) => {
  const { data } = await api.post("/dispatch/expenses", toExpenseForm(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(data);
};

export const updateExpense = async (id, payload) => {
  const { data } = await api.put(`/dispatch/expenses/${id}`, toExpenseForm(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(data);
};

export const deleteExpense = async (id) => {
  const { data } = await api.delete(`/dispatch/expenses/${id}`);
  return unwrap(data);
};

// ── Reports ──────────────────────────────────────────────────────────────────
export const getDispatchReport = async (params = {}) => {
  const { data } = await api.get("/dispatch/reports", { params });
  return unwrap(data);
};

export const exportDispatchReportCSV = async (params = {}) => {
  const response = await api.get("/dispatch/reports/export", {
    params,
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dispatch-${params.type || "daily"}-report-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
