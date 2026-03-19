import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { useAdminAuth } from "./contexts/AdminAuthContext";

import Login from "./pages/Login";
import Register from "./pages/AdminRegister";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CertificatesPage from "./pages/CertificatesPage";
import OrdersPage from "./pages/OrdersPage";

import ProtectedRoute from "./components/ProtectedRoute";
import CreateUserPage from "./pages/CreateUserPage";

// ✅ Improved Redirect Logic
const RootRedirect = () => {
  const { token } = useAdminAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/admin/dashboard" replace />;
};

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/certificates"
            element={
              <ProtectedRoute>
                <CertificatesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/create-user"
            element={
              <ProtectedRoute>
                <CreateUserPage />
              </ProtectedRoute>
            }
          />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
