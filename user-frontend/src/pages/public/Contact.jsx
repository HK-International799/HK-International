import { motion } from "framer-motion";
import { FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import MainLayout from "../../components/layout/MainLayout";

export default function Contact() {
  const offices = [
    {
      name: "UK Office",
      address: `Office 108A 182-184 High Street North Area 1/1
East Ham London E6 2JA
United Kingdom`,
      map: "https://maps.google.com/maps?q=East%20Ham%20London%20E6%202JA&t=&z=15&ie=UTF8&iwloc=&output=embed",
    },

    {
      name: "Portugal Office",
      address: `1A HK International
Rua Hermano Neves 18, Piso 3, Escritório 7
1600-477 Lisboa (Lisbon)
Portugal`,
      map: "https://maps.google.com/maps?q=Rua%20Hermano%20Neves%2018%20Lisbon&t=&z=15&ie=UTF8&iwloc=&output=embed",
    },

    {
      name: "Mumbai Office (India)",
      address: `VO-258, Raheja Platinum
Off Andheri-Kurla Road, Sag Baug
Marol, Andheri East
Mumbai, Maharashtra 400059`,
      map: "https://maps.google.com/maps?q=Raheja%20Platinum%20Andheri%20East%20Mumbai&t=&z=15&ie=UTF8&iwloc=&output=embed",
    },
  ];

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen">
        {/* HERO */}

        <section className="pt-10 pb-10 text-center max-w-4xl mx-auto px-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-orange-700"
          >
            Contact HK International
          </motion.h1>

          <p className="mt-4 text-gray-600 text-lg leading-relaxed">
            Get in touch with our international team for guidance on globally
            accredited occupational health & safety certifications and
            professional training programs.
          </p>
        </section>

        {/* CONTACT INFO */}

        <section className="max-w-6xl mx-auto px-2 mb-16 flex justify-center">
          <div className=" bg-linear-to-r from-white hover:from-indigo-600 hover:to-orange-600 hover:text-white rounded-2xl shadow-md border p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xl">
                <FaEnvelope />
              </div>

              <div>
                <h3 className="font-semibold text-lg">Email Us</h3>
                <p className="">info@hkinternational.uk</p>
              </div>
            </div>
          </div>
        </section>

        {/* OFFICES */}

        <section className="max-w-7xl mx-auto px-6 pb-24 space-y-16">
          {offices.map((office, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 bg-white rounded-3xl shadow-lg overflow-hidden border"
            >
              {/* ADDRESS */}

              <div className="p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4 text-indigo-700">
                  <FaMapMarkerAlt />
                  <h3 className="text-2xl font-bold">{office.name}</h3>
                </div>

                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {office.address}
                </p>
              </div>

              {/* MAP */}

              <iframe
                src={office.map}
                className="w-full h-[320px] md:h-full border-0"
                loading="lazy"
              ></iframe>
            </motion.div>
          ))}
        </section>

        {/* CONTACT FORM */}

        <section className="max-w-6xl mx-auto px-6 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            {/* LEFT SIDE */}

            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-12">
              <h2 className="text-3xl font-bold mb-6">
                Start Your Global Safety Career
              </h2>

              <p className="text-indigo-100 leading-relaxed">
                HK International provides internationally accredited training
                programs designed to help professionals build a strong career in
                occupational health & safety, environmental management, and
                compliance auditing.
              </p>

              <div className="mt-10 space-y-3 text-indigo-100">
                <p>✔ IOSH Certified Courses</p>
                <p>✔ ISO Lead Auditor Programs</p>
                <p>✔ OTHM Professional Diplomas</p>
                <p>✔ Global HSE Certifications</p>
              </div>
            </div>

            {/* FORM */}

            <div className="p-10 bg-linear-to-br from-transparent to-orange-200">
              <form className="space-y-6">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full border rounded-lg px-4 py-3 focus:ring-1 focus:ring-indigo-700 outline-none"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full border rounded-lg px-4 py-3 focus:ring-1 focus:ring-indigo-700 outline-none"
                />

                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full border rounded-lg px-4 py-3 focus:ring-1 focus:ring-indigo-700 outline-none"
                />

                <textarea
                  rows="5"
                  placeholder="Your Message"
                  className="w-full border rounded-lg px-4 py-3 focus:ring-1 focus:ring-indigo-700 outline-none"
                ></textarea>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold shadow-md transition"
                >
                  Send Message
                </motion.button>
              </form>
            </div>
          </motion.div>
        </section>
      </div>
    </MainLayout>
  );
}
