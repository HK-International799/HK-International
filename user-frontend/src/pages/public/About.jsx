import { motion } from "framer-motion";
import MainLayout from "../../components/layout/MainLayout";
import Counter from "../../components/common/Counter";
import FaqItem from "../../components/common/FaqItem";

export default function About() {

  const faqs = [
    {
      question: "What is IOSH Managing Safely?",
      answer:
        "A globally recognized certificate that helps managers understand workplace safety responsibilities and risk management."
    },
    {
      question: "Who should take Level 6 or Level 7 Diplomas?",
      answer:
        "Safety professionals aiming to advance into strategic HSE management roles."
    },
    {
      question: "Are ISO Lead Auditor courses internationally recognized?",
      answer:
        "Yes, they are globally accepted certifications for auditing management systems."
    }
  ];

  return (
    <MainLayout>

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
            transition={{ duration: .7 }}
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
          >
            <h2 className="text-3xl font-bold">
              Our Mission
            </h2>

            <p className="text-gray-600 mt-4">
              The “1A” in our name represents top-tier excellence.
              Our mission is to become the world’s most trusted
              provider of Health, Safety and Environment training.
            </p>

            <p className="text-gray-600 mt-4">
              We deliver internationally accredited programs that
              help professionals improve workplace safety, reduce
              risks and build sustainable industries.
            </p>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-gray-200 rounded-xl h-80"
          />

        </div>
      </section>

      {/* STATISTICS */}

      <section className="bg-gray-50 py-24">

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-10">

          <Counter end={50} label="International Courses Conducted" />
          <Counter end={10000} label="Students Trained Globally" />
          <Counter end={500} label="Corporate Training Projects" />
          <Counter end={1000000} label="Training Hours Delivered" />

        </div>

      </section>

      {/* TRAINING PROGRAMS */}

      <section className="py-24">

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
              "OSHA 30 Hours Training"
            ].map((course, index) => (

              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-8 border rounded-xl hover:shadow-xl transition"
              >
                {course}
              </motion.div>

            ))}

          </div>

        </div>

      </section>

      {/* GLOBAL PRESENCE */}

      <section className="bg-gray-900 text-white py-24">

        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-bold">
            Global Presence
          </h2>

          <p className="text-gray-400 mt-4">
            Delivering training programs across Europe, Asia,
            North America and Oceania.
          </p>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 mt-10 text-gray-300">

            <div>UK</div>
            <div>Germany</div>
            <div>France</div>
            <div>India</div>
            <div>USA</div>
            <div>Canada</div>
            <div>Japan</div>
            <div>Australia</div>
            <div>Mexico</div>
            <div>Indonesia</div>
            <div>Italy</div>
            <div>Spain</div>

          </div>

        </div>

      </section>

      {/* FAQ */}

      <section className="py-24">

        <div className="max-w-4xl mx-auto px-6">

          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          {faqs.map((faq, index) => (
            <FaqItem key={index} {...faq} />
          ))}

        </div>

      </section>

      {/* CTA */}

      <section className="bg-blue-600 text-white py-24 text-center">

        <h2 className="text-3xl font-bold">
          Let's Build a Safer Future Together
        </h2>

        <p className="mt-4 max-w-2xl mx-auto">
          Partner with 1A HK International to strengthen workplace
          safety culture and develop world-class professionals.
        </p>

        <button className="mt-8 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold">
          Explore Courses
        </button>

      </section>

    </MainLayout>
  );
}