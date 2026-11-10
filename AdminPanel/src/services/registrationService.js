

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

// // ── Additive: single registration view + payment verification ────────────
// export const getRegistrationById = async (id) => {
//   const { data } = await api.get(`/admin/registrations/${id}`);
//   return data.data || data;
// };

// export const confirmRegistrationPayment = async (id, payload) => {
//   const { data } = await api.patch(`/admin/registrations/${id}/payment`, payload);
//   return data.data || data;
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

// `params` (optional) = the same search/filter params as the list. The
// server exports EVERY registration matching them (never just one page);
// with no params it exports all registrations, as before.
export const exportRegistrationsCSV = async (params = {}) => {
  try {
    const { data } = await api.get("/admin/registrations/export/csv", {
      params,
      responseType: "blob",
    });
    return data;
  } catch (err) {
    // Errors arrive as a JSON Blob because of responseType "blob".
    const blob = err?.response?.data;
    if (blob instanceof Blob) {
      try {
        const parsed = JSON.parse(await blob.text());
        throw new Error(parsed?.message || "Export failed");
      } catch (inner) {
        throw inner instanceof SyntaxError ? new Error("Export failed") : inner;
      }
    }
    throw err;
  }
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
