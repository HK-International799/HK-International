import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Users, Clock } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";

const categories = [
  "All",
  "Health & Safety",
  "Risk Assessment",
  "Workplace Safety",
  "Management",
];

const coursesData = [
  {
    id: 1,
    title: "IOSH Managing Safely",
    category: "Management",
    level: "Intermediate",
    duration: "3 Days",
    students: 1200,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
  },
  {
    id: 2,
    title: "Display Screen Equipment (DSE)",
    category: "Workplace Safety",
    level: "Beginner",
    duration: "1 Day",
    students: 900,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    id: 3,
    title: "Workstation Risk Assessment",
    category: "Risk Assessment",
    level: "Intermediate",
    duration: "2 Days",
    students: 600,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
  },
  {
    id: 4,
    title: "Health & Safety Awareness",
    category: "Health & Safety",
    level: "Beginner",
    duration: "1 Day",
    students: 1500,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
  },
];

export default function Courses() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredCourses = coursesData.filter(
    (course) =>
      (category === "All" || course.category === category) &&
      course.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* HERO */}
        <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Explore Professional Courses
            </motion.h1>

            <p className="max-w-2xl mx-auto text-lg mb-8">
              Upgrade your career with internationally recognized safety
              certifications from HK International.
            </p>

            {/* SEARCH BAR */}
            <div className="max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search courses..."
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-5 py-3 rounded-xl text-black shadow-lg focus:outline-none hover:outline outline-orange-500 bg-white/70"
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
                className={`px-5 py-2 rounded-full border transition
                ${
                  category === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-blue-50"
                }
              `}
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
                {/* IMAGE */}
                <img src={course.image} className="h-48 w-full object-cover" />

                <div className="p-6">
                  {/* CATEGORY */}
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    {course.category}
                  </span>

                  {/* TITLE */}
                  <h3 className="text-xl font-semibold mt-3 mb-3">
                    {course.title}
                  </h3>

                  {/* INFO */}
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

                  {/* RATING */}
                  <div className="flex items-center gap-2 mb-4">
                    <Star
                      size={18}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span className="font-medium">{course.rating}</span>
                  </div>

                  {/* CTA */}
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
