import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import api from "../../services/api";
import { LogIn, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data: res } = await api.post("/auth/login", { email, password });
      const payload = res.data || res;
      if (!payload.token) throw new Error("Invalid response");
      if (!["admin", "super_admin"].includes(payload.user?.role)) {
        setError("Access denied. Admin credentials required.");
        setLoading(false);
        return;
      }
      login(payload);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-white to-orange-50">
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-orange-500">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-white max-w-md p-10">
          <h1 className="text-4xl font-bold mb-4">LMS Admin Panel</h1>
          <p className="text-white/80 leading-relaxed">Manage courses, students, partner institutes, registrations and certificates with a powerful learning management system.</p>
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3"><ShieldCheck className="text-orange-300" /><span className="text-white/80">Secure Role-Based Access</span></div>
            <div className="flex items-center gap-3"><Sparkles className="text-orange-300" /><span className="text-white/80">Partner Institute & AO Portals</span></div>
            <div className="flex items-center gap-3"><ShieldCheck className="text-orange-300" /><span className="text-white/80">Orientation, Quiz & Certificate Pipeline</span></div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-400 mt-1 mb-6">Sign in to LMS Admin Dashboard</p>
            {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm text-gray-600 font-medium">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition" />
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Password</label>
                <div className="relative mt-1">
                  <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 pr-11" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LogIn size={18} /> Sign In</>}
              </button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-6">Don't have an account?{" "}<Link to="/register" className="text-indigo-600 font-medium hover:underline">Register</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
