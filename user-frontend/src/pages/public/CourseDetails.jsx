
import { Link, useNavigate, useParams } from "react-router-dom";
import { courses } from "../../data/coursesData";
import { motion } from "framer-motion";
import MainLayout from "../../components/layout/MainLayout";
import SEO from "../../components/SEO";
import { getCourseKeywords } from "../../data/seoKeywords";

const SITE_URL = "https://hkinternational.uk";

export default function CoursePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <MainLayout>
        <SEO
          title="Course not found | 1A HK International"
          description="The course you are looking for is not available. Browse all our accredited IOSH, OTHM, OSHA, ISO and CIEH courses."
          url={`${SITE_URL}/courses`}
          noIndex={true}
        />
        <div className="text-center py-40 px-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Course not found
          </h1>
          <p className="text-slate-500 mb-8">
            The course you are looking for doesn't exist or has been moved.
          </p> 
          <Link
            to="/courses"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Browse all courses
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Breadcrumb JSON-LD
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Courses",
        item: `${SITE_URL}/courses`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: course.title,
        item: `${SITE_URL}/course/${course.id}`,
      },
    ],
  };

  const overviewShort = (course.overview || "")
    .slice(0, 100)
    .replace(/\s+\S*$/, "");
  const modes = Array.isArray(course.mode)
    ? course.mode.join(", ")
    : course.mode || "Online";

  const metaTitle = `${course.title} | ${course.accreditation} - 1A HK International`;
  const metaDescription =
    `Enroll in ${course.title} by ${course.organization}. ${overviewShort}... Available ${modes}. Duration: ${course.duration}.`.slice(
      0,
      300,
    );

  return (
    <MainLayout>
      <SEO
        title={metaTitle}
        description={metaDescription}
        keywords={getCourseKeywords(course.id)}
        url={`${SITE_URL}/course/${course.id}`}
        image={course.image || "/og-courses.png"}
        schemaType="course"
        courseData={course}
        extraSchema={breadcrumbSchema}
        geoRegion="GB"
      />

      {/* BREADCRUMB */}
      <nav
        aria-label="Breadcrumb"
        className="bg-slate-100 border-b border-slate-200"
      >
        <ol className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <li>
            <Link
              to="/"
              title="1A HK International home page"
              className="hover:text-indigo-600 hover:underline"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              to="/courses"
              title="All accredited HSE courses"
              className="hover:text-indigo-600 hover:underline"
            >
              Courses
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li
            aria-current="page"
            className="text-slate-900 font-medium truncate max-w-[60vw]"
          >
            {course.title}
          </li>
        </ol>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-orange-400 font-semibold mb-2">
              {course.accreditation}
            </p>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {course.title}
            </h1>

            <p className="text-gray-300 mb-6">{course.organization}</p>

            <div className="flex flex-wrap gap-4 text-sm mb-6">
              <span className="bg-white/10 px-4 py-2 rounded-lg">
                Duration: {course.duration}
              </span>
              <span className="bg-white/10 px-4 py-2 rounded-lg">
                Level: {course.level}
              </span>
              <span className="bg-white/10 px-4 py-2 rounded-lg">
                Mode: {modes}
              </span>
            </div>

            <button
              aria-label={`Enroll in ${course.title} - contact 1A HK International`}
              className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg font-semibold transition"
              onClick={() => navigate("/contact")}
            >
              Enroll Now
            </button>
          </div>

          <img
            src={course.image}
            alt={`${course.title} - ${course.accreditation} accredited course`}
            className="rounded-xl shadow-xl w-96"
            loading="eager"
          />
        </div>
      </section>

      {/* COURSE OVERVIEW */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Course Overview</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            {course.overview}
          </p>
          <p className="text-gray-600 leading-relaxed">{course.importance}</p>
        </div>
      </section>

      {/* LEARNING OUTCOMES */}
      <section className="bg-slate-50 py-20" aria-label="What you will learn">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10">What You Will Learn</h2>

          <ul className="grid md:grid-cols-2 gap-6 list-none p-0">
            {course.learningOutcomes.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-sm border"
              >
                <span className="text-green-600 mr-2" aria-hidden="true">
                  ✔
                </span>
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* COURSE MODULES */}
      <section className="py-20" aria-label="Course modules">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10">Course Modules</h2>

          <div className="space-y-6">
            {course.modules.map((module, i) => (
              <article key={i} className="border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">{module.title}</h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-600">
                  {module.topics.map((topic, j) => (
                    <li key={j}>{topic}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHO SHOULD ATTEND */}
      <section className="bg-slate-50 py-20" aria-label="Who should attend">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">Who Should Attend</h2>
          <ul className="space-y-3 text-gray-600 list-none p-0">
            {course.whoShouldAttend.map((item, i) => (
              <li key={i}>
                <span className="text-green-600 mr-2" aria-hidden="true">
                  ✔
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CERTIFICATION */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Certification</h2>
          <p className="text-gray-600 leading-relaxed">
            {course.certification}
          </p>
        </div>
      </section>

      {/* CAREER BENEFITS */}
      <section className="bg-slate-50 py-20" aria-label="Career benefits">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10">Career Benefits</h2>

          <ul className="grid md:grid-cols-2 gap-6 list-none p-0">
            {course.careerBenefits.map((benefit, i) => (
              <li key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                <span aria-hidden="true"></span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-600 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Start Your Safety Career Today
        </h2>
        <p className="mb-6">
          Enroll in this internationally recognised safety certification.
        </p>
        <button
          aria-label={`Enroll in ${course.title} now`}
          className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          onClick={() => navigate("/contact")}
        >
          Enroll Now
        </button>
      </section>
    </MainLayout>
  );
}
