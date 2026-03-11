import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import HeroCarousel from "../../components/common/HeroCarousel";

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

function CourseCard({ id, title, org, description, logo, index }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      onClick={() => navigate(`/course/${id}`)}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
          <img src={logo} alt={title} className="object-contain " />
        </div>

        <p className="text-xs font-semibold text-indigo-600">{org}</p>
      </div>

      {/* Course Title */}
      <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 leading-relaxed mb-5">
        {description}
      </p>

      {/* CTA */}
      <span className="text-sm font-semibold text-indigo-600 group-hover:underline">
        Learn More →
      </span>
    </motion.div>
  );
}

/* ---------------- HOME ---------------- */

export default function Home() {
  const navigate = useNavigate();

  const stats = [
    { number: "10K+", label: "Professionals Trained" },
    { number: "50+", label: "Countries Served" },
    { number: "100+", label: "Corporate Clients" },
    { number: "500+", label: "Training Programs Delivered" },
  ];

  const courses = [
    {
      id: "iosh-managing-safely",
      title: "IOSH Managing Safely®",
      org: "IOSH - United Kingdom",
      description:
        "Globally recognized training for managers and supervisors to manage workplace health and safety.",
      logo: "/logos/1-iosh.jpg",
    },

    {
      id: "iosh-level3-osh",
      title: "IOSH Level 3 Certificate in OSH",
      org: "IOSH - United Kingdom",
      description:
        "Advanced occupational safety certification designed for health and safety professionals.",
      logo: "/logos/2-iosh_ATP.png",
    },

    {
      id: "othm-level6-ohs",
      title: "OTHM Level 6 Diploma in Occupational Health & Safety",
      org: "OTHM Qualifications - UK",
      description:
        "Professional diploma regulated in the UK for advanced occupational safety management.",
      logo: "/logos/3-othm.png",
    },

    {
      id: "pecb-iso45001",
      title: "ISO 45001 Lead Auditor",
      org: "PECB - Canada",
      description:
        "International certification for auditing occupational health and safety management systems.",
      logo: "/logos/5-pecb.png",
    },

    {
      id: "hse-training",
      title: "HSE Training Programs",
      org: "International HSE Programs",
      description:
        "Practical health, safety, and environment training for industrial and corporate sectors.",
      logo: "/logos/9-ibsp.png",
    },
  ];

  const certifications = [
    {
      org: "IOSH",
      country: "United Kingdom",
      course: "Managing Safely® / Level 3 OSH",
      value: 92,
      logo: "/logos/1-iosh.jpg",
    },
    {
      org: "OTHM",
      country: "United Kingdom",
      course: "Level 6 Diploma in Occupational Health & Safety",
      value: 88,
      logo: "/logos/3-othm.png",
    },
    {
      org: "PECB",
      country: "Canada",
      course: "ISO 45001 Lead Auditor / Implementer",
      value: 85,
      logo: "/logos/5-pecb.png",
    },

    {
      org: "European Safety Council",
      country: "Europe / UK",
      course: "Qualifi Level 7 Diploma",
      value: 78,
      logo: "/logos/6-esc.png",
    },

    {
      org: "EOSH",
      country: "United Kingdom",
      course: "Level 3 International OSH Certificate",
      value: 73,
      logo: "/logos/8-eosh.png",
    },
  ];

  return (
    <MainLayout>
      <div className="bg-slate-50 text-slate-900">
        {/* HERO */}

        <section className="pt-16 pb-24 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT */}

            <div>
              <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-xs font-semibold">
                1A HK International
              </span>
              <h1 className="text-5xl lg:text-5xl font-extrabold text-blue-900 mt-4 leading-tight">
                Where Safety and Excellence Leads
              </h1>
              <h1 className="text-orange-500 text-lg lg:text-lg font-bold">
                {" "}
                1A HK International, Our Name Reflects our Mission
              </h1>

              <p className="text-slate-600 mt-6 text-lg max-w-xl">
                1A HK International is a global training and consultancy
                organization specializing in internationally recognized Health,
                Safety & Environment (HSE) certifications. We help
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

            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
              {/* Header */}
              <div className="mb-7">
                <h3 className="text-xl font-bold text-slate-800">
                  Global Safety Certifications
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Internationally recognized health & safety training programs
                </p>
              </div>

              {/* Certifications */}
              <div className="space-y-6">
                {certifications.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="group"
                  >
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {/* Logo */}
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={item.logo}
                            alt={item.org}
                            className="object-contain w-8 h-8"
                          />
                        </div>

                        {/* Text */}
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {item.org}
                          </p>

                          <p className="text-xs text-slate-500">
                            {item.course}
                          </p>
                        </div>
                      </div>

                      {/* Percentage */}
                      <span className="text-xs font-semibold text-indigo-600">
                        {item.value}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <HeroCarousel />

        {/* ABOUT 1A HK International */}

        <section className="py-20">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold text-blue-900">
              About 1A HK International
            </h2>

            <p className="mt-6 text-slate-600 text-lg leading-relaxed max-w-3xl mx-auto">
              1A HK International is a global training and consultancy company
              committed to delivering internationally accredited Health, Safety
              and Environmental education. Our programs are designed to help
              professionals develop practical skills and globally recognized
              qualifications that improve workplace safety and compliance across
              industries.
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

        <section className="py-24 border-t border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold text-slate-900">
                Featured Safety Certifications
              </h2>

              <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
                Globally recognized occupational health and safety
                certifications trusted by professionals and organizations
                worldwide.
              </p>

              {/* <div className="w-24 h-1 bg-indigo-500 mx-auto mt-5 rounded-full"></div> */}
            </div>

            {/* Certification Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, i) => (
                <CourseCard key={i} {...course} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}

        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-900 to-orange-700 text-center p-14 text-white shadow-xl">
            <h2 className="text-3xl font-extrabold">
              Let's Grow and Build a Safer Future Together{" "}
            </h2>

            <p className="mt-4 text-white/80">
              Partner with us today and experience why 1A HK International is the
              top choice for corporates that refuse to compromise on safety.
              Reach out to learn more about how we can align with your
              organization's goals and help you build an unbeatable culture of
              safety.
            </p>

            <motion.button
              onClick={() => {
                navigate("/contact");
              }}
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
