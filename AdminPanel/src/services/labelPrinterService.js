import api from "./api";

// Label Printer — Auto mode. Paginated, server-side learner search that
// returns only the fields a shipping label needs.
// params: { search, page, limit }
export const searchLabelLearners = async (params = {}, { signal } = {}) => {
  const { data } = await api.get("/admin/label-printer/learners", { params, signal });
  return data.data;
};
