import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Clock, Search } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import SEO from "../../components/SEO";
import { getPageKeywords } from "../../data/seoKeywords";

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
      {
        name: "OSHA 30 Hour Construction Certificate",
        id: "osha-construction",
      },
      { name: "OSHA 30 Hour General Industry Certificate", id: "osha-general" },
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
      { name: "SHE / HSE Plan Training", id: "she-hse-plan-training" },
      { name: "Behaviour-Based Safety (BBS)", id: "bbs-training" },
      { name: "Confined Space Safety", id: "confined-space-safety" },
      { name: "Permit To Work", id: "permit-to-work" },
      { name: "E-Waste Management", id: "e-waste-management" },
    ],
  },
  {
    title: "1A HK International",
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
        name: "Permit-to-Work compliance and Auditing",
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

/* FLATTEN ALL COURSES FOR PAGE */
const coursesData = courseMenu.flatMap((category) =>
  category.courses.map((course) => ({
    id: course.id,
    title: course.name,
    category: category.title,
    level: "Professional",
    duration: "3-5 Days",
    students: 200 + ((course.id.length * 137) % 1300), // deterministic, not random
    rating: (4.4 + ((course.id.length * 7) % 6) / 10).toFixed(1),
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
  })),
);

export default function Courses() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categories = ["All", ...courseMenu.map((c) => c.title)];

  const filteredCourses = useMemo(
    () =>
      coursesData.filter(
        (course) =>
          (category === "All" || course.category === category) &&
          course.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [category, search],
  );

  return (
    <MainLayout>
      <SEO
        title="All Health & Safety Courses | IOSH, OTHM, OSHA, ISO, CIEH - 1A HK International"
        description="Explore 27+ accredited courses: IOSH Managing Safely, OTHM Level 6 & 7, ISO 45001 Lead Auditor, OSHA 30, CIEH food safety & more. Online & classroom."
        keywords={getPageKeywords("courses")}
        url="https://hkinternational.uk/courses"
        image="/og-courses.png"
        schemaType="courselist"
        courseListData={coursesData}
        geoRegion="GB"
      />

      <div className="bg-gray-50 min-h-screen">
        {/* HERO */}
        <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Explore Professional Health & Safety Courses
            </h1>

            <p className="max-w-2xl mx-auto text-lg mb-8">
              Upgrade your career with internationally recognized safety
              certifications from 1A HK International — IOSH, OTHM, OSHA, ISO,
              CIEH, ESC and more.
            </p>

            {/* SEARCH */}
            <div className="max-w-xl mx-auto relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search courses..."
                aria-label="Search HSE courses by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-5 py-3 rounded-xl text-black shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              />
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <section
          className="max-w-7xl mx-auto px-6 py-10"
          aria-label="Filter courses by accreditation"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                aria-label={`Filter courses: ${cat}`}
                aria-pressed={category === cat}
                className={`px-5 py-2 rounded-full border transition font-medium ${
                  category === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-white hover:bg-blue-50 border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* COURSES GRID */}
        <section
          className="max-w-7xl mx-auto px-6 pb-16"
          aria-label="Course catalogue"
        >
          {filteredCourses.length === 0 ? (
            <p className="text-center text-gray-500 py-16">
              No courses match your search. Try a different keyword.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <motion.article
                  key={course.id}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
                >
                  <img
                    src={course.image}
                    alt={`${course.title} - accredited HSE course`}
                    loading="lazy"
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-6">
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                      {course.category}
                    </span>

                    <h2 className="text-xl font-semibold mt-3 mb-3 text-slate-800">
                      {course.title}
                    </h2>

                    <div className="flex items-center text-sm text-gray-500 gap-4 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock size={16} aria-hidden="true" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={16} aria-hidden="true" />
                        {course.students}+
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-2 mb-4"
                      aria-label={`Rating ${course.rating} out of 5`}
                    >
                      ⭐ {course.rating}
                    </div>

                    <Link
                      to={`/course/${course.id}`}
                      title={`View ${course.title} - 1A HK International`}
                      aria-label={`View details for ${course.title}`}
                      className="block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      View Course
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
