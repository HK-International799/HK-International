// import api from "./api";

// export const getAllRegistrations = async (params) => {
//   const { data } = await api.get("/admin/registrations", { params });
//   return data.data || data;
// };

// export const processRegistration = async (id, payload) => {
//   const { data } = await api.patch(`/admin/registrations/${id}`, payload);
//   return data.data || data;
// };

// export const exportRegistrationsCSV = async () => {
//   const { data } = await api.get("/admin/registrations/export/csv", { responseType: "blob" });
//   return data;
// };



import api from "./api";

export const getAllRegistrations = async (params) => {
  const { data } = await api.get("/admin/registrations", { params });
  return data.data || data;
};

export const processRegistration = async (id, payload) => {
  const { data } = await api.patch(`/admin/registrations/${id}`, payload);
  return data.data || data;
};

export const exportRegistrationsCSV = async () => {
  const { data } = await api.get("/admin/registrations/export/csv", { responseType: "blob" });
  return data;
};

// ── Additive: single registration view + payment verification ────────────
export const getRegistrationById = async (id) => {
  const { data } = await api.get(`/admin/registrations/${id}`);
  return data.data || data;
};

export const confirmRegistrationPayment = async (id, payload) => {
  const { data } = await api.patch(`/admin/registrations/${id}/payment`, payload);
  return data.data || data;
};
