import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AOProtectedRoute from "../components/auth/AOProtectedRoute";

// ─── Lazy-loaded Public Pages ─────────────────────────────────────────────────
const Home           = lazy(() => import("../pages/public/Home"));
const About          = lazy(() => import("../pages/public/About"));
const Contact        = lazy(() => import("../pages/public/Contact"));
const Courses        = lazy(() => import("../pages/public/Courses"));
const CourseDetails  = lazy(() => import("../pages/public/CourseDetails"));

// ─── Auth Pages ───────────────────────────────────────────────────────────────
const Login          = lazy(() => import("../pages/auth/Login"));
const Register       = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));

// ─── Payment Pages ────────────────────────────────────────────────────────────
const PaymentPage    = lazy(() => import("../pages/PaymentPage"));
const PaymentSuccess = lazy(() => import("../pages/PaymentSuccess"));
const PaymentFailed  = lazy(() => import("../pages/PaymentFailed"));

// ─── Student Protected Pages ─────────────────────────────────────────────────
const Dashboard          = lazy(() => import("../pages/students/Dashboard"));
const MyCourses          = lazy(() => import("../pages/students/MyCourses"));
const CoursePlayer       = lazy(() => import("../pages/students/CoursePlayer"));
const Assignments        = lazy(() => import("../pages/students/Assignments"));
const Certificates       = lazy(() => import("../pages/students/Certificates"));
const Profile            = lazy(() => import("../pages/students/Profile"));
const Chat               = lazy(() => import("../pages/students/Chat"));
const UploadAssignment   = lazy(() => import("../pages/students/UploadAssignment"));
const LiveClasses        = lazy(() => import("../pages/students/LiveClasses"));
const QuestionBank       = lazy(() => import("../pages/students/QuestionBank"));
const Feedback           = lazy(() => import("../pages/students/Feedback"));
const Notifications      = lazy(() => import("../pages/students/Notifications"));
const Settings           = lazy(() => import("../pages/students/Settings"));
const ChangePassword     = lazy(() => import("../pages/students/ChangePassword"));

// ─── Orientation Pages ────────────────────────────────────────────────────────
const OrientationSessions   = lazy(() => import("../pages/students/OrientationSessions"));
const OrientationQuiz       = lazy(() => import("../pages/students/OrientationQuiz"));
const OrientationCertificate = lazy(() => import("../pages/students/OrientationCertificate"));

// ─── AO Portal Pages ─────────────────────────────────────────────────────────
const AOLogin         = lazy(() => import("../pages/ao/AOLogin"));
const AODashboard     = lazy(() => import("../pages/ao/AODashboard"));
const AOLearners      = lazy(() => import("../pages/ao/AOLearners"));
const AOCertifications = lazy(() => import("../pages/ao/AOCertifications"));
const AOAuditLogs     = lazy(() => import("../pages/ao/AOAuditLogs"));
const AOReports       = lazy(() => import("../pages/ao/AOReports"));

// ─── Loading Fallback ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
  </div>
);

// ─── Scroll to top on route change ───────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public ──────────────────────────────────────────────── */}
          <Route path="/"             element={<Home />} />
          <Route path="/about"        element={<About />} />
          <Route path="/contact"      element={<Contact />} />
          <Route path="/courses"      element={<Courses />} />
          <Route path="/course/:id"   element={<CourseDetails />} />

          {/* ── Auth ────────────────────────────────────────────────── */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ── Payment ─────────────────────────────────────────────── */}
          <Route path="/payment"         element={<PaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed"  element={<PaymentFailed />} />

          {/* ── Student Protected ───────────────────────────────────── */}
          <Route path="/student/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/student/courses"      element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="/student/course/:id"   element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>} />
          <Route path="/student/assignments"  element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path="/student/submit"       element={<ProtectedRoute><UploadAssignment /></ProtectedRoute>} />
          <Route path="/student/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
          <Route path="/student/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/student/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/student/chat"         element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/student/live-classes" element={<ProtectedRoute><LiveClasses /></ProtectedRoute>} />
          <Route path="/student/question-bank" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
          <Route path="/student/feedback"     element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/student/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/student/settings"     element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* ── Orientation (Student Protected) ─────────────────────── */}
          <Route
            path="/student/orientations"
            element={<ProtectedRoute><OrientationSessions /></ProtectedRoute>}
          />
          <Route
            path="/student/orientation/:sessionId/quiz"
            element={<ProtectedRoute><OrientationQuiz /></ProtectedRoute>}
          />
          <Route
            path="/student/orientation/:sessionId/certificate"
            element={<ProtectedRoute><OrientationCertificate /></ProtectedRoute>}
          />

          {/* ── AO Portal ───────────────────────────────────────────── */}
          <Route path="/ao/login"          element={<AOLogin />} />
          <Route path="/ao/dashboard"      element={<AOProtectedRoute><AODashboard /></AOProtectedRoute>} />
          <Route path="/ao/learners"       element={<AOProtectedRoute><AOLearners /></AOProtectedRoute>} />
          <Route path="/ao/certifications" element={<AOProtectedRoute><AOCertifications /></AOProtectedRoute>} />
          <Route path="/ao/audit-logs"     element={<AOProtectedRoute><AOAuditLogs /></AOProtectedRoute>} />
          <Route path="/ao/reports"        element={<AOProtectedRoute><AOReports /></AOProtectedRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
