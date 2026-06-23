import api from "./api";

// Public self-registration service.
// Mirrors the conventions of authService.js / studentService.js.

export const getRegistrationCourses = async () => {
  try {
    const res = await api.get("/registration/courses");
    return res.data?.data || [];
  } catch (error) {
    throw error.response?.data || { message: "Failed to load courses" };
  }
};

export const submitRegistration = async (payload) => {
  try {
    const res = await api.post("/registration", payload);
    return res.data?.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to submit registration" };
  }
};

export const uploadRegistrationDocuments = async (registrationId, formData) => {
  try {
    const res = await api.post(`/registration/${registrationId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to upload documents" };
  }
};

export const getRegistrationStatus = async (registrationId) => {
  try {
    const res = await api.get(`/registration/${registrationId}`);
    return res.data?.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load registration status" };
  }
};
