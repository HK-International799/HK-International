import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-white/70 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/images/hk_logo.png"
            alt="HK International"
            className="h-10 w-auto"
          />

          <span className="text-xl font-bold text-gray-900">
            HK International
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">

          <Link to="/" className="hover:text-amber-500 transition">
            Home
          </Link>

          {/* Courses Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCoursesOpen(true)}
            onMouseLeave={() => setCoursesOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-amber-500 transition">
              Courses
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {coursesOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-10 left-0 bg-white shadow-xl border rounded-xl p-4 w-64"
              >
                <Link
                  to="/courses/iosh"
                  className="block px-3 py-2 hover:bg-gray-100 rounded"
                >
                  IOSH Certifications
                </Link>

                <Link
                  to="/courses/nebosh"
                  className="block px-3 py-2 hover:bg-gray-100 rounded"
                >
                  NEBOSH Programs
                </Link>

                <Link
                  to="/courses/iso"
                  className="block px-3 py-2 hover:bg-gray-100 rounded"
                >
                  ISO Lead Auditor
                </Link>

                <Link
                  to="/courses/osha"
                  className="block px-3 py-2 hover:bg-gray-100 rounded"
                >
                  OSHA Training
                </Link>
              </motion.div>
            )}
          </div>

          <Link to="/about" className="hover:text-amber-500 transition">
            About
          </Link>

          <Link to="/contact" className="hover:text-amber-500 transition">
            Contact
          </Link>

          {/* LMS Buttons */}
          <div className="flex items-center gap-3 ml-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-amber-500 transition"
            >
              Login
            </Link>

            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/register"
                className="bg-amber-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-amber-600 transition"
              >
                Start Learning
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden bg-white border-t px-6 pb-6"
        >
          <div className="flex flex-col gap-4 pt-4">

            <Link to="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>

            <Link to="/courses" onClick={() => setMenuOpen(false)}>
              Courses
            </Link>

            <Link to="/about" onClick={() => setMenuOpen(false)}>
              About
            </Link>

            <Link to="/contact" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>

            <Link
              to="/login"
              className="border rounded-lg py-2 text-center"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-amber-500 text-white py-2 rounded-lg text-center"
            >
              Start Learning
            </Link>
          </div>
        </motion.div>
      )}

    </nav>
  );
}