// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { AdminAuthProvider, useAdminAuth } from "./contexts/AdminAuthContext";
// import { lazy, Suspense } from "react";

// // Auth
// import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";
// import ProtectedRoute from "./components/ProtectedRoute";
// import CourseDetails from "./pages/courses/CourseDetails";
// import CourseEnrollments from "./pages/courses/CourseEnrollments";
// import ExamList from "./pages/exams/ExamList";
// import CreateExam from "./pages/exams/CreateExam";
// import ExamReport from "./pages/exams/ExamReport";
// import EditExam from "./pages/exams/EditExam";
// import CrmDashboard from "./pages/crm/CrmDashboard";
// import Leads from "./pages/crm/Leads";
// import LeadDetail from "./pages/crm/LeadDetail";
// import Pipeline from "./pages/crm/Pipeline";
// import FollowUps from "./pages/crm/FollowUps";
// import Tasks from "./pages/crm/Tasks";
// import Contacts from "./pages/crm/Contacts";
// import Organisations from "./pages/crm/Organisations";

// // Finance
// import FinanceDashboard from "./pages/finance/FinanceDashboard";
// import PaymentsList from "./pages/finance/PaymentsList";
// import RecordPayment from "./pages/finance/RecordPayment";
// import LearnerPaymentProfile from "./pages/finance/LearnerPaymentProfile";
// import TransactionDetail from "./pages/finance/TransactionDetail";
// import FinanceReports from "./pages/finance/FinanceReports";
// import CourseFees from "./pages/finance/CourseFees";
// import ShippingLabelSheets from "./Tools/ShippingLabelSheets";

// // Lazy load all pages
// const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
// const Courses = lazy(() => import("./pages/courses/Courses"));
// const Batches = lazy(() => import("./pages/batches/Batches"));
// const Learners = lazy(() => import("./pages/learners/Learners"));
// const LearnerProfile = lazy(() => import("./pages/learners/LearnerProfile"));
// const LiveClasses = lazy(() => import("./pages/liveClasses/LiveClasses"));

// // ✅ Updated assignment pages
// const Assignments = lazy(() => import("./pages/assignments/Assignments"));
// const SubmissionsList = lazy(
//   () => import("./pages/submissions/SubmissionsList"),
// );
// const SubmissionReview = lazy(
//   () => import("./pages/submissions/SubmissionReview"),
// );

// const DocumentReview = lazy(
//   () => import("./pages/documentReview/DocumentReview"),
// );
// const Feedback = lazy(() => import("./pages/feedback/Feedback"));
// const Analytics = lazy(() => import("./pages/analytics/Analytics"));
// const Messages = lazy(() => import("./pages/messages/Messages"));
// const Certificates = lazy(() => import("./pages/certificates/Certificates"));
// const Reports = lazy(() => import("./pages/reports/Reports"));
// const QuestionBank = lazy(() => import("./pages/questionBank/QuestionBank"));
// const Settings = lazy(() => import("./pages/settings/Settings"));

// // New modules
// const Institutes = lazy(() => import("./pages/institutes/Institutes"));
// const Registrations = lazy(() => import("./pages/registrations/Registrations"));
// const Orientation = lazy(() => import("./pages/orientation/Orientation"));

// // CRM

// const AdminScenarioExamList = lazy(
//   () => import("./pages/scenarioExam/AdminExamListPage"),
// );
// const AdminScenarioExamBuilder = lazy(
//   () => import("./pages/scenarioExam/AdminExamBuilderPage"),
// );
// const AdminScenarioSubmissions = lazy(
//   () => import("./pages/scenarioExam/AdminSubmissionsPage"),
// );
// const AdminScenarioReview = lazy(
//   () => import("./pages/scenarioExam/AdminReviewPage"),
// );

// const Loader = () => (
//   <div className="min-h-screen flex items-center justify-center bg-gray-50">
//     <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//   </div>
// );

// const RootRedirect = () => {
//   const { token, user, loading } = useAdminAuth();
//   if (loading) return <Loader />;
//   if (!token || !user) return <Navigate to="/login" replace />;
//   return <Navigate to="/admin/dashboard" replace />;
// };

