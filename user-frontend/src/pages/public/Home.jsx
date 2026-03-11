import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";

/* ---------------- COUNTER ---------------- */

function Counter({ target }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;

    const num = parseInt(target.replace(/\D/g, ""));
    let start = 0;
    const step = Math.ceil(num / 60);

    const timer = setInterval(() => {
      start += step;
      if (start >= num) {
        setCount(num);
        clearInterval(timer);
      } else setCount(start);
    }, 25);

    return () => clearInterval(timer);
  }, [inView, target]);

  const suffix = target.replace(/[0-9]/g, "");

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ---------------- COURSE CARD ---------------- */

function CourseCard({ title, provider, badge, type, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm hover:shadow-lg transition"
    >
      {badge && (
        <span className="bg-indigo-100 text-indigo-600 text-xs px-3 py-1 rounded-full font-semibold">
          {badge}
        </span>
      )}

      <h3 className="font-bold text-lg mt-4 text-blue-900">{title}</h3>

      <p className="text-slate-600 text-sm mt-2">{provider}</p>

      <div className="flex justify-between items-center mt-6">
        <span className="bg-orange-100 text-orange-600 text-xs px-3 py-1 rounded-full font-semibold">
          {type}
        </span>

        <span className="text-orange-500 font-bold">→</span>
      </div>
    </motion.div>
  );
}

/* ---------------- HOME ---------------- */

export default function Home() {
  const stats = [
    { number: "10K+", label: "Professionals Trained" },
    { number: "50+", label: "Countries Served" },
    { number: "100+", label: "Corporate Clients" },
    { number: "500+", label: "Training Programs Delivered" },
  ];

  const courses = [
    {
      title: "IOSH Managing Safely",
      provider: "IOSH UK Certification",
      badge: "Popular",
      type: "Professional Certificate",
    },
    {
      title: "ISO 45001 Lead Auditor",
      provider: "PECB Canada",
      badge: "Advanced",
      type: "International Certification",
    },
    {
      title: "OTHM",
      provider: "OTHM Qualifications",
      badge: "Trending",
      type: "Global Safety Qualification",
    },
  ];

  return (
    <MainLayout>
      <div className="bg-slate-50 text-slate-900">

        {/* HERO */}

        <section className="pt-28 pb-24 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT */}

            <div>

              <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-xs font-semibold">
                1A HK International
              </span>
              <h1 className="text-5xl lg:text-5xl font-extrabold text-blue-900 mt-4 leading-tight">
                Where Safety and Excellence Leads
              </h1>
                <h1 className="text-orange-500 text-lg lg:text-lg font-bold"> 1A HK International, Our Name Reflects our Mission</h1>

              <p className="text-slate-600 mt-6 text-lg max-w-xl">
                HK International is a global training and consultancy
                organization specializing in internationally recognized
                Health, Safety & Environment (HSE) certifications. We help
                professionals, companies, and institutions gain the skills
                required to maintain world-class workplace safety standards.
              </p>

              <div className="flex gap-4 mt-10">

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-7 py-3 rounded-xl font-semibold"
                >
                  Explore Courses
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="border border-blue-900 text-blue-900 px-7 py-3 rounded-xl font-semibold"
                >
                  Corporate Training
                </motion.button>

              </div>
            </div>

            {/* RIGHT CARD */}

            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-lg">

              <h3 className="text-xl font-bold text-blue-900 mb-6">
                Popular Certifications
              </h3>

              {["IOSH", "ISO 45001", "OTHM"].map((course, i) => (
                <div key={i} className="mb-5">

                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">{course}</span>
                    <span className="text-slate-500">{75 + i * 8}%</span>
                  </div>

                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">

                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${75 + i * 8}%` }}
                      transition={{ duration: 1 }}
                      className="bg-indigo-600 h-full"
                    />

                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ABOUT HK INTERNATIONAL */}

        <section className="py-20">
          <div className="max-w-5xl mx-auto px-6 text-center">

            <h2 className="text-4xl font-extrabold text-blue-900">
              About HK International
            </h2>

            <p className="mt-6 text-slate-600 text-lg leading-relaxed max-w-3xl mx-auto">
              HK International is a global training and consultancy company
              committed to delivering internationally accredited Health,
              Safety and Environmental education. Our programs are designed
              to help professionals develop practical skills and globally
              recognized qualifications that improve workplace safety and
              compliance across industries.
            </p>

          </div>
        </section>

        {/* STATS */}

        <section className="pb-24">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6 px-6">

            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center"
              >

                <div className="text-5xl font-extrabold text-orange-500">
                  <Counter target={stat.number} />
                </div>

                <p className="text-slate-600 mt-3">{stat.label}</p>

              </motion.div>
            ))}

          </div>
        </section>

        {/* COURSES */}

        <section className="py-20 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">

            <h2 className="text-4xl font-extrabold text-blue-900 mb-12">
              Featured Certifications
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <CourseCard key={i} {...course} index={i} />
              ))}
            </div>

          </div>
        </section>

        {/* CTA */}

        <section className="py-20 px-6">

          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-700 text-center p-14 text-white shadow-xl">

            <h2 className="text-4xl font-extrabold">
              Start Your International Safety Career
            </h2>

            <p className="mt-4 text-white/80">
              Join thousands of professionals worldwide who trust HK
              International for globally recognized safety certifications.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="mt-8 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold"
            >
              Enroll Today
            </motion.button>

          </div>

        </section>

      </div>
    </MainLayout>
  );
}