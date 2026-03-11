import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Users, Clock } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";

/* NAVBAR COURSE MENU */
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
    courses: [{ name: "OTHM Level 6 Diploma in OHS", id: "othm-level6" }],
  },

  {
    title: "PECB (Canada)",
    courses: [
      { name: "ISO 45001 Lead Auditor", id: "iso45001-auditor" },
      { name: "ISO 45001 Lead Implementer", id: "iso45001-implementer" },
    ],
  },

  {
    title: "CIEH UK",
    courses: [{ name: "Level 3 Health & Safety", id: "cieh-level3" }],
  },

  {
    title: "OSHA USA",
    courses: [
      {
        name: "OSHA 30 Hour Construction Certificate",
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
        name: "ESC Level 6 Diploma in IDHSE",
        id: "esc-l6-d-idhse",
      },
      {
        name: "ESC Level 7 Diploma in OSH",
        id: "esc-l7-d-osh",
      },
      {
        name: "ESC Level 7 Diploma in PSM",
        id: "esc-l7-d-psm",
      },
    ],
  },

  {
    title: "BCRSP Canada",
    courses: [{ name: "CRSP Certification", id: "crsp-certification" }],
  },

  {
    title: "EOSH UK",
    courses: [
      { name: "EOSH Train The Trainer Certificate", id: "eosh-level3" },
    ],
  },

  {
    title: "HSE Training Courses",
    courses: [
      { name: "SHE / HSE Plan Training", id: "hse-training" },
      { name: "Behaviour-Based Safety (BBS)", id: "bbs-training" },
      { name: "Confined Space Safety", id: "css-training" },
      { name: "Permit To Work", id: "pw-training" },
      { name: "E-Waste Management", id: "ewaste-training" },
    ],
  },
];

/* FLATTEN ALL COURSES FOR PAGE */
const coursesData = courseMenu.flatMap((category) =>
  category.courses.map((course) => ({
    id: course.id,
    title: course.name,
    category: category.title,
    level: "Professional",
    duration: "3-5 Days",
    students: Math.floor(Math.random() * 1500 + 200),
    rating: (4 + Math.random()).toFixed(1),
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
  }))
);

export default function Courses() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categories = ["All", ...courseMenu.map((c) => c.title)];

  const filteredCourses = coursesData.filter(
    (course) =>
      (category === "All" || course.category === category) &&
      course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">

        {/* HERO */}
        <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Explore Professional Courses
            </h1>

            <p className="max-w-2xl mx-auto text-lg mb-8">
              Upgrade your career with internationally recognized safety
              certifications from HK International.
            </p>

            {/* SEARCH */}
            <div className="max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search courses..."
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-5 py-3 rounded-xl text-black shadow-lg focus:outline-none bg-white"
              />
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-full border transition ${
                  category === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-blue-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* COURSES GRID */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ y: -8 }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
              >
                <img
                  src={course.image}
                  className="h-48 w-full object-cover"
                />

                <div className="p-6">

                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    {course.category}
                  </span>

                  <h3 className="text-xl font-semibold mt-3 mb-3">
                    {course.title}
                  </h3>

                  <div className="flex items-center text-sm text-gray-500 gap-4 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {course.duration}
                    </span>

                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      {course.students}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    ⭐ {course.rating}
                  </div>

                  <Link
                    to={`/course/${course.id}`}
                    className="block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    View Course
                  </Link>

                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </MainLayout>
  );
}