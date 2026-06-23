import api from "./api";

// Learner 360° Profile — pure read aggregation endpoint.
export const getLearnerProfile = async (id) => {
  const { data } = await api.get(`/admin/learners/${id}/profile`);
  return data.data || data;
};
