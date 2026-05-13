// import { motion } from "framer-motion";
// import { FaEnvelope, FaMapMarkerAlt, FaGlobe } from "react-icons/fa";
// import MainLayout from "../../components/layout/MainLayout";
// import emailjs from "@emailjs/browser";
// import { useRef, useState } from "react";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";

// export default function Contact() {
//   const formRef = useRef();

//   const [loading, setLoading] = useState(false);
//   const [messageStatus, setMessageStatus] = useState("");
//   const [phone, setPhone] = useState("");

//   const offices = [
//     {
//       name: "UK Office",
//       address: `Office 108A 182-184 High Street North Area 1/1
// East Ham London E6 2JA
// United Kingdom`,
//       map: "https://maps.google.com/maps?q=East%20Ham%20London%20E6%202JA&t=&z=15&ie=UTF8&iwloc=&output=embed",
//     },
//     {
//       name: "Portugal Office",
//       address: `1A HK International
// Rua Hermano Neves 18, Piso 3, Escritório 7
// 1600-477 Lisboa
// Portugal`,
//       map: "https://maps.google.com/maps?q=Rua%20Hermano%20Neves%2018%20Lisbon&t=&z=15&ie=UTF8&iwloc=&output=embed",
//     },
//     {
//       name: "Mumbai Office (India)",
//       address: `VO-258, Raheja Platinum
// Andheri East, Mumbai
// Maharashtra 400059
// India`,
//       map: "https://maps.google.com/maps?q=Raheja%20Platinum%20Andheri%20East%20Mumbai&t=&z=15&ie=UTF8&iwloc=&output=embed",
//     },
//   ];

//   const sendEmail = (e) => {
//     e.preventDefault();

//     if (!phone) {
//       setMessageStatus("Please enter phone number");
//       return;
//     }

//     setLoading(true);
//     setMessageStatus("");

//     emailjs
//       .sendForm(
//         "service_x3pkgja",
//         "template_4dj6vh9",
//         formRef.current,
//         "X_iLS4ZvvvPycarnm",
//       )
//       .then(
//         () => {
//           setLoading(false);
//           setMessageStatus("✅ Message sent successfully!");
//           formRef.current.reset();
//           setPhone("");
//         },
//         () => {
//           setLoading(false);
//           setMessageStatus("❌ Failed to send message. Try again.");
//         },
//       );
//   };

//   return (
//     <MainLayout>
//       <div className="bg-slate-50 min-h-screen">
//         {/* HERO */}
//         <section className="pt-14 pb-10 text-center max-w-4xl mx-auto px-6">
//           <motion.h1
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-4xl md:text-5xl font-bold text-orange-600"
//           >
//             Contact 1A HK International
//           </motion.h1>

//           <p className="mt-4 text-gray-600 text-lg">
//             Reach our global team for internationally accredited health & safety
//             training and certification guidance.
//           </p>
//         </section>

//         {/* EMAIL CARD */}
//         <section className="max-w-6xl mx-auto px-6 mb-16 flex justify-center">
//           <div className="bg-white hover:bg-indigo-600 hover:text-white transition rounded-2xl shadow-md border p-8 flex items-center gap-4">
//             <div className="w-14 h-14 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xl">
//               <FaEnvelope />
//             </div>

//             <div>
//               <h3 className="font-semibold text-lg">Email Us</h3>
//               <p>info@hkinternational.uk</p>
//             </div>
//           </div>
//         </section>

//         {/* CONTACT FORM */}
//         <section className="max-w-6xl mx-auto px-6 pb-32">
//           <motion.div
//             initial={{ opacity: 0, y: 40 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="grid md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden"
//           >
//             {/* LEFT */}
//             <div className="bg-gradient-to-br from-indigo-900 to-blue-950 text-white p-12">
//               <h2 className="text-3xl font-bold mb-6">
//                 Start Your Global Safety Career
//               </h2>

//               <p className="text-indigo-100">
//                 International certifications and global safety programs trusted
//                 by professionals worldwide.
//               </p>

//               <div className="mt-10 space-y-3 text-indigo-100">
//                 <p>✔ IOSH Certified Programs</p>
//                 <p>✔ ISO Lead Auditor Courses</p>
//                 <p>✔ OTHM Diplomas</p>
//                 <p>✔ Global HSE Certifications</p>
//                 <p>✔ UK & EU Based Training</p>
//               </div>
//             </div>

//             {/* FORM */}
//             <div className="p-10 bg-orange-50">
//               <form ref={formRef} onSubmit={sendEmail} className="space-y-5">
//                 <input
//                   type="text"
//                   name="user_name"
//                   placeholder="Full Name"
//                   required
//                   className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none"
//                 />

//                 <input
//                   type="email"
//                   name="user_email"
//                   placeholder="Email Address"
//                   required
//                   className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none"
//                 />

//                 {/* INTERNATIONAL PHONE INPUT */}

