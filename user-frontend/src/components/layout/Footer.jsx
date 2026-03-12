import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-gray-300 pt-16 pb-8 mt-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Grid */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              1A HK International
            </h3>

            <p className="mt-4 text-gray-400 leading-relaxed">
              1A HK International provides globally recognized Health, Safety &
              Environment qualifications designed to help professionals grow
              their careers with internationally accredited training.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-6 text-lg">
              <a
                target="_blank"
                href="https://www.facebook.com/profile.php?id=61578676434716"
                className="bg-slate-800 p-3 rounded-lg hover:bg-blue-600 transition"
              >
                <FaFacebookF />
              </a>

              <a
                target="_blank"
                href="https://www.linkedin.com/company/hk-international-uk/?viewAsMember=true"
                className="bg-slate-800 p-3 rounded-lg hover:bg-blue-500 transition"
              >
                <FaLinkedinIn />
              </a>

              <a
                target="_blank"
                href="https://www.instagram.com/hkinternational.uk/"
                className="bg-slate-800 p-3 rounded-lg hover:bg-pink-500 transition"
              >
                <FaInstagram />
              </a>

              <a
                target="_blank"
                href="#"
                className="bg-slate-800 p-3 rounded-lg hover:bg-sky-500 transition"
              >
                <FaTwitter />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5">Quick Links</h4>

            <ul className="space-y-3 text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/courses" className="hover:text-white transition">
                  Courses
                </Link>
              </li>

              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>

              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>

              <li>
                <Link to="/login" className="hover:text-white transition">
                  Student Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Certifications */}
          <div>
            <h4 className="text-white font-semibold mb-5">Accreditations</h4>

            <ul className="space-y-3 text-gray-400">
              <li className="hover:text-white transition">
                IOSH Certified Courses
              </li>
              <li className="hover:text-white transition">
                OSHA Training Programs
              </li>
              <li className="hover:text-white transition">
                OTHM Diploma Qualifications
              </li>
              <li className="hover:text-white transition">
                Ofqual Regulated Certifications
              </li>
              <li className="hover:text-white transition">
                Global Safety Consultancy
              </li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div>
            <h4 className="text-white font-semibold mb-5">Stay Updated</h4>

            <p className="text-gray-400 mb-4">
              Subscribe to receive course updates, certifications and industry
              insights.
            </p>

            {/* Email Input */}
            <div className="flex items-center bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
              <FaEnvelope className="ml-3 text-gray-400" />

              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent px-3 py-3 outline-none w-full text-sm"
              />

              <button className="bg-blue-600 px-4 py-3 hover:bg-blue-700 transition">
                <FaArrowRight />
              </button>
            </div>

            <p className="text-gray-400 mt-4 text-sm">
              Email:{" "}
              <a
                href="mailto:info@hkinternational.uk"
                className="text-blue-400 hover:underline"
              >
                info@hkinternational.uk
              </a>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} 1A HK International. All Rights
            Reserved.
          </p>

          {/* policies */}
          <p>
            Policies
          </p>

          {/* Credit */}
          <p className="mt-3 md:mt-0">
            Designed & Developed by{" "}
            <a
              href="https://anurag-pandey.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-medium transition"
            >
              Anurag Pandey
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
