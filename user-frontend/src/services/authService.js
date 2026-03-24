import api from "./api";

export const login = async (credentials) => {
  try {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const changePassword = async (payload) => {
  try {
    const { data } = await api.put("/auth/change-password", payload);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to change password" };
  }
};