// const P = ({ children }) => (
//   <ProtectedRoute>
//     <Suspense fallback={<Loader />}>{children}</Suspense>
//   </ProtectedRoute>
// );

// function App() {
//   return (
//     <AdminAuthProvider>
//       <Router>
//         <Routes>
//           <Route path="/" element={<RootRedirect />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />

//           <Route
//             path="/admin/dashboard"
//             element={
//               <P>
//                 <Dashboard />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/courses"
//             element={
//               <P>
//                 <Courses />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/batches"
//             element={
//               <P>
//                 <Batches />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/learners"
//             element={
//               <P>
//                 <Learners />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/learners/:id"
//             element={
//               <P>
//                 <LearnerProfile />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/live-classes"
//             element={
//               <P>
//                 <LiveClasses />
//               </P>
//             }
//           />

//           {/* ── Assignment Module ───────────────────────────────────── */}
//           <Route
//             path="/admin/assignments"
//             element={
//               <P>
//                 <Assignments />
//               </P>
//             }
//           />

//           {/* All submissions (no filter) */}
//           <Route
//             path="/admin/submissions"
//             element={
//               <P>
//                 <SubmissionsList />
//               </P>
//             }
//           />
//           {/* Submissions filtered by assignment */}
//           <Route
//             path="/admin/assignments/:assignmentId/submissions"
//             element={
//               <P>
//                 <SubmissionsList />
//               </P>
//             }
//           />
//           {/* Single submission review / grade */}
//           <Route
//             path="/admin/submissions/:id/review"
//             element={
//               <P>
//                 <SubmissionReview />
//               </P>
//             }
//           />

//           <Route
//             path="/admin/documents"
//             element={
//               <P>
//                 <DocumentReview />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/feedback"
//             element={
//               <P>
//                 <Feedback />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/analytics"
//             element={
//               <P>
//                 <Analytics />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/messages"
//             element={
//               <P>
//                 <Messages />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/certificates"
//             element={
//               <P>
//                 <Certificates />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/reports"
//             element={
//               <P>
//                 <Reports />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/question-bank"
//             element={
//               <P>
//                 <QuestionBank />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/settings"
//             element={
//               <P>
//                 <Settings />
//               </P>
//             }
//           />

//           {/* New Modules */}
//           <Route
//             path="/admin/institutes"
//             element={
//               <P>
//                 <Institutes />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/registrations"
//             element={
//               <P>
//                 <Registrations />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/orientation"
//             element={
//               <P>
//                 <Orientation />
//               </P>
//             }
//           />
//           <Route path="/admin/courses/:id" element={<CourseDetails />} />
//           <Route
//             path="/admin/courses/:id/enrollments"
//             element={
//               <ProtectedRoute>
//                 <CourseEnrollments />
//               </ProtectedRoute>
//             }
//           />

//           {/* ── Scenario-Based Exams (Admin) ───────────────── */}
//           <Route
//             path="/admin/scenario-exams"
//             element={
//               <P>
//                 <AdminScenarioExamList />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/scenario-exams/create"
//             element={
//               <P>
//                 <AdminScenarioExamBuilder />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/scenario-exams/:id/edit"
//             element={
//               <P>
//                 <AdminScenarioExamBuilder />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/scenario-exams/:id/submissions"
//             element={
//               <P>
//                 <AdminScenarioSubmissions />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/scenario-exams/attempts/:aId/review"
//             element={
//               <P>
//                 <AdminScenarioReview />
//               </P>
//             }
//           />

//           {/* exam Routes */}
//           <Route path="/exams" element={<ExamList />} />
//           <Route path="/exams/create" element={<CreateExam />} />
//           <Route path="/exams/:examId/report" element={<ExamReport />} />
//           <Route path="/exams/:examId/edit" element={<EditExam />} />

//           <Route path="*" element={<Navigate to="/" replace />} />

