import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const courseMenu = [
    {
      title: "IOSH UK",
      courses: [
        { name: "IOSH Managing Safely", id: "iosh-managing-safely" },
        // { name: "IOSH Working Safely", id: "iosh-working-safely" },
        { name: "IOSH Level 3 Certificate", id: "iosh-level3" },
      ],
    },

    {
      title: "OTHM UK",
      courses: [{ name: "OTHM Level 6 Diploma in OHS", id: "othm-level6" }],
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
      courses: [{ name: "Level 3 Health & Safety", id: "cieh-level3" }],
    },

    {
      title: "OSHA USA",
      courses: [
        { name: "OSHA 30 Hour Construction Certificate (PECB Certified-Canada)", id: "osha-construction" },
        { name: "OSHA 30 Hour General Industry Certificate", id: "osha-general" },
      ],
    },

    {
      title: "European Safety Council",
      courses: [
        { name: "European Safety council Level 6 Diploma in IDHSE (OPQUAL-UK)", id: "esc-l6-d-idhse"},
        { name: "European Safety Council Level 7 Diploma in OSH (OFQUAL-UK) ", id: "esc-l7-d-osh"},
        { name: "European Safety Council Level 7 Diploma in PSM (OFQUAL-UK) ", id: "esc-l7-d-psm"},
      ],
    },

    {
      title: "BCRSP Canada",
      courses: [{ name: "", id: "crsp-certification" }],
    },

    {
      title: "EOSH UK",
      courses: [{ name: "EOSH Train The Trainer Certificate", id: "eosh-train-the-trainer" }],
    },

    {
      title: "HSE Training Courses",
      courses: [
        { name:"SHE/HSE Plan Training", id:"she-hse-plan-training"},
        { name: "Behaviour-Based Safety (BBS) Traning", id: "bbs-training" },
        { name: "Confined Space Safety Traning", id: "confined-space-safety" },
        { name: "Permit to Work Traning", id: "permit-to-work" },
        { name: "E-Waste Management Training ", id: "e-waste-management" },
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
              alt="1A HK International"
              className="h-16 w-auto object-contain"
            />

            <span className="hidden sm:block font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-orange-500">
              1A HK International
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
              onMouseLeave={() => {
                setCoursesOpen(false);
                setActiveCategory(null);
              }}
            >
              <button
                onClick={() => {
                  navigate("/courses");
                }}
                className="text-gray-800 hover:text-orange-600 flex items-center gap-1"
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

                          {/* <span className="text-gray-400">▶</span> */}
                        </div>

                        {/* SUB DROPDOWN */}

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
                                className="block px-4 py-2 text-sm text-gray-900 hover:bg-white hover:text-orange-600 rounded-xl"
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
