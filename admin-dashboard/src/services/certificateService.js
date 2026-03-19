import api from "./api";

export const generateCertificate = async (studentId, courseId) => {
  const { data } = await api.post("/admin/certificates", { studentId, courseId });
  return data;
};
