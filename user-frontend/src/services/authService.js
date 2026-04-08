
import api from "./api";

export const login = async (credentials) => {
  try {
    const res = await api.post("/auth/login", credentials);

    return res.data.data; // ✅ return only data object
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const changePassword = async (payload) => {
  try {
    const res = await api.put("/auth/change-password", payload);

    return res.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to change password",
    };
  }
};