//                 <PhoneInput
//                   country={"gb"}
//                   value={phone}
//                   onChange={setPhone}
//                   inputClass="!w-full !py-6"
//                   containerClass="w-full"
//                   inputProps={{
//                     name: "phone",
//                     required: true,
//                   }}
//                 />

//                 <input
//                   type="text"
//                   name="country"
//                   placeholder="Country"
//                   required
//                   className="w-full border rounded-lg px-4 py-3"
//                 />

//                 <input
//                   type="text"
//                   name="company"
//                   placeholder="Company (Optional)"
//                   className="w-full border rounded-lg px-4 py-3"
//                 />

//                 <input
//                   type="text"
//                   name="subject"
//                   placeholder="Subject"
//                   required
//                   className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none"
//                 />

//                 <textarea
//                   name="message"
//                   rows="5"
//                   placeholder="Your Message"
//                   required
//                   className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none"
//                 />

//                 <motion.button
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.95 }}
//                   disabled={loading}
//                   className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold"
//                 >
//                   {loading ? "Sending..." : "Send Message"}
//                 </motion.button>

//                 {messageStatus && (
//                   <p className="text-center font-medium text-green-600">
//                     {messageStatus}
//                   </p>
//                 )}
//               </form>
//             </div>
//           </motion.div>
//         </section>

//         {/* OFFICES */}
//         <section className="max-w-7xl mx-auto px-6 pb-20 space-y-16">
//           {offices.map((office, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, y: 40 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.2 }}
//               viewport={{ once: true }}
//               className="grid md:grid-cols-2 bg-white rounded-3xl shadow-lg overflow-hidden border"
//             >
//               <div className="p-10">
//                 <div className="flex items-center gap-3 mb-4 text-indigo-700">
//                   <FaMapMarkerAlt />
//                   <h3 className="text-2xl font-bold">{office.name}</h3>
//                 </div>

//                 <p className="text-gray-600 whitespace-pre-line">
//                   {office.address}
//                 </p>
//               </div>

//               <iframe
//                 src={office.map}
//                 className="w-full h-[320px] border-0"
//                 loading="lazy"
//                 title={office.name}
//               />
//             </motion.div>
//           ))}
//         </section>
//       </div>
//     </MainLayout>
//   );
// }







