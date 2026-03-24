import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

export default function Navbar() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login"); // ✅ FIXED
  };

  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center">

      {/* Left */}
      <h2
        onClick={() => navigate("/admin/dashboard")}
        className="font-bold text-lg cursor-pointer"
      >
        Admin Panel
      </h2>

      {/* Right */}
      <div className="flex items-center gap-4 relative">

        {!user ? (
          <>
            <Link
              to="/login" // ✅ FIXED
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Login
            </Link>

            <Link
              to="/register" // ✅ FIXED
              className="px-4 py-2 bg-black text-white rounded hover:opacity-90"
            >
              Register
            </Link>
          </>
        ) : (
          <div className="relative">

            <div
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <span className="font-medium">{user.name}</span>
            </div>

            {open && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg overflow-hidden border z-50">

                <div className="px-4 py-3 border-b">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                <button
                  onClick={() => navigate("/admin/dashboard")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                >
                  Logout
                </button>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}


// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAdminAuth } from "../../contexts/AdminAuthContext";
// import { Search, Bell, Menu, ChevronDown, LogOut, User, Settings } from "lucide-react";

// export default function Navbar({ toggleSidebar }) {
//   const { user, logout } = useAdminAuth();
//   const navigate = useNavigate();
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   return (
//     <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
//       {/* Left */}
//       <div className="flex items-center gap-4">
//         <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
//           <Menu size={20} className="text-gray-600" />
//         </button>

//         <div className="relative hidden sm:block">
//           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search anything..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-9 pr-4 py-2 w-72 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//           />
//         </div>
//       </div>

//       {/* Right */}
//       <div className="flex items-center gap-3">
//         {/* Notifications */}
//         <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
//           <Bell size={19} className="text-gray-600" />
//           <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
//         </button>

//         {/* User Menu */}
//         <div className="relative">
//           <button
//             onClick={() => setDropdownOpen(!dropdownOpen)}
//             className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
//           >
//             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold">
//               {user?.name?.charAt(0).toUpperCase() || "A"}
//             </div>
//             <div className="hidden md:block text-left">
//               <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name || "Admin"}</p>
//               <p className="text-[10px] text-gray-400 capitalize">{user?.role || "admin"}</p>
//             </div>
//             <ChevronDown size={14} className="text-gray-400" />
//           </button>

//           {dropdownOpen && (
//             <>
//               <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
//               <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-scaleIn origin-top-right overflow-hidden">
//                 <div className="p-4 border-b border-gray-100">
//                   <p className="font-semibold text-gray-800">{user?.name}</p>
//                   <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
//                 </div>
//                 <div className="py-1">
//                   <button onClick={() => { setDropdownOpen(false); navigate("/admin/settings"); }}
//                     className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
//                     <Settings size={16} /> Settings
//                   </button>
//                   <button onClick={() => { logout(); navigate("/login"); }}
//                     className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
//                     <LogOut size={16} /> Logout
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
