import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Link, useNavigate } from "react-router-dom";
import HeroCarousel from "../../components/common/HeroCarousel";
import SEO from "../../components/SEO";
import { getPageKeywords } from "../../data/seoKeywords";
import FaqItem from "../../components/common/FaqItem";

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
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/course/${id}`)}
      aria-label={`View ${title} course details`}
      title={`View ${title} – 1A HK International`}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
          <img
            src={logo}
            alt={`${title} accreditation logo`}
            className="object-contain"
            loading="lazy"
          />
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
    { number: "2100+", label: "International Courses Conducted" },
    { number: "195+", label: "Nationalities Trained" },
    { number: "192+", label: "Empowered HKians Trained" },
    { number: "2400+", label: "Projects Delivered Globally" },
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
      id: "iosh-level3",
      title: "IOSH Level 3 Certificate in OSH",
      org: "IOSH - United Kingdom",
      description:
        "Advanced occupational safety certification designed for health and safety professionals.",
      logo: "/logos/2-iosh_ATP.png",
    },
    {
      id: "othm-level6",
      title: "OTHM Level 6 Diploma in Occupational Health & Safety",
      org: "OTHM Qualifications - UK",
      description:
        "Professional diploma regulated in the UK for advanced occupational safety management.",
      logo: "/logos/3-othm.png",
    },
    {
      id: "iso-45001-auditor",
      title: "ISO 45001 Lead Auditor",
      org: "PECB - Canada",
      description:
        "International certification for auditing occupational health and safety management systems.",
      logo: "/logos/5-pecb.png",
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

  const faqs = [
    {
      question:
        "Which are the best internationally recognized HSE courses for safety officer jobs abroad?",
      answer:
        "1A HK International offers globally recognized HSE certifications including IOSH Managing Safely, OSHA 30 Hours Construction & General Industry, OSHA 48 Hours, OTHM Level 6 & Level 7 Diplomas in Occupational Health and Safety Management, ISO 45001 Lead Auditor, ISO 9001 Lead Auditor, CIEH, and ESC accredited safety courses. These qualifications are highly valued for safety officer and HSE careers in the UAE, Saudi Arabia, Qatar, Oman, Kuwait, the UK, Canada, and other international job markets.",
    },
    {
      question:
        "Is IOSH Managing Safely certificate valid internationally for Gulf and overseas jobs?",
      answer:
        "Yes. IOSH Managing Safely is an internationally recognized health and safety certification approved by the Institution of Occupational Safety and Health (IOSH), UK. The certification is widely accepted in construction, oil & gas, manufacturing, logistics, engineering, and industrial sectors across the UAE, Saudi Arabia, Qatar, Oman, Kuwait, the UK, and many other countries.",
    },
    {
      question:
        "Can I study OSHA, IOSH, OTHM, ISO and other HSE courses online from India or abroad?",
      answer:
        "Yes. 1A HK International provides flexible online HSE training programs for students and working professionals worldwide. Learners from India, the UAE, Saudi Arabia, Qatar, Oman, the UK, Africa, and other international locations can enroll in accredited safety courses online and study remotely with expert trainer support and flexible schedules.",
    },
    {
      question:
        "Which HSE certification is best for freshers and beginners in occupational health and safety?",
      answer:
        "For beginners and freshers starting a career in occupational health and safety, IOSH Managing Safely and OSHA 30 Hours are among the best entry-level HSE certifications. These courses help learners understand workplace safety, hazard identification, risk assessment, accident prevention, and international safety standards required for safety officer jobs and industrial careers.",
    },
    {
      question:
        "What is the difference between OTHM Level 6 and OTHM Level 7 Diploma in Occupational Health and Safety Management?",
      answer:
        "OTHM Level 6 Diploma focuses on practical occupational health and safety management skills, workplace compliance, and operational safety responsibilities. OTHM Level 7 Diploma is an advanced qualification designed for senior HSE professionals seeking expertise in strategic safety leadership, auditing, compliance management, organizational risk control, and international career advancement.",
    },
    {
      question:
        "Are ISO 45001 Lead Auditor and ISO 9001 Lead Auditor certifications accepted worldwide?",
      answer:
        "Yes. ISO 45001 Lead Auditor and ISO 9001 Lead Auditor certifications delivered through internationally recognized accreditation bodies such as PECB Canada are accepted globally. These certifications are highly beneficial for professionals pursuing careers in ISO auditing, workplace safety management systems, quality assurance, compliance auditing, and corporate risk management.",
    },
    {
      question:
        "Which HSE course is best for construction, oil and gas, and industrial safety jobs?",
      answer:
        "Courses such as OSHA 30 Hours Construction Industry, IOSH Managing Safely, ISO 45001 Lead Auditor, and OTHM Occupational Health and Safety qualifications are highly recommended for construction, oil & gas, manufacturing, engineering, logistics, and industrial safety careers. These certifications improve job opportunities for safety officers, HSE engineers, supervisors, and compliance professionals worldwide.",
    },
    {
      question:
        "Why choose 1A HK International for online HSE training and safety certifications?",
      answer:
        "1A HK International is a trusted international HSE training provider offering accredited safety courses, experienced trainers, flexible online learning, assignment guidance, career-focused support, and globally recognized certifications. We help students and professionals build successful HSE careers in industries such as construction, oil & gas, manufacturing, logistics, healthcare, and engineering worldwide.",
    },
    {
      question:
        "Do HSE certifications help in getting safety officer jobs in the UAE, Saudi Arabia, and Gulf countries?",
      answer:
        "Yes. International HSE certifications such as IOSH, OSHA, ISO 45001, and OTHM qualifications significantly improve job opportunities for safety officers and HSE professionals in Gulf countries including the UAE, Saudi Arabia, Qatar, Oman, and Kuwait. Employers in construction, oil & gas, infrastructure, and industrial sectors often prefer candidates with internationally recognized safety certifications.",
    },
    {
      question:
        "What industries require occupational health and safety certifications?",
      answer:
        "Occupational health and safety certifications are important for professionals working in construction, oil and gas, manufacturing, logistics, healthcare, engineering, warehousing, facility management, mining, power plants, fire and safety, and industrial operations where workplace safety compliance, risk assessment, and accident prevention are essential.",
    },
    {
      question:
        "Does 1A HK International provide corporate training and classroom HSE courses?",
      answer:
        "Yes. 1A HK International provides online, classroom, and corporate HSE training programs for organizations and individual learners. Companies can arrange customized safety training for employees covering workplace safety compliance, ISO auditing, risk management, fire safety, occupational health and safety systems, and internationally recognized HSE certifications.",
    },
    {
      question:
        "How can I enroll in internationally accredited HSE courses at 1A HK International?",
      answer:
        "You can enroll in internationally accredited HSE courses directly through the official 1A HK International website. Students and professionals can choose from online and classroom learning options, receive expert guidance, and gain globally recognized certifications that support international HSE career growth and workplace safety compliance.",
    },
  ];

  return (
    <MainLayout>
      <SEO
        title="1A HK International | Accredited Health & Safety Courses Online – IOSH, OTHM, OSHA, ISO"
        description="1A HK International offers IOSH, OTHM, OSHA, ISO 45001, CIEH & ESC accredited HSE training online & classroom. UK accredited. London, Mumbai, Lisbon."
        keywords={getPageKeywords("home")}
        url="https://hkinternational.uk/"
        image="/og-home.png"
        schemaType="organization"
        geoRegion="GB"
      />

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
              <p className="text-orange-500 text-lg lg:text-lg font-bold mt-2">
                1A HK International, Our Name Reflects our Mission
              </p>

              <p className="text-slate-600 mt-6 text-lg max-w-xl">
                1A HK International is a global training and consultancy
                organization specializing in internationally recognized Health,
                Safety & Environment (HSE) certifications. We help
                professionals, companies, and institutions gain the skills
                required to maintain world-class workplace safety standards.
              </p>

              <div className="flex flex-wrap gap-4 mt-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/courses")}
                  aria-label="Explore all accredited HSE courses"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-7 py-3 rounded-xl font-semibold shadow-md"
                >
                  Explore Courses
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/contact")}
                  aria-label="Enquire about corporate HSE training"
                  className="border border-blue-900 text-blue-900 px-7 py-3 rounded-xl font-semibold hover:bg-blue-900 hover:text-white transition"
                >
                  Corporate Training
                </motion.button>
              </div>
            </div>

            {/* RIGHT CARD */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="mb-7">
                <h2 className="text-xl font-bold text-slate-800">
                  Global Safety Certifications
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Internationally recognized health & safety training programs
                </p>
              </div>

              <div className="space-y-6">
                {certifications.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={item.logo}
                            alt={`${item.org} accreditation logo`}
                            className="object-contain w-8 h-8"
                            loading="lazy"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {item.org}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.course}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-indigo-600">
                        {item.value}%
                      </span>
                    </div>

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
        <section className="pb-24" aria-label="Company achievements">
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
        <section
          className="py-24 border-t border-slate-200 bg-slate-50"
          aria-label="Featured Safety Certifications"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold text-slate-900">
                Featured Safety Certifications
              </h2>
              <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
                Globally recognized occupational health and safety
                certifications trusted by professionals and organizations
                worldwide.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, i) => (
                <CourseCard key={i} {...course} index={i} />
              ))}
            </div>

            {/* Hidden internal-links block for SEO crawling */}
            <nav aria-label="All courses" className="mt-12 text-center">
              <Link
                to="/courses"
                title="View all 27 accredited HSE courses – 1A HK International"
                className="inline-block text-indigo-700 font-semibold hover:underline"
              >
                Browse all 27 accredited courses →
              </Link>
            </nav>
          </div>
        </section>

        {/* FAQ */}
        {/* FAQ */}
        <section
          className="py-24 bg-white"
          aria-label="Frequently Asked Questions"
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div itemScope itemType="https://schema.org/FAQPage">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <FaqItem {...faq} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-900 to-orange-700 text-center p-14 text-white shadow-xl">
            <h2 className="text-3xl font-extrabold">
              Let's Grow and Build a Safer Future Together
            </h2>
            <p className="mt-4 text-white/80">
              Partner with us today and experience why 1A HK International is
              the top choice for corporates that refuse to compromise on safety.
              Reach out to learn more about how we can align with your
              organization's goals and help you build an unbeatable culture of
              safety.
            </p>

            <motion.button
              onClick={() => navigate("/contact")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Enroll today – contact 1A HK International"
              className="mt-8 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md"
            >
              Enroll Today
            </motion.button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
