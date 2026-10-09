// import api from "./api";

// const unwrap = (res) => res.data || res;

// export const getAdminStats = async () => {
//   const { data } = await api.get("/admin/stats");
//   return unwrap(data);
// };
// export const getRecentActivity = async () => {
//   const { data } = await api.get("/admin/activity");
//   return unwrap(data);
// };
// export const createUser = async (payload) => {
//   const { data } = await api.post("/admin/users", payload);
//   return data;
// };
// export const getAllUsers = async (params) => {
//   const { data } = await api.get("/admin/users", { params });
//   return unwrap(data);
// };
// export const updateUser = async (id, payload) => {
//   const { data } = await api.put(`/admin/users/${id}`, payload);
//   return unwrap(data);
// };
// export const deleteUser = async (id) => {
//   const { data } = await api.delete(`/admin/users/${id}`);
//   return unwrap(data);
// };
// export const updateUserRole = async (id, role) => {
//   const { data } = await api.patch(`/admin/users/${id}/role`, { role });
//   return unwrap(data);
// };
// export const enrollStudent = async (payload) => {
//   const { data } = await api.post("/admin/enroll", payload);
//   return unwrap(data);
// };



import api from "./api";

const unwrap = (res) => res.data || res;

export const getAdminStats = async () => {
  const { data } = await api.get("/admin/stats");
  return unwrap(data);
};
export const getRecentActivity = async () => {
  const { data } = await api.get("/admin/activity");
  return unwrap(data);
};
export const createUser = async (payload) => {
  const { data } = await api.post("/admin/users", payload);
  return data;
};
export const getAllUsers = async (params) => {
  const { data } = await api.get("/admin/users", { params });
  return unwrap(data);
};
export const updateUser = async (id, payload) => {
  const { data } = await api.put(`/admin/users/${id}`, payload);
  return unwrap(data);
};
export const deleteUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return unwrap(data);
};
export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  return unwrap(data);
};
export const enrollStudent = async (payload) => {
  const { data } = await api.post("/admin/enroll", payload);
  return unwrap(data);
};

/* ================= LEARNERS PAGE (additive) ================= */

// Stat cards — accepts the same filter params as getAllUsers.
export const getUserStats = async (params) => {
  const { data } = await api.get("/admin/users/stats", { params });
  return unwrap(data);
};

// Course list (id + title), export column catalog, unavailable columns.
export const getUserFilterMeta = async () => {
  const { data } = await api.get("/admin/users/meta");
  return unwrap(data);
};

// Excel export — resolves to a Blob (.xlsx). Server-side validation errors
// come back as JSON inside a Blob (responseType is "blob"), so they are
// decoded here into a normal Error with the server's message.
export const exportUsersExcel = async (payload) => {
  try {
    const res = await api.post("/admin/users/export", payload, {
      responseType: "blob",
      timeout: 5 * 60 * 1000,
    });
    return {
      blob: res.data,
      rowCount: Number(res.headers?.["x-export-row-count"]) || null,
    };
  } catch (err) {
    let message = "Export failed. Please try again.";
    const blob = err.response?.data;
    if (blob && typeof blob.text === "function") {
      try {
        const parsed = JSON.parse(await blob.text());
        if (parsed?.message) message = parsed.message;
      } catch {
        /* non-JSON error body — keep the generic message */
      }
    } else if (err.message === "Network Error") {
      message = "Network error — please check your connection and try again.";
    }
    const e = new Error(message);
    e.status = err.response?.status;
    throw e;
  }
};
