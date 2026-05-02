import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import {
  LayoutDashboard, BookOpen, Users, Layers, Video, ClipboardList,
  FileText, FileCheck, MessageSquare, Award, BarChart3, MessageCircle,
  Database, Settings, LogOut, ChevronLeft, ChevronRight, GraduationCap,
  Building2, ClipboardCheck, Presentation,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      // { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      // { to: "/admin/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    label: "Academic",
    items: [
      { to: "/admin/courses", label: "Courses", icon: BookOpen },
      // { to: "/admin/batches", label: "Batches", icon: Layers },
      { to: "/admin/learners", label: "Learners", icon: GraduationCap },
      // { to: "/admin/live-classes", label: "Live Classes", icon: Video },
    ],
  },
  {
    label: "Assessment",
    items: [
      { to: "/admin/assignments", label: "Assignments", icon: ClipboardList },
      { to: "/admin/scenario-exams", label: " Scenario-Based Exams", icon: FileCheck },
      { to: "/admin/exams", label: "  Exams", icon: FileCheck },
      { to: "/admin/question-bank", label: "Question Bank", icon: Database },
    ],
  },
  // {
  //   label: "Institutes & Registrations",
  //   items: [
  //     { to: "/admin/institutes", label: "Partner Institutes", icon: Building2 },
  //     { to: "/admin/registrations", label: "Registrations", icon: ClipboardCheck },
  //     { to: "/admin/orientation", label: "Orientation", icon: Presentation },
  //   ],
  // },
  // {
  //   label: "Management",
  //   items: [
  //     { to: "/admin/documents", label: "Document Review", icon: FileText },
  //     { to: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  //     { to: "/admin/messages", label: "Messages", icon: MessageCircle },
  //     { to: "/admin/certificates", label: "Certificates", icon: Award },
  //   ],
  // },
  {
    label: "System",
    items: [{ to: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { logout, user } = useAdminAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
      isActive
        ? "bg-indigo-500/15 text-indigo-600 font-semibold"
        : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
    } ${collapsed ? "justify-center" : ""}`;

  return (
    <div
      className={`${
        collapsed ? "w-[75px]" : "w-[260px]"
      } bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-gray-800 tracking-wide">LMS Admin</h1>
            <p className="text-[11px] text-gray-400">Control Panel</p>
          </div>
        )}
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-5 mb-1.5 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5 px-2">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} title={collapsed ? label : ""} className={linkClass}>
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                  {collapsed && (
                    <span className="absolute left-full ml-3 whitespace-nowrap bg-gray-800 text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition z-50">
                      {label}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User */}
      <div className="border-t border-gray-100 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}
