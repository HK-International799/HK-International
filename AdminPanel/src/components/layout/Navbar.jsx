import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-30">

      {/* Left */}
      <div className="flex items-center gap-4">

        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:block relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search courses, users, assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-72 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        {/* Notification */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User */}
        <div className="relative">

          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-lg"
          >
            <div className="w-8 h-8 bg-indigo-600 text-white flex items-center justify-center rounded-full">
              {user?.name?.charAt(0)}
            </div>

            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>

            <ChevronDown size={14} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl border">

              <div className="p-4 border-b">
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>

              <button
                onClick={() => navigate("/admin/settings")}
                className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50"
              >
                <Settings size={16} />
                Settings
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}