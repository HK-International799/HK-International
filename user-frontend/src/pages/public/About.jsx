
import { motion } from "framer-motion";
import MainLayout from "../../components/layout/MainLayout";
import Counter from "../../components/common/Counter";
import FaqItem from "../../components/common/FaqItem";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import { getPageKeywords } from "../../data/seoKeywords";

export default function About() {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What is IOSH Managing Safely?",
      answer:
        "IOSH Managing Safely is a globally recognized certificate that helps managers and supervisors understand workplace safety responsibilities, perform risk assessments, and build a strong health & safety culture.",
    },
    {
      question: "Who should take OTHM Level 6 or Level 7 Diplomas?",
      answer:
        "OTHM Level 6 and Level 7 Diplomas are designed for HSE professionals aiming to advance into strategic occupational health and safety management roles, including HSE Managers, Consultants, and Auditors.",
    },
    {
      question: "Are ISO Lead Auditor courses internationally recognized?",
      answer:
        "Yes. ISO 45001 and ISO 9001 Lead Auditor certifications offered through PECB (Canada) are globally accepted credentials for auditing occupational safety and quality management systems.",
    },
    {
      question: "Does 1A HK International offer online HSE training?",
      answer:
        "Yes. We deliver IOSH, OTHM, OSHA, ISO, CIEH and ESC accredited courses through online, classroom and corporate training modes across the UK, India, Portugal and the Middle East.",
    },
    {
      question: "Where are 1A HK International's offices located?",
      answer:
        "We operate from three international offices: London (East Ham, UK), Lisbon (Portugal), and Mumbai (Andheri East, India).",
    },
  ];

  return (
    <MainLayout>
      <SEO
        title="About 1A HK International | Accredited HSE Training Provider – UK, India, Portugal"
        description="1A HK International is an accredited HSE training provider with offices in London, Mumbai and Lisbon. Accredited by IOSH, OTHM, PECB, OSHA, CIEH & ESC."
        keywords={getPageKeywords("about")}
        url="https://hkinternational.uk/about"
        image="/og-about.png"
        schemaType="organization"
        faqData={faqs}
        geoRegion="GB"
      />

      {/* HERO */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-32 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          className="absolute w-[600px] h-[600px] bg-white rounded-full blur-3xl -top-40 -left-40"
        />

        <div className="max-w-7xl mx-auto px-6 text-center relative">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl font-bold"
          >
            Where Safety & Excellence Leads
          </motion.h1>

          <p className="mt-6 text-lg max-w-3xl mx-auto">
            1A HK International is a globally trusted provider of Health,
            Safety, and Environment training programs designed to empower
            professionals and organizations.
          </p>
        </div>
      </section>

      {/* COMPANY STORY */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold">Our Mission</h2>

            <p className="text-gray-600 mt-4">
              The "1A" in our name represents top-tier excellence. Our mission
              is to become the world's most trusted provider of Health, Safety
              and Environment training.
            </p>

            <p className="text-gray-600 mt-4">
              We deliver internationally accredited programs that help
              professionals improve workplace safety, reduce risks and build
              sustainable industries.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gray-200 rounded-xl h-80"
          >
            <img
              src="/images/ourmissionandvision.jpg"
              alt="1A HK International – mission and vision for global HSE excellence"
              className="rounded-2xl w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="bg-gray-50 py-24" aria-label="Company achievements">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-10">
          <Counter end={50} label="International Courses Conducted" />
          <Counter end={10000} label="Students Trained Globally" />
          <Counter end={500} label="Corporate Training Projects" />
          <Counter end={1000000} label="Training Hours Delivered" />
        </div>
      </section>

      {/* TRAINING PROGRAMS */}
      <section className="py-24" aria-label="Key training programs">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center">
            Our Key Training Programs
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              "IOSH Managing Safely Certificate",
              "Level 6 Diploma in IDHSE",
              "Level 7 Diploma in OHS",
              "Level 7 Diploma in PSM",
              "ISO Lead Auditor Certifications",
              "OSHA 30 Hours Training",
            ].map((course, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-8 border rounded-xl hover:shadow-xl transition bg-white"
              >
                {course}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GLOBAL PRESENCE */}
      <section className="bg-gray-900 text-white py-24" aria-label="Global presence">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">Global Presence</h2>

          <p className="text-gray-400 mt-4">
            Delivering training programs across Europe, Asia, North America and
            Oceania.
          </p>

          <ul className="grid grid-cols-3 md:grid-cols-6 gap-6 mt-10 text-gray-300 list-none p-0">
            <li>UK</li>
            <li>Germany</li>
            <li>France</li>
            <li>India</li>
            <li>USA</li>
            <li>Canada</li>
            <li>Japan</li>
            <li>Australia</li>
            <li>Mexico</li>
            <li>Indonesia</li>
            <li>Italy</li>
            <li>Spain</li>
          </ul>
        </div>
      </section>

      

      {/* CTA */}
      <section className="bg-blue-600 text-white py-24 text-center">
        <h2 className="text-3xl font-bold">
          Let's Build a Safer Future Together
        </h2>

        <p className="mt-4 max-w-2xl mx-auto">
          Partner with 1A HK International to strengthen workplace safety
          culture and develop world-class professionals.
        </p>

        <button
          className="mt-8 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          aria-label="Explore all HSE courses"
          onClick={() => navigate("/courses")}
        >
          Explore Courses
        </button>
      </section>
    </MainLayout>
  );
}
