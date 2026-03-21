import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  GraduationCap,
  LogOut,
  UserPlus,
  PlusSquare,
  Activity,
  UserCheck,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAdminAuth();

  const baseClass =
    "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all relative";

  const activeClass =
    "bg-white text-black font-semibold shadow before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-black before:rounded-r";

  const inactiveClass = "text-gray-400 hover:bg-gray-800 hover:text-white";

  const navItem = (to, label, Icon) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${baseClass} ${isActive ? activeClass : inactiveClass}`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );

  return (
    <div className="w-64 bg-black text-white h-screen flex flex-col">
      {/* 🔝 SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-5 py-6 scrollbar-hide">
        {/* Logo */}
        <div className="mb-10">
          <h1 className="text-xl font-bold tracking-wide">
            1A HK International
          </h1>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>

        {/* MAIN */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
            Main
          </p>

          <div className="flex flex-col gap-1">
            {navItem("/admin/dashboard", "Dashboard", LayoutDashboard)}
            {navItem("/admin/activity", "Activity", Activity)}
            {navItem("/admin/analytics", "Analytics", BarChart3)}
          </div>
        </div>

        {/* USER MANAGEMENT */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
            User Management
          </p>

          <div className="flex flex-col gap-2">
            {navItem("/admin/users", "All Users", Users)}
            {navItem("/admin/create-user", "Create User", UserPlus)}
          </div>
        </div>

        {/* COURSE MANAGEMENT */}
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
            Course Management
          </p>

          <div className="flex flex-col gap-2">
            {navItem("/admin/courses", "All Courses", BookOpen)}
            {navItem("/admin/create-course", "Create Course", PlusSquare)}
            {navItem("/admin/assign-tutor", "Assign Tutor", UserCheck)}
            {navItem("/admin/enroll", "Enroll Student", GraduationCap)}
            {navItem("/admin/assignments", "Assignments", ClipboardList)}
            {navItem("/admin/create-assignment", "Create Assignment", PlusSquare)}
          </div>
        </div>
        
      </div>

      {/* 🔻 FIXED BOTTOM */}
      <div className="px-5 py-4 border-t border-gray-800">
        {/* User Info */}
        {/* <div className="bg-gray-900 rounded-lg p-3 mb-3">
          <p className="text-sm font-medium">{user?.name || "Admin"}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div> */}

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm text-red-400 hover:bg-red-500 hover:text-white transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
