import { useNavigate, useParams } from "react-router-dom";
import { courses } from "../../data/coursesData";
import { motion } from "framer-motion";
import MainLayout from "../../components/layout/MainLayout";

export default function CoursePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const course = courses.find((c) => c.id === id);
  // console.log(course);

  if (!course) {
    return <div className="text-center py-40 text-2xl">Course not found</div>;
  }

  return (
    <MainLayout>
      <div className="">
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
                  Mode:{" "}
                  {Array.isArray(course.mode)
                    ? course.mode.join(", ")
                    : course.mode}
                </span>
              </div>

              <button
                className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg font-semibold transition"
                onClick={() => {
                  navigate("/contact");
                }}
              >
                Enroll Now
              </button>
            </div>

            <img
              src={course.image}
              alt={course.title}
              className="rounded-xl shadow-xl w-96"
            />
          </div>
        </section>

        {/* COURSE OVERVIEW */}

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

        <section className="bg-slate-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-10">What You Will Learn</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {course.learningOutcomes.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm border"
                >
                  ✔ {item}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* COURSE MODULES */}

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-10">Course Modules</h2>

            <div className="space-y-6">
              {course.modules.map((module, i) => (
                <div key={i} className="border rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">{module.title}</h3>

                  <ul className="list-disc ml-6 space-y-2 text-gray-600">
                    {module.topics.map((topic, j) => (
                      <li key={j}>{topic}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHO SHOULD ATTEND */}

        <section className="bg-slate-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8">Who Should Attend</h2>

            <ul className="space-y-3 text-gray-600">
              {course.whoShouldAttend.map((item, i) => (
                <li key={i}>✔ {item}</li>
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

        <section className="bg-slate-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-10">Career Benefits</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {course.careerBenefits.map((benefit, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-xl shadow-sm border"
                >
                   {benefit}
                </div>
              ))}
            </div>
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
            className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold"
            onClick={() => {
              navigate("/contact");
            }}
          >
            Enroll Now
          </button>
        </section>
      </div>
    </MainLayout>
  );
}
