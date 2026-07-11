// import api from "./api";

// const unwrap = (res) => res.data || res;

// // ── Dashboard ──────────────────────────────────────────────────────────────
// export const getFinanceDashboard = async () => {
//   const { data } = await api.get("/finance/dashboard");
//   return unwrap(data);
// };

// // ── Course Fees ────────────────────────────────────────────────────────────
// export const setCourseFee = async (payload) => {
//   const { data } = await api.post("/finance/fees", payload);
//   return unwrap(data);
// };

// export const getAllCourseFees = async () => {
//   const { data } = await api.get("/finance/fees");
//   return unwrap(data);
// };

// export const getCourseFee = async (courseId) => {
//   const { data } = await api.get(`/finance/fees/${courseId}`);
//   return unwrap(data);
// };

// // ── Payment Records ────────────────────────────────────────────────────────
// export const getAllPayments = async (params = {}) => {
//   const { data } = await api.get("/finance/payments", { params });
//   return unwrap(data);
// };

// export const getPaymentById = async (id) => {
//   const { data } = await api.get(`/finance/payments/${id}`);
//   return unwrap(data);
// };

// /**
//  * Record a manual payment.
//  * payload may include a `proof` File object for upload.
//  */
// export const recordPayment = async (payload) => {
//   const form = new FormData();
//   Object.entries(payload).forEach(([key, val]) => {
//     if (val !== undefined && val !== null && key !== "proof") {
//       form.append(key, val);
//     }
//   });
//   if (payload.proof) {
//     form.append("proof", payload.proof);
//   }

//   const { data } = await api.post("/finance/payments", form, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return unwrap(data);
// };

// export const updatePayment = async (id, payload) => {
//   const form = new FormData();
//   Object.entries(payload).forEach(([key, val]) => {
//     if (val !== undefined && val !== null && key !== "proof") {
//       form.append(key, val);
//     }
//   });
//   if (payload.proof) {
//     form.append("proof", payload.proof);
//   }

//   const { data } = await api.put(`/finance/payments/${id}`, form, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return unwrap(data);
// };

// export const deletePayment = async (id) => {
//   const { data } = await api.delete(`/finance/payments/${id}`);
//   return unwrap(data);
// };

// // ── Learner Finance ────────────────────────────────────────────────────────
// export const getLearnerFinanceOverview = async (userId) => {
//   const { data } = await api.get(`/finance/learner/${userId}`);
//   return unwrap(data);
// };

// export const getLearnerPayments = async (userId, params = {}) => {
//   const { data } = await api.get(`/finance/learner/${userId}/payments`, { params });
//   return unwrap(data);
// };

// export const getLearnerCourseSummary = async (userId, courseId) => {
//   const { data } = await api.get(`/finance/learner/${userId}/course/${courseId}/summary`);
//   return unwrap(data);
// };

// // ── Reports ────────────────────────────────────────────────────────────────
// export const getRevenueReport = async (params = {}) => {
//   const { data } = await api.get("/finance/reports/revenue", { params });
//   return unwrap(data);
// };

// export const getPendingReport = async () => {
//   const { data } = await api.get("/finance/reports/pending");
//   return unwrap(data);
// };

// export const exportPaymentsCSV = async (params = {}) => {
//   const response = await api.get("/finance/payments/export", {
//     params,
//     responseType: "blob",
//   });

//   const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
//   const url  = window.URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href     = url;
//   link.download = `finance-payments-${new Date().toISOString().slice(0,10)}.csv`;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   window.URL.revokeObjectURL(url);
// };






import api from "./api";

const unwrap = (res) => res.data || res;

// ── Dashboard ──────────────────────────────────────────────────────────────
export const getFinanceDashboard = async () => {
  const { data } = await api.get("/finance/dashboard");
  return unwrap(data);
};

// ── Course Fees ────────────────────────────────────────────────────────────
export const setCourseFee = async (payload) => {
  const { data } = await api.post("/finance/fees", payload);
  return unwrap(data);
};

export const getAllCourseFees = async () => {
  const { data } = await api.get("/finance/fees");
  return unwrap(data);
};

export const getCourseFee = async (courseId) => {
  const { data } = await api.get(`/finance/fees/${courseId}`);
  return unwrap(data);
};

// ── Payment Records ────────────────────────────────────────────────────────
export const getAllPayments = async (params = {}) => {
  const { data } = await api.get("/finance/payments", { params });
  return unwrap(data);
};

export const getPaymentById = async (id) => {
  const { data } = await api.get(`/finance/payments/${id}`);
  return unwrap(data);
};

// Task 8.6/8.7: unified lookup across manual (LearnerPayment) and online
// (Payment/Razorpay) collections -- used for guest/unregistered payments
// that have no learner profile to link to.
export const getFinanceTransactionById = async (id, source) => {
  const { data } = await api.get(`/finance/transactions/${id}`, { params: { source } });
  return unwrap(data);
};

/**
 * Record a manual payment.
 * payload may include a `proof` File object for upload.
 */
export const recordPayment = async (payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val !== undefined && val !== null && key !== "proof") {
      form.append(key, val);
    }
  });
  if (payload.proof) {
    form.append("proof", payload.proof);
  }

  const { data } = await api.post("/finance/payments", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(data);
};

export const updatePayment = async (id, payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val !== undefined && val !== null && key !== "proof") {
      form.append(key, val);
    }
  });
  if (payload.proof) {
    form.append("proof", payload.proof);
  }

  const { data } = await api.put(`/finance/payments/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(data);
};

export const deletePayment = async (id) => {
  const { data } = await api.delete(`/finance/payments/${id}`);
  return unwrap(data);
};

// ── Learner Finance ────────────────────────────────────────────────────────
export const getLearnerFinanceOverview = async (userId) => {
  const { data } = await api.get(`/finance/learner/${userId}`);
  return unwrap(data);
};

export const getLearnerPayments = async (userId, params = {}) => {
  const { data } = await api.get(`/finance/learner/${userId}/payments`, { params });
  return unwrap(data);
};

export const getLearnerCourseSummary = async (userId, courseId) => {
  const { data } = await api.get(`/finance/learner/${userId}/course/${courseId}/summary`);
  return unwrap(data);
};

// ── Reports ────────────────────────────────────────────────────────────────
export const getRevenueReport = async (params = {}) => {
  const { data } = await api.get("/finance/reports/revenue", { params });
  return unwrap(data);
};

export const getPendingReport = async () => {
  const { data } = await api.get("/finance/reports/pending");
  return unwrap(data);
};

export const exportPaymentsCSV = async (params = {}) => {
  const response = await api.get("/finance/payments/export", {
    params,
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
  const url  = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = `finance-payments-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
