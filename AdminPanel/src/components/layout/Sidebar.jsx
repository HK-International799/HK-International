import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Layers,
  Video,
  ClipboardList,
  FileText,
  FileCheck,
  MessageSquare,
  Award,
  BarChart3,
  MessageCircle,
  Database,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/admin/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    label: "Academic",
    items: [
      { to: "/admin/courses", label: "Courses", icon: BookOpen },
      { to: "/admin/batches", label: "Batches", icon: Layers },
      { to: "/admin/learners", label: "Learners", icon: GraduationCap },
      { to: "/admin/live-classes", label: "Live Classes", icon: Video },
    ],
  },
  {
    label: "Assessment",
    items: [
      { to: "/admin/assignments", label: "Assignments", icon: ClipboardList },
      { to: "/admin/exams", label: "Exams", icon: FileCheck },
      { to: "/admin/question-bank", label: "Question Bank", icon: Database },
    ],
  },
  {
    label: "Management",
    items: [
      { to: "/admin/documents", label: "Document Review", icon: FileText },
      { to: "/admin/feedback", label: "Feedback", icon: MessageSquare },
      { to: "/admin/messages", label: "Messages", icon: MessageCircle },
      { to: "/admin/certificates", label: "Certificates", icon: Award },
    ],
  },
  {
    label: "System",
    items: [{ to: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { logout, user } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <div
      className={`${
        collapsed ? "w-[75px]" : "w-[260px]"
      } bg-linear-to-b from-indigo-100 to-orange-100 text-white h-screen flex flex-col transition-all duration-300 shadow-xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-semibold tracking-wide">
              LMS Admin
            </h1>
            <p className="text-xs text-indigo-400">Control Panel</p>
          </div>
        )}

        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/10 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-5 mb-2 text-[10px] text-gray-400 uppercase tracking-wider">
                {group.label}
              </p>
            )}

            <div className="space-y-1 px-2">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={collapsed ? label : ""}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                    ${
                      isActive
                        ? "bg-indigo-500/10 text-indigo-400 shadow-inner"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                    ${collapsed ? "justify-center" : ""}`
                  }
                >
                  {/* Active Indicator */}
                  <span
                    className={({ isActive }) =>
                      `absolute left-0 top-0 h-full w-[3px] rounded-r-full transition-all ${
                        isActive ? "bg-indigo-500" : "bg-transparent"
                      }`
                    }
                  />

                  <Icon
                    size={18}
                    className="transition-transform group-hover:scale-110"
                  />

                  {!collapsed && (
                    <span className="font-medium tracking-wide">
                      {label}
                    </span>
                  )}

                  {/* Tooltip */}
                  {collapsed && (
                    <span className="absolute left-full ml-3 whitespace-nowrap bg-black text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition">
                      {label}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-semibold">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}