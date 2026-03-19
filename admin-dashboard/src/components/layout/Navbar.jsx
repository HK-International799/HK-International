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