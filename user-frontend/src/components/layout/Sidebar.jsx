import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  MdDashboard,
  MdMenuBook,
  MdAssignment,
  MdWorkspacePremium,
  MdPerson,
  MdLock,
  MdLogout,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const navItems = [
  { to: "/student/dashboard", label: "Dashboard", icon: <MdDashboard size={20} /> },
  { to: "/student/courses", label: "My Courses", icon: <MdMenuBook size={20} /> },
  { to: "/student/assignments", label: "Assignments", icon: <MdAssignment size={20} /> },
  { to: "/student/certificates", label: "Certificates", icon: <MdWorkspacePremium size={20} /> },
  { to: "/student/profile", label: "My Profile", icon: <MdPerson size={20} /> },
  { to: "/student/change-password", label: "Password", icon: <MdLock size={20} /> },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      animate={{ width: expanded ? 240 : 70 }}
      transition={{ duration: 0.25 }}
      className= "bg-linear-to-r from-white/90  border-r border-gray-100 shadow-sm flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] z-40 pt-5"
    >
      {/* USER INFO */}
      <div className="px-3 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-orange-400"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <p className="font-semibold text-gray-950 text-sm truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-white truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* NAV LINKS */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {({ isActive }) => (
              <div
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-900 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-orange-500 rounded-r-md"></span>
                )}

                <span>{item.icon}</span>

                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip */}
                {!expanded && (
                  <span className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="px-2 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition group relative"
        >
          <MdLogout size={20} />

          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>

          {!expanded && (
            <span className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
              Logout
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}