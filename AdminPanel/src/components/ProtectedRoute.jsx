import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";

export default function ProtectedRoute({ children }) {
  const { token, user, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) return <Navigate to="/login" replace />;
  return children;
}
