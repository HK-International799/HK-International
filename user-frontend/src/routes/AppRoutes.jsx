// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "../pages/public/Home";
// import About from "../pages/public/About";
// import Contact from "../pages/public/Contact";
// import Login from "../pages/auth/Login";
// import Register from "../pages/auth/Register";
// import ForgotPassword from "../pages/auth/ForgotPassword";
// import Courses from "../pages/public/Courses";
// import CourseDetails from "../pages/public/CourseDetails";
// import Dashboard from "../pages/students/Dashboard";
// import MyCourses from "./../pages/students/MyCourses";
// import CoursePlayer from "./../pages/students/CoursePlayer";
// import Certificates from "./../pages/students/Certificates";
// import Profile from "./../pages/students/Profile";
// import ProtectedRoute from "../components/auth/ProtectedRoute";

// export default function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/courses" element={<Courses />} />
//         <Route path="/course/:id" element={<CourseDetails />} />

//         <Route
//           path="/student/dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/student/courses"
//           element={
//             <ProtectedRoute>
//               <MyCourses />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/student/course/:id"
//           element={
//             <ProtectedRoute>
//               <CoursePlayer />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/student/certificates"
//           element={
//             <ProtectedRoute>
//               <Certificates />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/student/profile"
//           element={
//             <ProtectedRoute>
//               <Profile />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }



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
import MyCourses from "../pages/students/MyCourses";
import CoursePlayer from "../pages/students/CoursePlayer";
import Assignments from "../pages/students/Assignments";
import Certificates from "../pages/students/Certificates";
import Profile from "../pages/students/Profile";
import ChangePassword from "../pages/students/ChangePassword";
import ProtectedRoute from "../components/auth/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
}
