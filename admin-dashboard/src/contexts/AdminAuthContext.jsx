import { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ NEW

  // ✅ Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");

    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Invalid user in localStorage");
        localStorage.removeItem("adminUser");
      }
    }

    setLoading(false); // ✅ IMPORTANT
  }, []);

  // ✅ Sync token
  useEffect(() => {
    if (token) localStorage.setItem("adminToken", token);
    else localStorage.removeItem("adminToken");
  }, [token]);

  const login = (data) => {
    console.log("LOGIN DATA:", data); // 🔍 DEBUG

    setToken(data.token);
    setUser(data.user);

    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminUser", JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  };

  return (
    <AdminAuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);