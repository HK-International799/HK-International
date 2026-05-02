import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./contexts/AdminAuthContext";
import { lazy, Suspense } from "react";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseDetails from "./pages/courses/CourseDetails";

// Lazy load all pages
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Courses = lazy(() => import("./pages/courses/Courses"));
const Batches = lazy(() => import("./pages/batches/Batches"));
const Learners = lazy(() => import("./pages/learners/Learners"));
const LiveClasses = lazy(() => import("./pages/liveClasses/LiveClasses"));

// ✅ Updated assignment pages
const Assignments = lazy(() => import("./pages/assignments/Assignments"));
const SubmissionsList = lazy(
  () => import("./pages/submissions/SubmissionsList"),
);
const SubmissionReview = lazy(
  () => import("./pages/submissions/SubmissionReview"),
);

const Exams = lazy(() => import("./pages/exams/Exams"));
const DocumentReview = lazy(
  () => import("./pages/documentReview/DocumentReview"),
);
const Feedback = lazy(() => import("./pages/feedback/Feedback"));
const Analytics = lazy(() => import("./pages/analytics/Analytics"));
const Messages = lazy(() => import("./pages/messages/Messages"));
const Certificates = lazy(() => import("./pages/certificates/Certificates"));
const Reports = lazy(() => import("./pages/reports/Reports"));
const QuestionBank = lazy(() => import("./pages/questionBank/QuestionBank"));
const Settings = lazy(() => import("./pages/settings/Settings"));

// New modules
const Institutes = lazy(() => import("./pages/institutes/Institutes"));
const Registrations = lazy(() => import("./pages/registrations/Registrations"));
const Orientation = lazy(() => import("./pages/orientation/Orientation"));

const AdminScenarioExamList = lazy(
  () => import("./pages/scenarioExam/AdminExamListPage"),
);
const AdminScenarioExamBuilder = lazy(
  () => import("./pages/scenarioExam/AdminExamBuilderPage"),
);
const AdminScenarioSubmissions = lazy(
  () => import("./pages/scenarioExam/AdminSubmissionsPage"),
);
const AdminScenarioReview = lazy(
  () => import("./pages/scenarioExam/AdminReviewPage"),
);

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const RootRedirect = () => {
  const { token, user, loading } = useAdminAuth();
  if (loading) return <Loader />;
  if (!token || !user) return <Navigate to="/login" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

const P = ({ children }) => (
  <ProtectedRoute>
    <Suspense fallback={<Loader />}>{children}</Suspense>
  </ProtectedRoute>
);

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/admin/dashboard"
            element={
              <P>
                <Dashboard />
              </P>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <P>
                <Courses />
              </P>
            }
          />
          <Route
            path="/admin/batches"
            element={
              <P>
                <Batches />
              </P>
            }
          />
          <Route
            path="/admin/learners"
            element={
              <P>
                <Learners />
              </P>
            }
          />
          <Route
            path="/admin/live-classes"
            element={
              <P>
                <LiveClasses />
              </P>
            }
          />

          {/* ── Assignment Module ───────────────────────────────────── */}
          <Route
            path="/admin/assignments"
            element={
              <P>
                <Assignments />
              </P>
            }
          />

          {/* All submissions (no filter) */}
          <Route
            path="/admin/submissions"
            element={
              <P>
                <SubmissionsList />
              </P>
            }
          />
          {/* Submissions filtered by assignment */}
          <Route
            path="/admin/assignments/:assignmentId/submissions"
            element={
              <P>
                <SubmissionsList />
              </P>
            }
          />
          {/* Single submission review / grade */}
          <Route
            path="/admin/submissions/:id/review"
            element={
              <P>
                <SubmissionReview />
              </P>
            }
          />

          <Route
            path="/admin/exams"
            element={
              <P>
                <Exams />
              </P>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <P>
                <DocumentReview />
              </P>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <P>
                <Feedback />
              </P>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <P>
                <Analytics />
              </P>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <P>
                <Messages />
              </P>
            }
          />
          <Route
            path="/admin/certificates"
            element={
              <P>
                <Certificates />
              </P>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <P>
                <Reports />
              </P>
            }
          />
          <Route
            path="/admin/question-bank"
            element={
              <P>
                <QuestionBank />
              </P>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <P>
                <Settings />
              </P>
            }
          />

          {/* New Modules */}
          <Route
            path="/admin/institutes"
            element={
              <P>
                <Institutes />
              </P>
            }
          />
          <Route
            path="/admin/registrations"
            element={
              <P>
                <Registrations />
              </P>
            }
          />
          <Route
            path="/admin/orientation"
            element={
              <P>
                <Orientation />
              </P>
            }
          />
          <Route path="/admin/courses/:id" element={<CourseDetails />} />

          {/* ── Scenario-Based Exams (Admin) ───────────────── */}
          <Route
            path="/admin/scenario-exams"
            element={
              <P>
                <AdminScenarioExamList />
              </P>
            }
          />
          <Route
            path="/admin/scenario-exams/create"
            element={
              <P>
                <AdminScenarioExamBuilder />
              </P>
            }
          />
          <Route
            path="/admin/scenario-exams/:id/edit"
            element={
              <P>
                <AdminScenarioExamBuilder />
              </P>
            }
          />
          <Route
            path="/admin/scenario-exams/:id/submissions"
            element={
              <P>
                <AdminScenarioSubmissions />
              </P>
            }
          />
          <Route
            path="/admin/scenario-exams/attempts/:aId/review"
            element={
              <P>
                <AdminScenarioReview />
              </P>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