//           {/* ── CRM Module ──────────────────────────────────────────────── */}
//           <Route
//             path="/admin/crm/dashboard"
//             element={
//               <P>
//                 <CrmDashboard />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/crm/leads"
//             element={
//               <P>
//                 <Leads />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/crm/leads/:id"
//             element={
//               <P>
//                 <LeadDetail />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/crm/pipeline"
//             element={
//               <P>
//                 <Pipeline />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/crm/followups"
//             element={
//               <P>
//                 <FollowUps />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/crm/tasks"
//             element={
//               <P>
//                 <Tasks />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/crm/contacts"
//             element={
//               <P>
//                 <Contacts />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/crm/organisations"
//             element={
//               <P>
//                 <Organisations />
//               </P>
//             }
//           />

//           {/* ── Finance Module ──────────────────────────────────────────────── */}
//           <Route
//             path="/admin/finance/dashboard"
//             element={
//               <P>
//                 <FinanceDashboard />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/finance/payments"
//             element={
//               <P>
//                 <PaymentsList />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/finance/record"
//             element={
//               <P>
//                 <RecordPayment />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/finance/learner/:userId"
//             element={
//               <P>
//                 <LearnerPaymentProfile />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/finance/transaction/:id"
//             element={
//               <P>
//                 <TransactionDetail />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/finance/reports"
//             element={
//               <P>
//                 <FinanceReports />
//               </P>
//             }
//           />
//           <Route
//             path="/admin/finance/fees"
//             element={
//               <P>
//                 <CourseFees />
//               </P>
//             }
//           />

//           {/* ====================================tools============================== */}
//           <Route
//             path="/tools/label-maker"
//             element={
//               <P>
//                 <ShippingLabelSheets />
//               </P>
//             }
//           />
//         </Routes>
//       </Router>
//     </AdminAuthProvider>
//   );
// }

// export default App;









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
import CourseEnrollments from "./pages/courses/CourseEnrollments";
import ExamList from "./pages/exams/ExamList";
import CreateExam from "./pages/exams/CreateExam";
import ExamReport from "./pages/exams/ExamReport";
import EditExam from "./pages/exams/EditExam";
import CrmDashboard from "./pages/crm/CrmDashboard";
import Leads from "./pages/crm/Leads";
import LeadDetail from "./pages/crm/LeadDetail";
import Pipeline from "./pages/crm/Pipeline";
import FollowUps from "./pages/crm/FollowUps";
import Tasks from "./pages/crm/Tasks";
import Contacts from "./pages/crm/Contacts";
import Organisations from "./pages/crm/Organisations";

// Finance
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import PaymentsList from "./pages/finance/PaymentsList";
import RecordPayment from "./pages/finance/RecordPayment";
import LearnerPaymentProfile from "./pages/finance/LearnerPaymentProfile";
import TransactionDetail from "./pages/finance/TransactionDetail";
import FinanceReports from "./pages/finance/FinanceReports";
import CourseFees from "./pages/finance/CourseFees";
import ShippingLabelSheets from "./Tools/ShippingLabelSheets";

// Lazy load all pages
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Courses = lazy(() => import("./pages/courses/Courses"));
const Batches = lazy(() => import("./pages/batches/Batches"));
const Learners = lazy(() => import("./pages/learners/Learners"));
const LearnerProfile = lazy(() => import("./pages/learners/LearnerProfile"));
const LiveClasses = lazy(() => import("./pages/liveClasses/LiveClasses"));

// ✅ Updated assignment pages
const Assignments = lazy(() => import("./pages/assignments/Assignments"));
const SubmissionsList = lazy(
  () => import("./pages/submissions/SubmissionsList"),
);
const SubmissionReview = lazy(
  () => import("./pages/submissions/SubmissionReview"),
);

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

// Certificate Dispatch & Courier Management
const DispatchDashboard = lazy(() => import("./pages/dispatch/DispatchDashboard"));
const DispatchCertificates = lazy(() => import("./pages/dispatch/DispatchCertificates"));
const CertificateDispatchDetail = lazy(() => import("./pages/dispatch/CertificateDispatchDetail"));
const DispatchBatches = lazy(() => import("./pages/dispatch/DispatchBatches"));
const DispatchBatchDetail = lazy(() => import("./pages/dispatch/DispatchBatchDetail"));
const DispatchExpenses = lazy(() => import("./pages/dispatch/DispatchExpenses"));
const DispatchReports = lazy(() => import("./pages/dispatch/DispatchReports"));
const DispatchSenderSettings = lazy(() => import("./pages/dispatch/DispatchSenderSettings"));

