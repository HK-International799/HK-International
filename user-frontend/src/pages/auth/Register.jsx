import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { FaGoogle, FaLinkedin } from "react-icons/fa";
import MainLayout from "../../components/layout/MainLayout";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <MainLayout>
      <div className="relative min-h-screen flex items-center justify-center bg-gray-50 p-6 overflow-hidden">
        {/* Animated Background Blobs */}

        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-400 opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-32 w-[450px] h-[450px] bg-orange-400 opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-purple-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>

        {/* Card */}

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-lg backdrop-blur-xl bg-white/80 border border-white/40 shadow-2xl rounded-2xl p-8"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Create your account
          </h2>

          <p className="text-gray-500 text-center mt-2">
            Start learning globally accredited courses
          </p>

          {/* FORM */}

          <form className="space-y-6 mt-8">
            {/* Name */}

            <div className="relative">
              <input
                type="text"
                placeholder=" "
                className="peer w-full border rounded-lg px-4 pt-5 pb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all">
                Full Name
              </label>
            </div>

            {/* Email */}

            <div className="relative">
              <input
                type="email"
                placeholder=" "
                className="peer w-full border rounded-lg px-4 pt-5 pb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all">
                Email Address
              </label>
            </div>

            {/* Phone */}

            <div className="relative">
              <input
                type="text"
                placeholder=" "
                className="peer w-full border rounded-lg px-4 pt-5 pb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all">
                Phone Number
              </label>
            </div>

            {/* Password */}

            <div className="relative">
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

              {/* Password Strength */}

              <div className="flex gap-1 mt-2">
                <div className="h-1 w-1/3 bg-red-400 rounded"></div>
                <div className="h-1 w-1/3 bg-yellow-400 rounded"></div>
                <div className="h-1 w-1/3 bg-green-400 rounded"></div>
              </div>
            </div>

            {/* Confirm Password */}

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder=" "
                className="peer w-full border rounded-lg px-4 pt-5 pb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all">
                Confirm Password
              </label>

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-indigo-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Country */}

            <select className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none">
              <option>Select Country</option>
              <option>India</option>
              <option>UK</option>
              <option>USA</option>
              <option>UAE</option>
            </select>

            {/* CTA */}

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative w-full bg-gradient-to-r from-indigo-600 to-orange-500 text-white py-3 rounded-lg font-semibold shadow-lg overflow-hidden"
            >
              <span className="relative z-10">Create Account</span>

              <span className="absolute inset-0 bg-white opacity-10 blur-xl animate-pulse"></span>
            </motion.button>
          </form>

          {/* Divider */}

          {/* <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-400 text-sm">or continue with</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div> */}

          {/* Social Login */}

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

          {/* Login Link */}

          <p className="text-center text-sm text-gray-500 mt-7">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </MainLayout>
  );
}
