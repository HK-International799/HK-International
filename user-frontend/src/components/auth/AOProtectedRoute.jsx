import { Navigate } from "react-router-dom";
import { useAO } from "../../contexts/AOContext";
import { Loader2 } from "lucide-react";

const AOProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAO();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/ao/login" replace />;
};

export default AOProtectedRoute;
