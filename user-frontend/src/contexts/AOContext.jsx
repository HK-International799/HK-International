import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AOContext = createContext();

export const AOProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("aoToken"));
  const [aoUser, setAoUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const aoLogout = useCallback(() => {
    localStorage.removeItem("aoToken");
    setToken(null);
    setAoUser(null);
  }, []);

  useEffect(() => {
    const fetchAO = async () => {
      if (!token) { setLoading(false); return; }
      setLoading(true);
      try {
        // Set AO token in header for this request
        const { data } = await api.get("/ao/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAoUser(data);
      } catch {
        aoLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchAO();
  }, [token, aoLogout]);

  const aoLogin = async (credentials) => {
    const { data } = await api.post("/ao/auth/login", credentials);
    const newToken = data.token;
    if (!newToken) throw new Error("Token not received");
    localStorage.setItem("aoToken", newToken);
    setToken(newToken);
    return { success: true };
  };

  return (
    <AOContext.Provider value={{
      token,
      aoUser,
      loading,
      aoLogin,
      aoLogout,
      isAuthenticated: !!token && !!aoUser,
    }}>
      {children}
    </AOContext.Provider>
  );
};

export const useAO = () => useContext(AOContext);
