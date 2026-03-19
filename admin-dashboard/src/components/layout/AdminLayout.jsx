import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <div
        className={`
          ${sidebarOpen ? "w-64" : "w-20"}
          transition-all duration-300
          bg-white shadow-md
          hidden md:block
        `}
      >
        <Sidebar collapsed={!sidebarOpen} />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setSidebarOpen(false)}
          ></div>

          <div className="relative w-64 h-full bg-white shadow-md">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <div className="sticky top-0 z-30 bg-white shadow">
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

      </div>
    </div>
  );
}