// CRM

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
            path="/admin/learners/:id"
            element={
              <P>
                <LearnerProfile />
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
          <Route
            path="/admin/courses/:id/enrollments"
            element={
              <ProtectedRoute>
                <CourseEnrollments />
              </ProtectedRoute>
            }
          />

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

          {/* exam Routes */}
          <Route path="/exams" element={<ExamList />} />
          <Route path="/exams/create" element={<CreateExam />} />
          <Route path="/exams/:examId/report" element={<ExamReport />} />
          <Route path="/exams/:examId/edit" element={<EditExam />} />

          <Route path="*" element={<Navigate to="/" replace />} />

          {/* ── CRM Module ──────────────────────────────────────────────── */}
          <Route
            path="/admin/crm/dashboard"
            element={
              <P>
                <CrmDashboard />
              </P>
            }
          />
          <Route
            path="/admin/crm/leads"
            element={
              <P>
                <Leads />
              </P>
            }
          />
          <Route
            path="/admin/crm/leads/:id"
            element={
              <P>
                <LeadDetail />
              </P>
            }
          />
          <Route
            path="/admin/crm/pipeline"
            element={
              <P>
                <Pipeline />
              </P>
            }
          />
          <Route
            path="/admin/crm/followups"
            element={
              <P>
                <FollowUps />
              </P>
            }
          />
          <Route
            path="/admin/crm/tasks"
            element={
              <P>
                <Tasks />
              </P>
            }
          />
          <Route
            path="/admin/crm/contacts"
            element={
              <P>
                <Contacts />
              </P>
            }
          />
          <Route
            path="/admin/crm/organisations"
            element={
              <P>
                <Organisations />
              </P>
            }
          />

          {/* ── Finance Module ──────────────────────────────────────────────── */}
          <Route
            path="/admin/finance/dashboard"
            element={
              <P>
                <FinanceDashboard />
              </P>
            }
          />
          <Route
            path="/admin/finance/payments"
            element={
              <P>
                <PaymentsList />
              </P>
            }
          />
          <Route
            path="/admin/finance/record"
            element={
              <P>
                <RecordPayment />
              </P>
            }
          />
          <Route
            path="/admin/finance/learner/:userId"
            element={
              <P>
                <LearnerPaymentProfile />
              </P>
            }
          />
          <Route
            path="/admin/finance/transaction/:id"
            element={
              <P>
                <TransactionDetail />
              </P>
            }
          />
          <Route
            path="/admin/finance/reports"
            element={
              <P>
                <FinanceReports />
              </P>
            }
          />
          <Route
            path="/admin/finance/fees"
            element={
              <P>
                <CourseFees />
              </P>
            }
          />

          {/* ── Certificate Dispatch & Courier Management ─────────────────── */}
          <Route
            path="/admin/dispatch/dashboard"
            element={
              <P>
                <DispatchDashboard />
              </P>
            }
          />
          <Route
            path="/admin/dispatch/certificates"
            element={
              <P>
                <DispatchCertificates />
              </P>
            }
          />
          <Route
            path="/admin/dispatch/certificates/:id"
            element={
              <P>
                <CertificateDispatchDetail />
              </P>
            }
          />
          <Route
            path="/admin/dispatch/batches"
            element={
              <P>
                <DispatchBatches />
              </P>
            }
          />
          <Route
            path="/admin/dispatch/batches/:id"
            element={
              <P>
                <DispatchBatchDetail />
              </P>
            }
          />
          <Route
            path="/admin/dispatch/expenses"
            element={
              <P>
                <DispatchExpenses />
              </P>
            }
          />
          <Route
            path="/admin/dispatch/reports"
            element={
              <P>
                <DispatchReports />
              </P>
            }
          />
          <Route
            path="/admin/dispatch/sender"
            element={
              <P>
                <DispatchSenderSettings />
              </P>
            }
          />

          {/* ====================================tools============================== */}
          <Route
            path="/tools/label-maker"
            element={
              <P>
                <ShippingLabelSheets />
              </P>
            }
          />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
