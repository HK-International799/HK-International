import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Courses from "../pages/public/Courses";
import CourseDetails from "../pages/public/CourseDetails";
import Dashboard from "../pages/students/Dashboard";
import MyCourses from "./../pages/students/MyCourses";
import CoursePlayer from "./../pages/students/CoursePlayer";
import Certificates from "./../pages/students/Certificates";
import Profile from "./../pages/students/Profile";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetails />} />

        <Route path="/student/dashboard" element={<Dashboard />} />
        <Route path="/student/courses" element={<MyCourses />} />
        <Route path="/student/course/:id" element={<CoursePlayer />} />
        <Route path="/student/certificates" element={<Certificates />} />
        <Route path="/student/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
