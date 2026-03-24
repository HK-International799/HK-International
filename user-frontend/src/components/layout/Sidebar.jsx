import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  MdDashboard,
  MdMenuBook,
  MdAssignment,
  MdWorkspacePremium,
  MdPerson,
  MdLogout,
} from "react-icons/md";
import {
  MessageCircle,
  Video,
  Upload,
  HelpCircle,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const navItems = [
  {
    to: "/student/dashboard",
    label: "Dashboard",
    icon: <MdDashboard size={20} />,
  },
  {
    to: "/student/courses",
    label: "My Courses",
    icon: <MdMenuBook size={20} />,
  },
  {
    to: "/student/assignments",
    label: "Assignments",
    icon: <MdAssignment size={20} />,
  },
  { to: "/student/submit", label: "Submit Work", icon: <Upload size={18} /> },
  {
    to: "/student/live-classes",
    label: "Live Classes",
    icon: <Video size={18} />,
  },
  {
    to: "/student/chat",
    label: "Chat",
    icon: <MessageCircle size={18} />,
    badge: true,
  },
  {
    to: "/student/question-bank",
    label: "Question Bank",
    icon: <HelpCircle size={18} />,
  },
  {
    to: "/student/feedback",
    label: "Feedback",
    icon: <MessageSquare size={18} />,
  },
  {
    to: "/student/notifications",
    label: "Notifications",
    icon: <Bell size={18} />,
    badge: true,
  },
  {
    to: "/student/certificates",
    label: "Certificates",
    icon: <MdWorkspacePremium size={20} />,
  },
  { to: "/student/profile", label: "My Profile", icon: <MdPerson size={20} /> },
  { to: "/student/settings", label: "Settings", icon: <Settings size={18} /> },
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
      className="bg-white border-r border-gray-100 shadow-sm flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] z-40 pt-3"
    >
      {/* USER INFO */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-orange-400"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden min-w-0"
              >
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* NAV LINKS */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {({ isActive }) => (
              <div
                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-orange-500 rounded-r-full" />
                )}

                <span className="flex-shrink-0 flex items-center justify-center w-5">
                  {item.icon}
                </span>

                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip */}
                {!expanded && (
                  <span className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="px-2 pb-3 border-t border-gray-100 pt-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition group relative"
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
            <span className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Logout
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
