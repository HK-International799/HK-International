import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);

  const profileRef = useRef(null);
  const dropdownRef = useRef(null);
  const coursesButtonRef = useRef(null);
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        coursesButtonRef.current &&
        !coursesButtonRef.current.contains(e.target)
      ) {
        setCoursesOpen(false);
        setSelectedCategory(null);
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
          id: "osha-30-hours-general-industry-certificate",
        },
      ],
    },
    {
      title: "European Safety Council",
      courses: [
        {
          name: "European Safety Council Level 6 Diploma in IDHSE (OPQUAL-UK)",
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
      courses: [{ name: "CRSP Certification", id: "crsp-certification" }],
    },
    {
      title: "CSP Exam Preparation",
      courses: [
        {
          name: "CSP Exam Preparation",
          id: "certified-safety-professional-csp-exam-preparation",
        },
      ],
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
    {
      title: "Quality & Auditing",
      courses: [
        {
          name: "HSE Internal Audit and Compliance Review Training",
          id: "hse-internal-audit-compliance-review-training",
        },
        {
          name: "Workplace Inspection and Audit Reporting Training",
          id: "workplace-inspection-audit-reporting-training",
        },
        {
          name: "Occupational Health and Safety Risk Management and Audit Readiness",
          id: "occupational-health-safety-risk-management-audit-readiness",
        },
        {
          name: "HSE Plan and Documentation Review",
          id: "hse-plan-documentation-review-training",
        },
        {
          name: "Incident Investigation, Corrective Action and Audit Follow-up Training",
          id: "incident-investigation-corrective-action-audit-follow-up-training",
        },
        {
          name: "Contractor HSE Audit and Performance Monitoring",
          id: "contractor-hse-audit-performance-monitoring",
        },
        {
          name: "HSE Management System Review and Internal Audit Awareness",
          id: "hse-management-system-review-internal-audit-awareness",
        },
        {
          name: "HSE Quality Assurance and Continuous Improvement Training",
          id: "hse-quality-assurance-continuous-improvement-training",
        },
        {
          name: "Permit-to-Work Compliance and Auditing",
          id: "permit-to-work-compliance-auditing-training",
        },
        {
          name: "Risk Assessment Review and Control Verification Training",
          id: "risk-assessment-review-control-verification-training",
        },
      ],
    },
    {
      title: "Project Management",
      courses: [
        {
          name: "Foundation in Project Management",
          id: "foundation-in-project-management",
        },
        {
          name: "Essential Skills in Project Management",
          id: "essential-skills-in-project-management",
        },
      ],
    },
  ];

  const handleCategoryClick = (index) => {
    // Toggle: clicking the same category again collapses the panel
    setSelectedCategory((prev) => (prev === index ? null : index));
  };

  const navLinkClass = ({ isActive }) =>
    `relative text-[15px] font-semibold transition-all duration-300
   ${
     isActive
       ? "bg-gradient-to-r from-indigo-600 to-orange-500 bg-clip-text text-transparent"
       : "text-slate-700 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-orange-500 hover:bg-clip-text hover:text-transparent"
   }
   after:absolute after:left-1/2 after:-bottom-1
   after:h-[2px] after:w-0
   after:bg-gradient-to-r after:from-indigo-600 after:to-orange-500
   after:transition-all after:duration-300
   after:-translate-x-1/2
   hover:after:w-full
   ${isActive ? "after:w-full" : ""}
  `;

  const activeCourses =
    selectedCategory !== null
      ? courseMenu[selectedCategory].courses.filter((c) => c.name)
      : [];

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-indigo-600 z-[60]"
        style={{ width: "100%" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrolled ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        aria-hidden="true"
      />

      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        aria-label="Main navigation"
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
            role="link"
            tabIndex={0}
            aria-label="1A HK International - Home"
            title="1A HK International - Go to homepage"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/");
              }
            }}
          >
            <img
              src="/images/hk_logo.png"
              alt="1A HK International - Accredited Health & Safety Training Provider"
              className="h-16 w-auto object-contain"
              width="64"
              height="64"
            />
            <span className="hidden sm:block font-bold text-lg text-transparent bg-clip-text bg-linear-to-r from-indigo-700 to-orange-500">
              1A HK International
            </span>
          </motion.div>

          {/* DESKTOP MENU */}
          <ul className="hidden md:flex items-center gap-8 lg:gap-10">
            <motion.li whileHover={{ y: -4 }}>
              <NavLink
                to="/"
                title="Home - 1A HK International"
                aria-label="Go to Home page"
                className={navLinkClass}
              >
                Home
              </NavLink>
            </motion.li>

            {/* ── COURSES MEGA MENU ── */}
            <li className="relative" onMouseEnter={() => setCoursesOpen(true)}>
              <button
                ref={coursesButtonRef}
                onClick={() => {
                  setCoursesOpen((prev) => !prev);
                  navigate("/courses");
                }}
                title="Browse all accredited HSE courses"
                aria-label="Toggle courses menu"
                aria-haspopup="true"
                aria-expanded={coursesOpen}
                className={`group relative flex items-center gap-2 px-1 py-2 text-[15px] font-semibold transition-all duration-300 cursor-pointer
${coursesOpen ? "scale-105" : "hover:scale-105"}`}
              >
                <span
                  className={`relative transition-all duration-300 ${
                    coursesOpen
                      ? "bg-gradient-to-r from-indigo-600 to-orange-500 bg-clip-text text-transparent"
                      : "text-slate-700 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-orange-500 group-hover:bg-clip-text group-hover:text-transparent"
                  }`}
                >
                  Courses
                  {/* Animated Underline */}
                  <span
                    className={`absolute left-1/2 -bottom-1 h-[2px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-orange-500 transition-all duration-300 ${
                      coursesOpen ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </span>

                {/* Chevron */}
                <svg
                  className={`w-4 h-4 transition-all duration-300 ${
                    coursesOpen
                      ? "rotate-180 text-orange-500"
                      : "text-slate-400 group-hover:text-indigo-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* ── MEGA DROPDOWN ── */}
              <AnimatePresence>
                {coursesOpen && (
                  <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    role="dialog"
                    aria-label="Course categories"
                    className="fixed left-20 right-20 bg-white border-t-2 border-indigo-600 shadow-2xl z-50 rounded-2xl"
                    style={{ top: scrolled ? "80px" : "88px" }}
                  >
                    <div className="max-w-7xl mx-auto px-6 py-4">
                      {/* 3-column category grid */}
                      <div className="grid grid-cols-3 gap-2 pb-2">
                        {courseMenu.map((category, i) => {
                          const count = category.courses.filter(
                            (c) => c.name,
                          ).length;
                          const isSelected = selectedCategory === i;
                          return (
                            <button
                              key={i}
                              onClick={() => handleCategoryClick(i)}
                              aria-expanded={isSelected}
                              className={`group flex items-center justify-between gap-3 px-4 py-1 rounded-xl border text-left transition-all duration-150 ${
                                isSelected
                                  ? "border-indigo-400 bg-indigo-50 shadow-sm"
                                  : "border-gray-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/50"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Accent stripe */}
                                <div
                                  className={`w-1 h-6 rounded-full flex-shrink-0 transition-colors ${
                                    isSelected
                                      ? "bg-indigo-500"
                                      : "bg-gray-200 group-hover:bg-indigo-300"
                                  }`}
                                />
                                <span
                                  className={`leading-snug truncate transition-colors ${
                                    isSelected
                                      ? "text-indigo-700 font-semibold text-  "
                                      : "text-gray-700 group-hover:text-indigo-700 font-medium text-sm"
                                  }`}
                                >
                                  {category.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span
                                  className={`text-xs rounded-full px-2 py-0.5 font-medium transition-colors ${
                                    isSelected
                                      ? "bg-indigo-200 text-indigo-700"
                                      : "bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                                  }`}
                                >
                                  {count}
                                </span>
                                <svg
                                  className={`w-3.5 h-3.5 transition-all duration-200 ${
                                    isSelected
                                      ? "rotate-180 text-indigo-500"
                                      : "text-gray-300 group-hover:text-indigo-400"
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <hr />

                      {/* Course reveal panel — slides in below the grid */}
                      <AnimatePresence>
                        {selectedCategory !== null && (
                          <motion.div
                            key={selectedCategory}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className="overflow-hidden "
                          >
                            <div className="m-1 border-t border-gray-100 ">
                              {/* Panel header */}
                              <div className="flex items-center justify-between mb-3 ">
                                <div className="flex items-center gap-3 ">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {courseMenu[selectedCategory].title}
                                  </span>
                                  <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-0.5 rounded-full border border-indigo-100">
                                    {activeCourses.length} course
                                    {activeCourses.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <button
                                  onClick={() => setSelectedCategory(null)}
                                  aria-label="Close courses panel"
                                  className="text-xs text-gray-600 hover:text-orange-600 flex items-center gap-1 transition-colors "
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                  Close
                                </button>
                              </div>

                              {/* Courses in 4-column grid */}
                              <div className="grid grid-cols-4 gap-2 pb-2 ">
                                {activeCourses.map((course, j) => (
                                  <Link
                                    key={j}
                                    to={`/course/${course.id}`}
                                    title={`View ${course.name} course details`}
                                    aria-label={`View ${course.name} course`}
                                    onClick={() => {
                                      setCoursesOpen(false);
                                      setSelectedCategory(null);
                                    }}
                                    className="group flex items-start gap-2.5 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-all duration-120 "
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 group-hover:bg-indigo-500 flex-shrink-0 mt-1.5 transition-colors " />
                                    <span className="text-sm text-gray-600 group-hover:text-indigo-700 leading-snug transition-colors">
                                      {course.name}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-300 bg-gray-50 px-6 py-2 flex items-center justify-between rounded-2xl">
                      <p className="text-xs text-gray-500">
                        {selectedCategory === null
                          ? "Click any category to explore its courses"
                          : `Showing courses for ${courseMenu[selectedCategory].title}`}
                      </p>
                      <button
                        onClick={() => {
                          navigate("/courses");
                          setCoursesOpen(false);
                          setSelectedCategory(null);
                        }}
                        className="text-xs font-medium text-indigo-600 hover:text-orange-600 bg-white hover:bg-indigo-100 border border-indigo-300 px-4 py-1.5 rounded-md transition-colors hover:cursor-pointer"
                      >
                        View all courses →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
            {/* ── END COURSES MEGA MENU ── */}

            <motion.li whileHover={{ y: -4 }}>
              <NavLink
                to="/blog"
                title="Read HSE Blogs & Safety Insights"
                aria-label="Blog"
                className={navLinkClass}
              >
                Blog
              </NavLink>
            </motion.li>

            <motion.li whileHover={{ y: -4 }}>
              <NavLink
                to="/about"
                title="About 1A HK International"
                aria-label="About"
                className={navLinkClass}
              >
                About
              </NavLink>
            </motion.li>

            <motion.li whileHover={{ y: -4 }}>
              <NavLink
                to="/contact"
                title="Contact 1A HK International"
                aria-label="Contact"
                className={navLinkClass}
              >
                Contact
              </NavLink>
            </motion.li>

            <motion.li whileHover={{ y: -4 }}>
              <NavLink
                to="/payment"
                title="Course Payments"
                aria-label="Payments"
                className={navLinkClass}
              >
                Payments
              </NavLink>
            </motion.li>

            {/* AUTH SECTION */}
            {!loading &&
              (isAuthenticated ? (
                <li className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    aria-label="Open user profile menu"
                    aria-haspopup="true"
                    aria-expanded={profileOpen}
                    title="Your account"
                    className="flex items-center gap-2 text-gray-800 hover:text-indigo-700 transition"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.data.avatar}
                        alt={user.data.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-orange-400"
                      />
                    ) : (
                      <FaUserCircle
                        className="text-2xl text-indigo-600"
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-sm font-semibold max-w-[100px] truncate">
                      {user?.data?.name?.split(" ")[0] || "Profile"}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
                        role="menu"
                        aria-label="User account menu"
                        className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                      >
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            aria-label="Log out of your account"
                            title="Log out"
                            role="menuitem"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
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
                <>
                  {/* <li>
                    <Link
                      to="/login"
                      title="Student login - 1A HK International LMS"
                      aria-label="Student login"
                      className="text-gray-700 hover:text-indigo-700 transition"
                    >
                      Login
                    </Link>
                  </li> */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/login"
                      title="Start learning - Login to enroll in courses"
                      aria-label="Start learning - Login"
                      className="relative bg-gradient-to-r from-orange-500  to-orange-600 hover:from-indigo-600 text-white px-4 py-2 rounded-xl hover:rounded-full shadow-lg transition-all ease-in-out "
                    >
                      Start Learning
                    </Link>
                  </motion.div>
                </>
              ))}
          </ul>

          {/* MOBILE HAMBURGER */}
          <button
            type="button"
            className="md:hidden text-3xl cursor-pointer text-gray-800"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? (
              <HiOutlineX aria-hidden="true" />
            ) : (
              <HiOutlineMenu aria-hidden="true" />
            )}
          </button>
        </div>

        {/* ── MOBILE MENU ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.3 }}
              aria-label="Mobile navigation"
              className="md:hidden bg-white/95 backdrop-blur-lg shadow-xl py-6 px-6 max-h-[80vh] overflow-y-auto"
            >
              <ul className="flex flex-col gap-5 font-medium text-lg">
                <li>
                  <Link
                    to="/"
                    onClick={() => setIsOpen(false)}
                    aria-label="Go to Home page"
                  >
                    Home
                  </Link>
                </li>

                {/* Mobile courses accordion */}
                <li>
                  <button
                    onClick={() => setMobileCoursesOpen(!mobileCoursesOpen)}
                    aria-expanded={mobileCoursesOpen}
                    className="flex items-center justify-between w-full text-left text-gray-800"
                  >
                    <span>Courses</span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${mobileCoursesOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
                    {mobileCoursesOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden mt-3"
                      >
                        {courseMenu.map((category, i) => (
                          <div key={i} className="mb-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1.5 px-1">
                              {category.title}
                            </p>
                            <div className="flex flex-col gap-1 pl-1">
                              {category.courses
                                .filter((c) => c.name)
                                .map((course, j) => (
                                  <Link
                                    key={j}
                                    to={`/course/${course.id}`}
                                    onClick={() => {
                                      setIsOpen(false);
                                      setMobileCoursesOpen(false);
                                    }}
                                    aria-label={`View ${course.name} course`}
                                    className="text-sm text-gray-600 hover:text-indigo-700 py-1 leading-snug transition-colors"
                                  >
                                    {course.name}
                                  </Link>
                                ))}
                            </div>
                          </div>
                        ))}
                        <Link
                          to="/courses"
                          onClick={() => {
                            setIsOpen(false);
                            setMobileCoursesOpen(false);
                          }}
                          className="inline-block mt-1 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-md transition-colors"
                        >
                          View all courses →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>

                <li>
                  <NavLink
                    to="/blog"
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? "bg-[#1e3a5f] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    Blog
                  </NavLink>
                </li>

                <li>
                  <Link
                    to="/about"
                    onClick={() => setIsOpen(false)}
                    aria-label="About 1A HK International"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    onClick={() => setIsOpen(false)}
                    aria-label="Contact 1A HK International"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/payment"
                    onClick={() => setIsOpen(false)}
                    aria-label="Payments page"
                  >
                    Payments
                  </Link>
                </li>

                {!loading &&
                  (isAuthenticated ? (
                    <li className="border-t pt-4">
                      <p className="text-sm text-gray-400 mb-3">
                        {user?.data?.name || "Account"}
                      </p>
                      <div className="flex flex-col gap-3">
                        <Link
                          to="/student/profile"
                          onClick={() => setIsOpen(false)}
                          className="text-gray-700 hover:text-indigo-700"
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/student/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="text-gray-700 hover:text-indigo-700"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/student/courses"
                          onClick={() => setIsOpen(false)}
                          className="text-gray-700 hover:text-indigo-700"
                        >
                          My Courses
                        </Link>
                        <Link
                          to="/student/change-password"
                          onClick={() => setIsOpen(false)}
                          className="text-gray-700 hover:text-indigo-700"
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
                  ) : (
                    <>
                      <li>
                        <Link
                          to="/login"
                          onClick={() => setIsOpen(false)}
                          aria-label="Student login"
                        >
                          Login
                        </Link>
                      </li>
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Link
                          to="/login"
                          onClick={() => setIsOpen(false)}
                          className="bg-orange-600 text-white px-5 py-2 rounded-lg w-full text-center block shadow-md"
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
