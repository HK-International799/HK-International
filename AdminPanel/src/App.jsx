import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./contexts/AdminAuthContext";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";

// All Module Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Courses from "./pages/courses/Courses";
import Batches from "./pages/batches/Batches";
import Learners from "./pages/learners/Learners";
import LiveClasses from "./pages/liveClasses/LiveClasses";
import Assignments from "./pages/assignments/Assignments";
import Exams from "./pages/exams/Exams";
import DocumentReview from "./pages/documentReview/DocumentReview";
import Feedback from "./pages/feedback/Feedback";
import Analytics from "./pages/analytics/Analytics";
import Messages from "./pages/messages/Messages";
import Certificates from "./pages/certificates/Certificates";
import Reports from "./pages/reports/Reports";
import QuestionBank from "./pages/questionBank/QuestionBank";
import Settings from "./pages/settings/Settings";

const RootRedirect = () => {
  const { token, user, loading } = useAdminAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!token || !user) return <Navigate to="/login" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

// Wrapper for protected routes
const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── All 15 Modules ────────────────────────────────── */}
          <Route path="/admin/dashboard" element={<P><Dashboard /></P>} />
          <Route path="/admin/courses" element={<P><Courses /></P>} />
          <Route path="/admin/batches" element={<P><Batches /></P>} />
          <Route path="/admin/learners" element={<P><Learners /></P>} />
          <Route path="/admin/live-classes" element={<P><LiveClasses /></P>} />
          <Route path="/admin/assignments" element={<P><Assignments /></P>} />
          <Route path="/admin/exams" element={<P><Exams /></P>} />
          <Route path="/admin/documents" element={<P><DocumentReview /></P>} />
          <Route path="/admin/feedback" element={<P><Feedback /></P>} />
          <Route path="/admin/analytics" element={<P><Analytics /></P>} />
          <Route path="/admin/messages" element={<P><Messages /></P>} />
          <Route path="/admin/certificates" element={<P><Certificates /></P>} />
          <Route path="/admin/reports" element={<P><Reports /></P>} />
          <Route path="/admin/question-bank" element={<P><QuestionBank /></P>} />
          <Route path="/admin/settings" element={<P><Settings /></P>} />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
