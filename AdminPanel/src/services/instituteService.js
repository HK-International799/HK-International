import api from "./api";

export const getAllInstitutes = async (status) => {
  const { data } = await api.get("/partner-institutes", { params: status ? { status } : {} });
  return data.data || data;
};

export const getInstituteById = async (id) => {
  const { data } = await api.get(`/partner-institutes/${id}`);
  return data.data || data;
};

export const approveRejectInstitute = async (id, payload) => {
  const { data } = await api.patch(`/partner-institutes/${id}/status`, payload);
  return data.data || data;
};
