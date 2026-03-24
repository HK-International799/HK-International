import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import {
  LayoutDashboard, BookOpen, Users, Layers, Video, ClipboardList,
  FileText, FileCheck, MessageSquare, Award, BarChart3, MessageCircle,
  Database, Settings, LogOut, ChevronLeft, ChevronRight, GraduationCap,
  Menu,
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
    items: [
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const { logout, user } = useAdminAuth();

  return (
    <div
      className={`${collapsed ? "w-[72px]" : "w-64"} bg-sidebar text-white h-screen flex flex-col transition-all duration-300 relative`}
    >
      {/* Header */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-4 py-5 border-b border-white/10`}>
        {!collapsed && (
          <div className="animate-fadeIn">
            <h1 className="text-base font-bold tracking-wide text-white">LMS Admin</h1>
            <p className="text-[10px] text-indigo-300 uppercase tracking-widest mt-0.5">Control Panel</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-sidebar-hover text-gray-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-2">
            {!collapsed && (
              <p className="px-5 py-1.5 text-[10px] text-indigo-300/60 uppercase tracking-[0.15em] font-medium">
                {group.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5 px-2">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 group relative
                    ${isActive
                      ? "bg-sidebar-active text-white shadow-lg shadow-indigo-500/20"
                      : "text-gray-400 hover:bg-sidebar-hover hover:text-white"
                    }
                    ${collapsed ? "justify-center" : ""}`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User / Logout */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate("/login"); }}
          title={collapsed ? "Logout" : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}
