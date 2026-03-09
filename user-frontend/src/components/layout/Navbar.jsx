import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-indigo-600 z-[60]"
        style={{ width: "100%" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrolled ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* NAVBAR */}

      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className={`fixed w-full z-50 transition-all duration-100 ${
          scrolled
            ? "backdrop-blur-lg bg-white/70 shadow-md py-3"
            : "bg-gradient-to-b from-white to-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* LOGO */}

          <motion.div
            whileHover={{ scale: 1.04 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/images/hk_logo.png"
              alt="HK International"
              className="h-16 w-auto object-contain"
            />

            <span className="hidden sm:block font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-orange-500">
              HK International
            </span>
          </motion.div>

          {/* DESKTOP MENU */}

          <ul className="hidden md:flex gap-10 items-center font-medium">
            {/* HOME */}
            <li className="relative group">
              <Link
                to="/"
                className="text-gray-800 hover:text-orange-600 transition"
              >
                Home
              </Link>
            </li>

            {/* COURSES */}

            <li
              className="relative"
              onMouseEnter={() => setCoursesOpen(true)}
              onMouseLeave={() => setCoursesOpen(false)}
            >
              <button
                onClick={() => navigate("/courses")}
                className="text-gray-800 hover:text-orange-600 transition flex items-center gap-1"
              >
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

              {/* DROPDOWN */}

              <AnimatePresence>
                {coursesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-10 left-0 bg-white shadow-xl border rounded-xl p-4 w-64"
                  >
                    <Link
                      to="/course/1"
                      className="block px-3 py-2 hover:bg-gray-100 rounded"
                    >
                      IOSH Managing Safely
                    </Link>

                    <Link
                      to="/course/2"
                      className="block px-3 py-2 hover:bg-gray-100 rounded"
                    >
                      Display Screen Equipment
                    </Link>

                    <Link
                      to="/course/3"
                      className="block px-3 py-2 hover:bg-gray-100 rounded"
                    >
                      Workstation Risk Assessment
                    </Link>

                    <Link
                      to="/courses"
                      className="block px-3 py-2 text-blue-600 hover:bg-gray-100 rounded"
                    >
                      View All Courses →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>

            {/* ABOUT */}

            <li>
              <Link
                to="/about"
                className="text-gray-800 hover:text-orange-600 transition"
              >
                About
              </Link>
            </li>

            {/* CONTACT */}

            <li>
              <Link
                to="/contact"
                className="text-gray-800 hover:text-orange-600 transition"
              >
                Contact
              </Link>
            </li>

            {/* LOGIN */}

            <li>
              <Link
                to="/login"
                className="text-gray-700 hover:text-orange-600 transition"
              >
                Login
              </Link>
            </li>

            {/* CTA BUTTON */}

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg shadow-lg overflow-hidden transition-all hover:rounded-3xl"
              >
                <span className="relative z-10">Start Learning</span>
              </Link>
            </motion.div>
          </ul>

          {/* MOBILE ICON */}

          <div
            className="md:hidden text-3xl cursor-pointer text-gray-800"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </div>
        </div>

        {/* MOBILE MENU */}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/95 backdrop-blur-lg shadow-xl py-6 px-6"
            >
              <ul className="flex flex-col gap-6 font-medium text-lg">
                <li>
                  <Link to="/" onClick={() => setIsOpen(false)}>
                    Home
                  </Link>
                </li>

                <li>
                  <Link to="/courses" onClick={() => setIsOpen(false)}>
                    Courses
                  </Link>
                </li>

                <li>
                  <Link to="/about" onClick={() => setIsOpen(false)}>
                    About
                  </Link>
                </li>

                <li>
                  <Link to="/contact" onClick={() => setIsOpen(false)}>
                    Contact
                  </Link>
                </li>

                <li>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                </li>

                <motion.div whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="bg-orange-600 text-white px-5 py-2 rounded-lg w-full text-center block shadow-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Start Learning
                  </Link>
                </motion.div>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
