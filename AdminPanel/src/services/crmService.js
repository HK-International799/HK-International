import api from "./api";

const unwrap = (res) => res.data || res;

// ── Dashboard ──────────────────────────────────────────────────────────────
export const getCrmDashboard = async () => {
  const { data } = await api.get("/crm/dashboard");
  return unwrap(data);
};

// ── Leads ──────────────────────────────────────────────────────────────────
export const getLeads = async (params = {}) => {
  const { data } = await api.get("/crm/leads", { params });
  return unwrap(data);
};

export const getLeadById = async (id) => {
  const { data } = await api.get(`/crm/leads/${id}`);
  return unwrap(data);
};

export const createLead = async (payload) => {
  const { data } = await api.post("/crm/leads", payload);
  return unwrap(data);
};

export const updateLead = async (id, payload) => {
  const { data } = await api.put(`/crm/leads/${id}`, payload);
  return unwrap(data);
};

export const deleteLead = async (id) => {
  const { data } = await api.delete(`/crm/leads/${id}`);
  return unwrap(data);
};

export const assignLead = async (id, assignedTo) => {
  const { data } = await api.patch(`/crm/leads/${id}/assign`, { assignedTo });
  return unwrap(data);
};

export const convertLead = async (id, payload = {}) => {
  const { data } = await api.post(`/crm/leads/${id}/convert`, payload);
  return unwrap(data);
};

// export const exportLeadsCsv = (params = {}) => {
//   const query = new URLSearchParams(params).toString();
//   window.open(
//     `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/crm/leads/export/csv?${query}`,
//     "_blank"
//   );
// };

export const exportLeadsCsv = async (params = {}) => {
  const response = await api.get("/crm/leads/export/csv", {
    params,
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "crm-leads.csv";

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
};

// ── Follow-ups ─────────────────────────────────────────────────────────────
export const getFollowUps = async (params = {}) => {
  const { data } = await api.get("/crm/followups", { params });
  return unwrap(data);
};

export const createFollowUp = async (payload) => {
  const { data } = await api.post("/crm/followups", payload);
  return unwrap(data);
};

export const updateFollowUp = async (id, payload) => {
  const { data } = await api.put(`/crm/followups/${id}`, payload);
  return unwrap(data);
};

export const deleteFollowUp = async (id) => {
  const { data } = await api.delete(`/crm/followups/${id}`);
  return unwrap(data);
};

// ── Tasks ──────────────────────────────────────────────────────────────────
export const getTasks = async (params = {}) => {
  const { data } = await api.get("/crm/tasks", { params });
  return unwrap(data);
};

export const createTask = async (payload) => {
  const { data } = await api.post("/crm/tasks", payload);
  return unwrap(data);
};

export const updateTask = async (id, payload) => {
  const { data } = await api.put(`/crm/tasks/${id}`, payload);
  return unwrap(data);
};

export const deleteTask = async (id) => {
  const { data } = await api.delete(`/crm/tasks/${id}`);
  return unwrap(data);
};

// ── Contacts ───────────────────────────────────────────────────────────────
export const getContacts = async (params = {}) => {
  const { data } = await api.get("/crm/contacts", { params });
  return unwrap(data);
};

export const getContactById = async (id) => {
  const { data } = await api.get(`/crm/contacts/${id}`);
  return unwrap(data);
};

export const createContact = async (payload) => {
  const { data } = await api.post("/crm/contacts", payload);
  return unwrap(data);
};

export const updateContact = async (id, payload) => {
  const { data } = await api.put(`/crm/contacts/${id}`, payload);
  return unwrap(data);
};

export const deleteContact = async (id) => {
  const { data } = await api.delete(`/crm/contacts/${id}`);
  return unwrap(data);
};

// ── Organisations ──────────────────────────────────────────────────────────
export const getOrgs = async (params = {}) => {
  const { data } = await api.get("/crm/organisations", { params });
  return unwrap(data);
};

export const getOrgById = async (id) => {
  const { data } = await api.get(`/crm/organisations/${id}`);
  return unwrap(data);
};

export const createOrg = async (payload) => {
  const { data } = await api.post("/crm/organisations", payload);
  return unwrap(data);
};

export const updateOrg = async (id, payload) => {
  const { data } = await api.put(`/crm/organisations/${id}`, payload);
  return unwrap(data);
};

export const deleteOrg = async (id) => {
  const { data } = await api.delete(`/crm/organisations/${id}`);
  return unwrap(data);
};
