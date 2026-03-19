import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Load user on app start if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        console.log("🔄 Fetching user...");

        const res = await api.get("/auth/me");

        console.log("✅ User loaded:", res.data);

        setUser(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch user:", err.response?.data || err.message);

        // ❗ Only logout if token is invalid (401)
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // 🔥 LOGIN FUNCTION
  const login = async (email, password) => {
    try {
      console.log("🔐 Logging in...");

      const res = await api.post("/auth/login", { email, password });

      const newToken = res.data.token;

      if (!newToken) {
        throw new Error("Token not received from server");
      }

      // Save token
      localStorage.setItem("authToken", newToken);
      setToken(newToken);

      console.log("✅ Token saved");

      // Fetch user
      const userRes = await api.get("/auth/me");

      console.log("✅ User after login:", userRes.data);

      setUser(userRes.data);

      return { success: true };

    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);

      throw err; // important for UI error handling
    }
  };

  // 🔥 LOGOUT FUNCTION
  const logout = () => {
    console.warn("🚪 Logging out...");

    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!token && !!user, // ✅ useful flag
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);