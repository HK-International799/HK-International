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


// import { Navigate } from "react-router-dom";
// import { useAdminAuth } from "../contexts/AdminAuthContext";

// export default function ProtectedRoute({ children }) {
//   const { token, user, loading } = useAdminAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-surface">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
//           <p className="text-sm text-gray-500">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!token || !user) return <Navigate to="/login" replace />;
//   return children;
// }
