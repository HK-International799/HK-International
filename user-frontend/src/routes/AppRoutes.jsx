import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Courses from "../pages/public/Courses";
import CourseDetails from "../pages/public/CourseDetails";
import Dashboard from "../pages/students/Dashboard";
import MyCourses from "../pages/students/MyCourses";
import CoursePlayer from "../pages/students/CoursePlayer";
import Assignments from "../pages/students/Assignments";
import Certificates from "../pages/students/Certificates";
import Profile from "../pages/students/Profile";
import ChangePassword from "../pages/students/ChangePassword";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Chat from "../pages/students/Chat";
import UploadAssignment from "../pages/students/UploadAssignment";
import LiveClasses from "../pages/students/LiveClasses";
import QuestionBank from "../pages/students/QuestionBank";
import Feedback from "../pages/students/Feedback";
import Notifications from "../pages/students/Notifications";
import Settings from "../pages/students/Settings";
import { useEffect } from "react";

export default function AppRoutes() {
  function ScrollHandler() {
    const { pathname } = useLocation();

    useEffect(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, [pathname]);

    return null;
  }

  return (
    <BrowserRouter>
      <ScrollHandler />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetails />} />

        {/* Student Protected */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <ProtectedRoute>
              <MyCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/course/:id"
          element={
            <ProtectedRoute>
              <CoursePlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute>
              <Assignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/certificates"
          element={
            <ProtectedRoute>
              <Certificates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* ─── Student Protected ───────────────────────────────────────── */}

        <Route
          path="/student/submit"
          element={
            <ProtectedRoute>
              <UploadAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/live-classes"
          element={
            <ProtectedRoute>
              <LiveClasses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/question-bank"
          element={
            <ProtectedRoute>
              <QuestionBank />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/feedback"
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
