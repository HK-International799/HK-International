import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, user, loading } = useAdminAuth();
  const location = useLocation();

  // ⏳ Wait until auth state is ready
  if (loading) {
    return <div>Loading...</div>;
  }

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ❌ No user found (important fallback)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Not admin
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;