import { motion } from "framer-motion";
import { FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import MainLayout from "../../components/layout/MainLayout";
import emailjs from "@emailjs/browser";
import { useRef, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import SEO from "../../components/SEO";
import { getPageKeywords } from "../../data/seoKeywords";

export default function Contact() {
  const formRef = useRef();

  const [loading, setLoading] = useState(false);
  const [messageStatus, setMessageStatus] = useState("");
  const [phone, setPhone] = useState("");

  const offices = [
    {
      name: "UK Office",
      country: "United Kingdom",
      street: "Office 108A, 182-184 High Street North, Area 1/1, East Ham",
      locality: "London",
      postal: "E6 2JA",
      countryCode: "GB",
      map: "https://maps.google.com/maps?q=East%20Ham%20London%20E6%202JA&t=&z=15&ie=UTF8&iwloc=&output=embed",
    },
    {
      name: "Portugal Office",
      country: "Portugal",
      street: "Rua Hermano Neves 18, Piso 3, Escritório 7",
      locality: "Lisboa",
      postal: "1600-477",
      countryCode: "PT",
      map: "https://maps.google.com/maps?q=Rua%20Hermano%20Neves%2018%20Lisbon&t=&z=15&ie=UTF8&iwloc=&output=embed",
    },
    {
      name: "Mumbai Office (India)",
      country: "India",
      street: "VO-258, Raheja Platinum, Andheri East",
      locality: "Mumbai",
      region: "Maharashtra",
      postal: "400059",
      countryCode: "IN",
      map: "https://maps.google.com/maps?q=Raheja%20Platinum%20Andheri%20East%20Mumbai&t=&z=15&ie=UTF8&iwloc=&output=embed",
    },
  ];

  const sendEmail = (e) => {
    e.preventDefault();

    if (!phone) {
      setMessageStatus("Please enter phone number");
      return;
    }

    setLoading(true);
    setMessageStatus("");

    emailjs
      .sendForm(
        "service_x3pkgja",
        "template_4dj6vh9",
        formRef.current,
        "X_iLS4ZvvvPycarnm"
      )
      .then(
        () => {
          setLoading(false);
          setMessageStatus("✅ Message sent successfully!");
          formRef.current.reset();
          setPhone("");
        },
        () => {
          setLoading(false);
          setMessageStatus("❌ Failed to send message. Try again.");
        }
      );
  };

  return (
    <MainLayout>
      <SEO
        title="Contact 1A HK International | HSE Training Enquiries – London, Mumbai, Lisbon"
        description="Contact 1A HK International for IOSH, OTHM, OSHA & ISO 45001 course enquiries. Offices in UK, India & Portugal. Online & classroom training available."
        keywords={getPageKeywords("contact")}
        url="https://hkinternational.uk/contact"
        image="/og-contact.png"
        schemaType="localbusiness"
        localBusinessData={{ telephone: "+44 000 000 0000" }}
        geoRegion="GB"
      />

      <div className="bg-slate-50 min-h-screen">
        {/* HERO */}
        <section className="pt-14 pb-10 text-center max-w-4xl mx-auto px-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-orange-600"
          >
            Contact 1A HK International
          </motion.h1>

          <p className="mt-4 text-gray-600 text-lg">
            Reach our global team for internationally accredited health &
            safety training and certification guidance.
          </p>
        </section>

        {/* EMAIL CARD */}
        <section className="max-w-6xl mx-auto px-6 mb-16 flex justify-center">
          <a
            href="mailto:info@hkinternational.uk"
            aria-label="Email 1A HK International at info@hkinternational.uk"
            className="bg-white hover:bg-indigo-600 hover:text-white transition rounded-2xl shadow-md border p-8 flex items-center gap-4"
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xl">
              <FaEnvelope aria-hidden="true" />
            </div>

            <div>
              <h2 className="font-semibold text-lg">Email Us</h2>
              <p>info@hkinternational.uk</p>
            </div>
          </a>
        </section>

        {/* OFFICES */}
        <section
          className="max-w-7xl mx-auto px-6 pb-20 space-y-16"
          aria-label="Our global offices"
        >
          <h2 className="sr-only">Our Offices</h2>
          {offices.map((office, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 bg-white rounded-3xl shadow-lg overflow-hidden border"
            >
              <div className="p-10">
                <div className="flex items-center gap-3 mb-4 text-indigo-700">
                  <FaMapMarkerAlt aria-hidden="true" />
                  <h3 className="text-2xl font-bold">{office.name}</h3>
                </div>

                <address
                  itemScope
                  itemType="https://schema.org/PostalAddress"
                  className="text-gray-600 not-italic leading-relaxed"
                >
                  <span itemProp="streetAddress">{office.street}</span>
                  <br />
                  <span itemProp="addressLocality">{office.locality}</span>
                  {office.region && (
                    <>
                      , <span itemProp="addressRegion">{office.region}</span>
                    </>
                  )}{" "}
                  <span itemProp="postalCode">{office.postal}</span>
                  <br />
                  <span itemProp="addressCountry">{office.country}</span>
                </address>
              </div>

              <iframe
                src={office.map}
                className="w-full h-[320px] border-0"
                loading="lazy"
                title={`${office.name} location on map`}
              />
            </motion.div>
          ))}
        </section>

        {/* CONTACT FORM */}
        <section
          className="max-w-6xl mx-auto px-6 pb-32"
          aria-label="Contact enquiry form"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            {/* LEFT */}
            <div className="bg-gradient-to-br from-indigo-900 to-blue-950 text-white p-12">
              <h2 className="text-3xl font-bold mb-6">
                Start Your Global Safety Career
              </h2>

              <p className="text-indigo-100">
                International certifications and global safety programs trusted
                by professionals worldwide.
              </p>

              <ul className="mt-10 space-y-3 text-indigo-100 list-none p-0">
                <li>✔ IOSH Certified Programs</li>
                <li>✔ ISO Lead Auditor Courses</li>
                <li>✔ OTHM Diplomas</li>
                <li>✔ Global HSE Certifications</li>
                <li>✔ UK & EU Based Training</li>
              </ul>
            </div>

            {/* FORM */}
            <div className="p-10 bg-orange-50">
              <form ref={formRef} onSubmit={sendEmail} className="space-y-5">
                <label htmlFor="user_name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="user_name"
                  type="text"
                  name="user_name"
                  placeholder="Full Name"
                  required
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none"
                />

                <label htmlFor="user_email" className="sr-only">
                  Email Address
                </label>
                <input
                  id="user_email"
                  type="email"
                  name="user_email"
                  placeholder="Email Address"
                  required
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none"
                />

                <PhoneInput
                  country={"gb"}
                  value={phone}
                  onChange={setPhone}
                  inputClass="!w-full !py-6"
                  containerClass="w-full"
                  inputProps={{
                    name: "phone",
                    required: true,
                    "aria-label": "Phone number",
                  }}
                />

                <label htmlFor="country" className="sr-only">
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  name="country"
                  placeholder="Country"
                  required
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none"
                />

                <label htmlFor="company" className="sr-only">
                  Company (Optional)
                </label>
                <input
                  id="company"
                  type="text"
                  name="company"
                  placeholder="Company (Optional)"
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none"
                />

                <label htmlFor="subject" className="sr-only">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  required
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none"
                />

                <label htmlFor="message" className="sr-only">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Your Message"
                  required
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none"
                />

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                  aria-label="Send enquiry message to 1A HK International"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Message"}
                </motion.button>

                {messageStatus && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="text-center font-medium text-green-700"
                  >
                    {messageStatus}
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        </section>
      </div>
    </MainLayout>
  );
}
