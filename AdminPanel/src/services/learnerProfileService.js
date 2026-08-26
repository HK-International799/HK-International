// import api from "./api";

// // Learner 360° Profile — pure read aggregation endpoint.
// export const getLearnerProfile = async (id) => {
//   const { data } = await api.get(`/admin/learners/${id}/profile`);
//   return data.data || data;
// };


import api from "./api";

// Learner 360° Profile — pure read aggregation endpoint.
export const getLearnerProfile = async (id) => {
  const { data } = await api.get(`/admin/learners/${id}/profile`);
  return data.data || data;
};

// Complete Candidate History Export — downloads a CSV covering everything
// about the candidate from registration to present (registration history,
// enrollment, payments, assignments, exams, certificates, documents,
// attendance, activity timeline).
export const exportLearnerHistory = async (id) => {
  const response = await api.get(`/admin/learners/${id}/export`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `candidate-${id}-history.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Registration Requirement 3 — admin decides which requested course(s) a
// candidate is actually enrolled into.
export const approveRequestedCourse = async (registrationId, courseId, batchId) => {
  const { data } = await api.patch(
    `/admin/registrations/${registrationId}/courses/approve`,
    { courseId, batchId },
  );
  return data.data || data;
};

export const rejectRequestedCourse = async (registrationId, courseId, reason) => {
  const { data } = await api.patch(
    `/admin/registrations/${registrationId}/courses/reject`,
    { courseId, reason },
  );
  return data.data || data;
};
