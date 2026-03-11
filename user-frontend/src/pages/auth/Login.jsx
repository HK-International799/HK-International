import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FaGoogle, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <MainLayout>
      <div className="relative min-h-screen grid lg:grid-cols-2 overflow-hidden bg-gray-50">
        {/* BACKGROUND BLOBS */}

        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-400 opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-orange-400 opacity-30 rounded-full blur-3xl animate-pulse"></div>

        {/* LEFT SECTION */}

        <div className="hidden lg:flex relative flex-col justify-center items-center bg-gradient-to-br from-indigo-800 via-blue-700 to-indigo-900 text-white p-16 overflow-hidden">
          {/* subtle overlay pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white,_transparent_60%)]"></div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-lg text-center"
          >
            <h1 className="text-5xl font-bold leading-tight">
              Welcome Back to <br /> HK International
            </h1>

            <p className="mt-6 text-lg opacity-90">
              Access globally recognized safety certifications and advance your
              professional career with our internationally accredited programs.
            </p>

            {/* STATS */}

            <div className="mt-12 grid grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-3xl font-bold text-orange-400">10K+</h3>
                <p className="text-sm opacity-80">Students trained globally</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-orange-400">40+</h3>
                <p className="text-sm opacity-80">Countries served</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-orange-400">20+</h3>
                <p className="text-sm opacity-80">Professional courses</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-orange-400">98%</h3>
                <p className="text-sm opacity-80">Success rate</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT LOGIN SECTION */}

        <div className="flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md backdrop-blur-xl bg-white/80 shadow-2xl border border-white/40 rounded-2xl p-8"
          >
            <h2 className="text-3xl font-bold text-gray-800">
              Login to your account
            </h2>

            <p className="text-gray-500 mt-2">
              Access your courses and certifications
            </p>

            {/* FORM */}

            <form className="mt-8 space-y-6">
              {/* EMAIL */}

              <div className="relative group">
                <input
                  type="email"
                  placeholder=" "
                  className="peer w-full border rounded-lg px-4 pt-5 pb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <label className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all">
                  Email address
                </label>
              </div>

              {/* PASSWORD */}

              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
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

              {/* OPTIONS */}

              <div className="flex justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" />
                  Remember me
                </label>

                <Link
                  to="/forgot-password"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* LOGIN BUTTON */}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="relative w-full bg-gradient-to-r from-indigo-600 to-orange-500 text-white py-3 rounded-lg font-semibold shadow-lg overflow-hidden group"
              >
                <span className="relative z-10">Login</span>

                <span className="absolute inset-0 bg-white opacity-10 blur-xl group-hover:opacity-20 transition"></span>
              </motion.button>
            </form>

            {/* DIVIDER */}

            {/* <div className="flex items-center gap-3 my-7">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-400 text-sm">
                or continue with
              </span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div> */}

            {/* SOCIAL LOGIN */}

            {/* <div className="grid grid-cols-2 gap-4">

              <button className="flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-100 hover:shadow transition">
                <FaGoogle className="text-red-500" />
                Google
              </button>

              <button className="flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-100 hover:shadow transition">
                <FaLinkedin className="text-blue-600" />
                LinkedIn
              </button>

            </div> */}

            {/* REGISTER */}

            <p className="text-center text-sm text-gray-500 mt-7">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Create account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
