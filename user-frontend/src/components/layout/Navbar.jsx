import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setIsOpen(false);
    navigate("/");
  };

  const courseMenu = [
    {
      title: "IOSH UK",
      courses: [
        { name: "IOSH Managing Safely", id: "iosh-managing-safely" },
        { name: "IOSH Level 3 Certificate", id: "iosh-level3" },
      ],
    },
    {
      title: "OTHM UK",
      courses: [
        { name: "Level 4 IQA Award", id: "othm-iqa-award" },
        { name: "Level 4 IQA Certificate", id: "othm-iqa-certificate" },
        { name: "Level 5 Diploma in Law", id: "othm-level5-law" },
        { name: "Level 6 Diploma in OHS", id: "othm-level6" },
        { name: "Level 7 Diploma in OHS Management", id: "othm-level7-ohs" },
        { name: "Level 7 Diploma in Risk Management", id: "othm-level7-risk" },
        {
          name: "Level 7 Diploma in Environmental Management",
          id: "othm-level7-environment",
        },
      ],
    },
    {
      title: "PECB (Canada)",
      courses: [
        { name: "ISO 45001 Lead Auditor Certificate", id: "iso-45001-auditor" },
        { name: "ISO 9001 Lead Auditor Certificate", id: "iso-9001-auditor" },
      ],
    },
    {
      title: "CIEH UK",
      courses: [
        { name: "Level 1 Food Safety", id: "cieh-level1-food" },
        { name: "Level 2 Food Safety", id: "cieh-level2-food" },
        { name: "Level 3 Food Safety", id: "cieh-level3-food" },
        { name: "Level 2 First Aid at Work", id: "cieh-level2-firstaid" },
        { name: "Level 3 First Aid at Work", id: "cieh-level3-firstaid" },
      ],
    },
    {
      title: "OSHA USA",
      courses: [
        {
          name: "OSHA 30 Hour Construction Certificate (PECB Certified-Canada)",
          id: "osha-construction",
        },
        {
          name: "OSHA 30 Hour General Industry Certificate",
          id: "osha-general",
        },
      ],
    },
    {
      title: "European Safety Council",
      courses: [
        {
          name: "European Safety council Level 6 Diploma in IDHSE (OPQUAL-UK)",
          id: "esc-l6-d-idhse",
        },
        {
          name: "European Safety Council Level 7 Diploma in OSH (OFQUAL-UK)",
          id: "esc-l7-d-osh",
        },
        {
          name: "European Safety Council Level 7 Diploma in PSM (OFQUAL-UK)",
          id: "esc-l7-d-psm",
        },
      ],
    },
    {
      title: "BCRSP Canada",
      courses: [{ name: "", id: "crsp-certification" }],
    },
    {
      title: "EOSH UK",
      courses: [
        {
          name: "EOSH Train The Trainer Certificate",
          id: "eosh-train-the-trainer",
        },
      ],
    },
    {
      title: "HSE Training Courses",
      courses: [
        { name: "SHE/HSE Plan Training", id: "she-hse-plan-training" },
        { name: "Behaviour-Based Safety (BBS) Training", id: "bbs-training" },
        { name: "Confined Space Safety Training", id: "confined-space-safety" },
        { name: "Permit to Work Training", id: "permit-to-work" },
        { name: "E-Waste Management Training", id: "e-waste-management" },
      ],
    },
  ];

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
              alt="1A HK International"
              className="h-16 w-auto object-contain"
            />
            <span className="hidden sm:block font-bold text-lg text-transparent bg-clip-text bg-linear-to-r from-indigo-700 to-orange-500">
              1A HK International
            </span>
          </motion.div>

          {/* DESKTOP MENU */}
          <ul className="hidden md:flex gap-10 items-center font-medium">
            <li>
              <Link
                to="/"
                className="text-gray-800 hover:font-bold hover:text-transparent bg-clip-text hover:bg-linear-to-r from-indigo-700 to-orange-500 transition"
              >
                Home
              </Link>
            </li>

            {/* COURSES DROPDOWN */}
            <li
              className="relative"
              onMouseEnter={() => setCoursesOpen(true)}
              onMouseLeave={() => {
                setCoursesOpen(false);
                setActiveCategory(null);
              }}
            >
              <button
                onClick={() => navigate("/courses")}
                className="text-gray-800 hover:font-bold hover:text-transparent bg-clip-text hover:bg-linear-to-r from-indigo-700 to-orange-500 flex items-center gap-1"
              >
                Courses
              </button>
              <AnimatePresence>
                {coursesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-10 left-0 bg-white shadow-xl border rounded-xl w-64"
                  >
                    {courseMenu.map((category, i) => (
                      <div
                        key={i}
                        className="relative"
                        onMouseEnter={() => setActiveCategory(i)}
                      >
                        <div className="flex justify-between items-center px-4 py-2 hover:bg-orange-200 cursor-pointer rounded-xl">
                          <span className="text-gray-700 text-sm">
                            {category.title}
                          </span>
                        </div>
                        {activeCategory === i && (
                          <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="absolute top-0 left-full ml-1 bg-orange-200 shadow-xl border rounded-xl w-64"
                          >
                            {category.courses.map((course, j) => (
                              <Link
                                key={j}
                                to={`/course/${course.id}`}
                                className="block px-4 py-2 text-sm text-gray-900 hover:bg-white hover:font-bold hover:text-transparent bg-clip-text hover:bg-linear-to-r from-indigo-700 to-orange-500 rounded-xl"
                              >
                                {course.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>

            <li>
              <Link
                to="/about"
                className="text-gray-800 hover:font-bold hover:text-transparent bg-clip-text hover:bg-linear-to-r from-indigo-700 to-orange-500 transition"
              >
                About
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                className="text-gray-800 hover:font-bold hover:text-transparent bg-clip-text hover:bg-linear-to-r from-indigo-700 to-orange-500 transition"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/payment"
                className="text-gray-800 hover:font-bold hover:text-transparent bg-clip-text hover:bg-linear-to-r from-indigo-700 to-orange-500 transition"
              >
                Payments
              </Link>
            </li>

            {/* AUTH SECTION */}
            {!loading &&
              (isAuthenticated ? (
                /* PROFILE DROPDOWN */
                <li className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 text-gray-800 hover:font-bold hover:text-transparent bg-clip-text hover:bg-linear-to-r from-indigo-700 to-orange-500 transition"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.data.avatar}
                        alt={user.data.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-orange-400"
                      />
                    ) : (
                      <FaUserCircle className="text-2xl text-indigo-600" />
                    )}
                    <span className="text-sm font-semibold max-w-[100px] truncate">
                      {user?.data?.name?.split(" ")[0] || "Profile"}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                      >
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ) : (
                /* NOT LOGGED IN */
                <>
                  <li>
                    <Link
                      to="/login"
                      className="text-gray-700 hover:font-bold hover:text-transparent bg-clip-text hover:bg-linear-to-r from-indigo-700 to-orange-500 transition"
                    >
                      Login
                    </Link>
                  </li>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/login"
                      className="relative bg-gradient-to-r from-orange-500 hover:from-indigo-700 to-orange-600 text-white px-6 py-2 rounded-lg shadow-lg overflow-hidden transition-all hover:rounded-3xl"
                    >
                      <span className="relative z-10">Start Learning</span>
                    </Link>
                  </motion.div>
                </>
              ))}
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

                {!loading &&
                  (isAuthenticated ? (
                    <>
                      <li className="border-t pt-4">
                        <p className="text-sm text-gray-400 mb-3">
                          {user?.data?.name || "Account"}
                        </p>
                        <div className="flex flex-col gap-3">
                          <Link
                            to="/student/profile"
                            onClick={() => setIsOpen(false)}
                            className="text-gray-700 hover:font-bold hover:text-transparent bg-clip-text hover:bg-linear-to-r from-indigo-700 to-orange-500"
                          >
                            My Profile
                          </Link>
                          <Link
                            to="/student/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="text-gray-700 hover:font-bold hover:text-transparent bg-clip-text hover:bg-linear-to-r from-indigo-700 to-orange-500"
                          >
                            Dashboard
                          </Link>
                          <Link
                            to="/student/courses"
                            onClick={() => setIsOpen(false)}
                            className="text-gray-700 hover:font-bold hover:text-transparent bg-clip-text hover:bg-linear-to-r from-indigo-700 to-orange-500"
                          >
                            My Courses
                          </Link>
                          <Link
                            to="/student/change-password"
                            onClick={() => setIsOpen(false)}
                            className="text-gray-700 hover:font-bold hover:text-transparent bg-clip-text hover:bg-linear-to-r from-indigo-700 to-orange-500"
                          >
                            Update Password
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="text-left text-red-500 hover:text-red-600"
                          >
                            Logout
                          </button>
                        </div>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link to="/login" onClick={() => setIsOpen(false)}>
                          Login
                        </Link>
                      </li>
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Link
                          to="/login"
                          className="bg-orange-600 text-white px-5 py-2 rounded-lg w-full text-center block shadow-md"
                          onClick={() => setIsOpen(false)}
                        >
                          Start Learning
                        </Link>
                      </motion.div>
                    </>
                  ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
