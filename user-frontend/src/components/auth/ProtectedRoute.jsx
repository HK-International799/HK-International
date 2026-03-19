import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

if (loading) return <div className="text-center mt-10">Checking authentication...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
