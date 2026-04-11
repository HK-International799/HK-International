import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/student/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="relative min-h-screen grid lg:grid-cols-2 overflow-hidden bg-gray-50">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-400 opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-orange-400 opacity-30 rounded-full blur-3xl animate-pulse"></div>

        <div className="hidden lg:flex relative flex-col justify-center items-center bg-gradient-to-br from-indigo-800 via-blue-700 to-indigo-900 text-white p-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white,_transparent_60%)]"></div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-lg text-center"
          >
            <h1 className="text-5xl font-bold leading-tight">
              Welcome Back to <br />1A HK International
            </h1>
            <p className="mt-6 text-lg opacity-90">
              Access globally recognized safety certifications and advance your
              professional career with our internationally accredited programs.
            </p>
            <div className="mt-12 grid grid-cols-2 gap-8 text-left">
              <div><h3 className="text-3xl font-bold text-orange-400">10K+</h3><p className="text-sm opacity-80">Students trained globally</p></div>
              <div><h3 className="text-3xl font-bold text-orange-400">40+</h3><p className="text-sm opacity-80">Countries served</p></div>
              <div><h3 className="text-3xl font-bold text-orange-400">20+</h3><p className="text-sm opacity-80">Professional courses</p></div>
              <div><h3 className="text-3xl font-bold text-orange-400">98%</h3><p className="text-sm opacity-80">Success rate</p></div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md backdrop-blur-xl bg-white/80 shadow-2xl border border-white/40 rounded-2xl p-8"
          >
            <h2 className="text-3xl font-bold text-gray-800">Login to your account</h2>
            <p className="text-gray-500 mt-2">Access your courses and certifications</p>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="relative group">
                <input
                  type="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="peer w-full border rounded-lg px-4 pt-5 pb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <label className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all">
                  Email address
                </label>
              </div>

              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="peer w-full border rounded-lg px-4 pt-5 pb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <label className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" /> Remember me
                </label>
                <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Forgot Password?
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.03 }}
                whileTap={{ scale: loading ? 1 : 0.96 }}
                className="relative w-full bg-gradient-to-r from-indigo-600 to-orange-500 text-white py-3 rounded-lg font-semibold shadow-lg overflow-hidden group disabled:opacity-60"
              >
                <span className="relative z-10">{loading ? "Logging in..." : "Login"}</span>
                <span className="absolute inset-0 bg-white opacity-10 blur-xl group-hover:opacity-20 transition"></span>
              </motion.button>
            </form>

            {/* <p className="text-center text-sm text-gray-500 mt-7">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Create account
              </Link>
            </p> */}
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}