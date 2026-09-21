
// import api from "./api";

// export const login = async (credentials) => {
//   try {
//     const res = await api.post("/auth/login", credentials);

//     return res.data; // ✅ return only data object
//   } catch (error) {
//     throw error.response?.data || { message: "Login failed" };
//   }
// };

// export const changePassword = async (payload) => {
//   try {
//     const res = await api.put("/auth/change-password", payload);

//     return res.data;
//   } catch (error) {
//     throw error.response?.data || {
//       message: "Failed to change password",
//     };
//   }
// };






import api from "./api";

export const login = async (credentials) => {
  try {
    const res = await api.post("/auth/login", credentials);

    return res.data; // ✅ return only data object
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

// ── Forgot / Reset Password ───────────────────────────────────────────────
export const forgotPassword = async (email) => {
  try {
    const res = await api.post("/auth/forgot-password", { email });

    return res.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to send reset link. Please try again.",
    };
  }
};

export const validateResetToken = async (token) => {
  try {
    const res = await api.post("/auth/validate-reset-token", { token });

    return res.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Unable to verify reset link. Please try again.",
    };
  }
};

export const resetPassword = async (payload) => {
  try {
    const res = await api.post("/auth/reset-password", payload);

    return res.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to reset password. Please try again.",
    };
  }
};
