// import { createContext, useContext, useState, useEffect } from "react";

// const AdminAuthContext = createContext();

// export const AdminAuthProvider = ({ children }) => {
//   const [token, setToken] = useState(localStorage.getItem("authToken"));
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   /**
//    * ✅ Load user from localStorage
//    */
//   useEffect(() => {
//     const storedUser = localStorage.getItem("authUser");

//     if (storedUser && storedUser !== "undefined") {
//       try {
//         setUser(JSON.parse(storedUser));
//       } catch (err) {
//         console.error("Invalid user in localStorage");
//         localStorage.removeItem("authUser");
//       }
//     }

//     setLoading(false);
//   }, []);

//   /**
//    * ✅ Sync token
//    */
//   useEffect(() => {
//     if (token) localStorage.setItem("authToken", token);
//     else localStorage.removeItem("authToken");
//   }, [token]);

//   /**
//    * ✅ Login
//    */
//   const login = (data) => {
//     setToken(data.token);
//     setUser(data.user);

//     localStorage.setItem("authToken", data.token);
//     localStorage.setItem("authUser", JSON.stringify(data.user));
//   };

//   /**
//    * ✅ Logout
//    */
//   const logout = () => {
//     setToken(null);
//     setUser(null);

//     localStorage.removeItem("authToken");
//     localStorage.removeItem("authUser");
//   };

//   return (
//     <AdminAuthContext.Provider value={{ token, user, loading, login, logout }}>
//       {children}
//     </AdminAuthContext.Provider>
//   );
// };

// export const useAdminAuth = () => useContext(AdminAuthContext);


import { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("authUser");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) localStorage.setItem("authToken", token);
    else localStorage.removeItem("authToken");
  }, [token]);

  const login = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authUser", JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  };

  return (
    <AdminAuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
