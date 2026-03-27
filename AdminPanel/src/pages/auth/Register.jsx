import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { UserPlus, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function Register() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    role: "admin",
    adminSecretId: ""
  });

  const [showPw, setShowPw] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-orange-50 p-6">

      <div className="w-full max-w-md">

        <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-8">

          <h2 className="text-2xl font-bold text-gray-800">
            Create Admin Account 🚀
          </h2>

          <p className="text-gray-400 mt-1 mb-6">
            Register to manage your LMS platform
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="text-sm text-gray-600 font-medium">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
                className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-600 font-medium">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
                className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="text-sm text-gray-600 font-medium">
                Mobile
              </label>
              <input
                type="text"
                value={form.mobile}
                onChange={(e) =>
                  setForm({ ...form, mobile: e.target.value })
                }
                required
                className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              />
            </div>

            {/* Admin Secret ID */}
            <div>
              <label className="text-sm text-gray-600 font-medium flex items-center gap-2">
                <ShieldCheck size={16} className="text-orange-500" />
                Admin Secret ID
              </label>

              <div className="relative mt-1">
                <input
                  type={showSecret ? "text" : "password"}
                  value={form.adminSecretId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      adminSecretId: e.target.value,
                    })
                  }
                  placeholder="Enter Admin Secret ID"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-orange-200 pr-11"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowSecret(!showSecret)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showSecret ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-1">
                This secret ID is required to register as an admin.
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-600 font-medium">
                Password
              </label>

              <div className="relative mt-1">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-200 pr-11"
                />

                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPw ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  Register Admin
                </>
              )}
            </button>

          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 font-medium hover:underline"
            >
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}