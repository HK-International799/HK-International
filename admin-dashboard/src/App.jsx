import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AdminAuthProvider, useAdminAuth } from "./contexts/AdminAuthContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/AdminRegister";

import Dashboard from "./pages/adminManagement/Dashboard";
import Users from "./pages/adminManagement/Users";
import CreateUser from "./pages/adminManagement/CreateUser";
import EnrollStudent from "./pages/adminManagement/EnrollStudent";

// course Pages
import Courses from "./pages/courseManagement/Courses";
import CourseDetails from "./pages/courseManagement/CourseDetails";
import CreateCourse from "./pages/courseManagement/CreateCourse";
import EditCourse from "./pages/courseManagement/EditCourse";
import AssignTutor from "./pages/courseManagement/AssignTutor";

import AnalyticsPage from "./pages/AnalyticsPage";
import CertificatesPage from "./pages/CertificatesPage";
import OrdersPage from "./pages/OrdersPage";

import ProtectedRoute from "./components/ProtectedRoute";
import { Activity } from "react";
import EditUser from "./pages/adminManagement/EditUser";
import ManageSections from "./pages/courseManagement/ManageSections";

/**
 * ✅ Smart Root Redirect
 */
const RootRedirect = () => {
  const { token, user, loading } = useAdminAuth();

  if (loading) return <p>Loading...</p>;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/admin/dashboard" replace />;
};

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔐 Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/create-user"
            element={
              <ProtectedRoute>
                <CreateUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/enroll"
            element={
              <ProtectedRoute>
                <EnrollStudent />
              </ProtectedRoute>
            }
          />

          {/* Optional Existing Pages */}
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
            path="/admin/edit-user/:id"
            element={
              <ProtectedRoute>
                <EditUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/activity"
            element={
              <ProtectedRoute>
                <Activity />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-course"
            element={
              <ProtectedRoute>
                <CreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-course/:id"
            element={
              <ProtectedRoute>
                <EditCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assign-tutor"
            element={
              <ProtectedRoute>
                <AssignTutor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/courses/:id/sections"
            element={
              <ProtectedRoute>
                <ManageSections />
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
