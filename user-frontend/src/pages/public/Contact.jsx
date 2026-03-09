import { motion } from "framer-motion";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import MainLayout from "../../components/layout/MainLayout";

export default function Contact() {
  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen">
        {/* HERO SECTION */}

        <section className="pt-40 pb-20 px-6 text-center max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-indigo-900"
          >
            Contact HK International
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-gray-600 text-lg"
          >
            Have questions about our internationally accredited safety and
            professional certification programs? Our team is here to help you
            choose the right course and guide your learning journey.
          </motion.p>
        </section>

        {/* CONTACT CARDS */}

        <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 pb-20">
          {/* EMAIL */}

          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 hover:shadow-xl transition"
          >
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-2xl mb-5">
              <FaEnvelope />
            </div>

            <h3 className="font-semibold text-lg text-indigo-900">Email Us</h3>

            <p className="text-gray-600 mt-2">info@hkinternational.com</p>
          </motion.div>

          {/* PHONE */}

          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 hover:shadow-xl transition"
          >
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-orange-100 text-orange-600 text-2xl mb-5">
              <FaPhoneAlt />
            </div>

            <h3 className="font-semibold text-lg text-indigo-900">Call Us</h3>

            <p className="text-gray-600 mt-2">+91 79918 45638</p>
          </motion.div>

          {/* LOCATION */}

          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 hover:shadow-xl transition"
          >
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-amber-100 text-amber-600 text-2xl mb-5">
              <FaMapMarkerAlt />
            </div>

            <h3 className="font-semibold text-lg text-indigo-900">Visit Us</h3>

            <p className="text-gray-600 mt-2">Marol, Andheri East, Mumbai, Maharahstra, India</p>
          </motion.div>
        </section>

        {/* CONTACT FORM */}

        <section className="max-w-6xl mx-auto px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white shadow-xl rounded-3xl grid md:grid-cols-2 overflow-hidden"
          >
            {/* LEFT CONTENT */}

            <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white p-12">
              <h2 className="text-3xl font-bold mb-6">
                Let's Talk About Your Career
              </h2>

              <p className="text-indigo-100 leading-relaxed">
                HK International offers globally recognized certification
                courses in occupational health & safety, environmental
                management, auditing and compliance training. Contact us to
                learn how our programs can help you build a successful
                international career.
              </p>

              <div className="mt-10 space-y-4 text-indigo-100">
                <p>✔ IOSH Certified Courses</p>
                <p>✔ OTHM Professional Qualifications</p>
                <p>✔ ISO Lead Auditor Training</p>
                <p>✔ ProQual & PECB Certifications</p>
              </div>
            </div>

            {/* FORM */}

            <div className="p-10">
              <form className="space-y-6">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <textarea
                  rows="5"
                  placeholder="Your Message"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition"
                >
                  Send Message
                </motion.button>
              </form>
            </div>
          </motion.div>
        </section>

        {/* MAP SECTION */}

        <section className="px-6 pb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-xl"
          >
            <iframe
              title="location"
              src="https://maps.google.com/maps?q=marol&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="w-full h-[420px] border-0"
            ></iframe>
          </motion.div>
        </section>
      </div>
    </MainLayout>
  );
}
