import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";
import { useState } from "react";

export default function Footer() {
  const [activePolicy, setActivePolicy] = useState(null);

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
          <ul className="flex gap-1">
            <li>
              <button
                onClick={() => setActivePolicy("refund")}
                className="hover:text-orange-600 transition"
              >
                Refund & Cancellation Policy
              </button>
            </li>

            <li>
              <button
                onClick={() => setActivePolicy("terms")}
                className="hover:text-white transition"
              >
                Terms & Conditions
              </button>
            </li>
          </ul>

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

      {activePolicy && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 max-w-3xl w-full rounded-2xl shadow-2xl border border-slate-700 relative">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-2xl font-semibold text-white tracking-wide">
                {activePolicy === "refund"
                  ? "Refund & Cancellation Policy"
                  : "Terms & Conditions"}
              </h2>

              <button
                onClick={() => setActivePolicy(null)}
                className="text-gray-400 hover:text-red-400 text-xl transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div
              className="p-6 text-gray-300 text-sm leading-relaxed max-h-[70vh] overflow-y-auto space-y-4 select-none custom-scrollbar"
              onCopy={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "c") e.preventDefault();
              }}
            >
              {activePolicy === "refund" ? (
                <>
                  <h3 className="text-white font-semibold">
                    Refund and Cancellation Policy
                  </h3>
                  <p>Refund and Cancellation Policy HK International</p>

                  <h4 className="text-white font-medium">1. Introduction</h4>
                  <p>
                    This Refund and Cancellation Policy applies to all training
                    programmes, services, and products offered by HK
                    International through the website hkinternational.uk or via
                    direct enrolment. By enrolling in any course, you agree to
                    this policy.
                  </p>

                  <h4 className="text-white font-medium">
                    2. Course Fees and Payment
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      All course fees must be paid as per the agreed terms.
                    </li>
                    <li>
                      Payment may be made in full or through approved
                      instalment/EMI options.
                    </li>
                    <li>
                      Enrolment is confirmed only after receipt of payment.
                    </li>
                  </ul>

                  <h4 className="text-white font-medium">3. Refund Policy</h4>
                  <p className="font-medium text-gray-200">
                    3.1 General Policy
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      All fees paid are strictly non-refundable, except under
                      specific conditions outlined below.
                    </li>
                    <li>
                      Refund requests must be submitted in writing via email.
                    </li>
                  </ul>

                  <p className="font-medium text-gray-200">
                    3.2 Eligible Refund Cases
                  </p>
                  <p>
                    A refund may be considered only in the following situations:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      If HK International cancels a course and no alternative is
                      offered
                    </li>
                    <li>Duplicate payment made by the learner</li>
                    <li>Payment made in error (subject to verification)</li>
                  </ul>
                  <p>
                    In such cases, refunds will be processed after
                    administrative deductions.
                  </p>

                  <p className="font-medium text-gray-200">
                    3.3 Non-Refundable Situations
                  </p>
                  <p>No refund will be provided in the following cases:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Change of mind after enrolment</li>
                    <li>Failure to attend classes (online or classroom)</li>
                    <li>Failure to complete the course</li>
                    <li>Withdrawal after course commencement</li>
                    <li>Failure in assessments or examinations</li>
                    <li>Delay or rejection by awarding bodies</li>
                    <li>Visa rejection or personal circumstances</li>
                    <li>
                      Technical issues on learner’s side (internet, device,
                      etc.)
                    </li>
                  </ul>

                  <h4 className="text-white font-medium">
                    4. Cancellation Policy
                  </h4>
                  <p className="font-medium text-gray-200">
                    4.1 Cancellation by Learner
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Once enrolled, cancellation is not permitted after course
                      access is granted or classes have commenced
                    </li>
                    <li>
                      Prior to course start, cancellation requests may be
                      considered, but refund is not guaranteed
                    </li>
                  </ul>

                  <p className="font-medium text-gray-200">
                    4.2 Cancellation by HK International
                  </p>
                  <p>HK International reserves the right to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Cancel or postpone a course due to:
                      <ul className="list-disc pl-5">
                        <li>Insufficient enrolment</li>
                        <li>Operational reasons</li>
                        <li>Unforeseen circumstances</li>
                      </ul>
                    </li>
                  </ul>

                  <p>In such cases, learners will be offered:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Alternative batch or schedule, OR</li>
                    <li>Credit note for future use, OR</li>
                    <li>Partial/full refund (at our discretion)</li>
                  </ul>

                  <h4 className="text-white font-medium">5. Transfer Policy</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Course enrolment may be transferred to another batch
                      (subject to approval)
                    </li>
                    <li>
                      Transfer to another learner is not permitted without
                      written consent
                    </li>
                    <li>Administrative charges may apply</li>
                  </ul>

                  <h4 className="text-white font-medium">
                    6. EMI / Instalment Payments
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Learners opting for EMI/payment plans must continue
                      payments as agreed
                    </li>
                    <li>
                      Cancellation of enrolment does not cancel EMI obligations
                    </li>
                    <li>Any unpaid dues remain payable in full</li>
                  </ul>

                  <h4 className="text-white font-medium">
                    7. Administrative Charges
                  </h4>
                  <p>
                    HK International reserves the right to deduct
                    administrative, processing, and banking charges from any
                    approved refund.
                  </p>

                  <h4 className="text-white font-medium">8. Processing Time</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Approved refunds will be processed within 15–30 working
                      days
                    </li>
                    <li>
                      Refunds will be made using the original payment method
                      wherever possible
                    </li>
                  </ul>

                  <h4 className="text-white font-medium">
                    9. Exceptional Circumstances
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      In rare and genuine cases, HK International may consider
                      refund requests at its sole discretion
                    </li>
                    <li>Supporting documents may be required</li>
                  </ul>

                  <h4 className="text-white font-medium">
                    10. Contact for Refund Requests
                  </h4>
                  <p>
                    All refund or cancellation requests must be submitted to:
                    info@hkinternational.uk
                  </p>

                  <p className="text-red-400 font-medium pt-2">
                    Strong Compliance Statement: HK International follows a
                    strict no-refund policy to maintain fairness, commitment,
                    and resource allocation across all learners and training
                    programmes.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-white font-semibold">
                    Terms and Conditions Policy
                  </h3>
                  <p>Terms and Conditions</p>
                  <p>HK International</p>

                  <h4 className="text-white font-medium">1. Introduction</h4>
                  <p>
                    Welcome to HK International (“we”, “our”, “us”).<br/> These Terms
                    and Conditions govern your use of our website
                    hkinternational.uk and our training services, including
                    online and classroom-based programmes in Occupational
                    Health, Safety, Environment, Risk Management, and related
                    professional fields. By accessing our website or enrolling
                    in our courses, you agree to be bound by these Terms.
                  </p>

                  <h4 className="text-white font-medium">2. About Us</h4>
                  <p>
                    HK International is a professional training organisation
                    offering internationally recognised training programmes,
                    including (but not limited to):
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>IOSH (UK) courses</li>
                    <li>OTHM (UK) regulated qualifications</li>
                    <li>OSHA (USA) programmes</li>
                    <li>PECB (Canada) training</li>
                    <li>CIEH (UK) courses</li>
                  </ul>
                  <p>
                    We deliver training to individuals and organisations
                    globally through online and in-person modes.
                  </p>

                  <h4 className="text-white font-medium">
                    3. Course Enrolment
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Enrolment is confirmed only after full or partial payment
                      is received.
                    </li>
                    <li>
                      Learners must provide accurate personal and professional
                      information.
                    </li>
                    <li>
                      We reserve the right to accept or reject any enrolment
                      without explanation.
                    </li>
                  </ul>

                  <h4 className="text-white font-medium">
                    4. Fees and Payments
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Course fees must be paid as per the agreed payment plan.
                    </li>
                    <li>
                      Payments may be made via approved gateways, bank transfer,
                      or other authorised methods.
                    </li>
                    <li>
                      Any additional charges (taxes, bank fees, currency
                      conversion, etc.) are the responsibility of the learner.
                    </li>
                  </ul>

                  <h4 className="text-white font-medium">5. Refund Policy</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Fees once paid are non-refundable, except in exceptional
                      circumstances at our discretion.
                    </li>
                    <li>
                      If a course is cancelled by us, a full or partial refund
                      or alternative option may be provided.
                    </li>
                  </ul>
                  <p>No refunds will be issued for:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Non-attendance</li>
                    <li>Failure to complete the course</li>
                    <li>Withdrawal after course commencement</li>
                  </ul>

                  <h4 className="text-white font-medium">6. Course Delivery</h4>
                  <p>Courses may be delivered:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Online (live or recorded)</li>
                    <li>Classroom-based</li>
                    <li>Blended learning</li>
                  </ul>
                  <p>We reserve the right to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Reschedule sessions</li>
                    <li>Change trainers</li>
                    <li>Modify delivery format</li>
                  </ul>

                  <h4 className="text-white font-medium">7. Certification</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Certification is subject to:</li>
                  </ul>
                  <ul className="list-disc pl-10 space-y-1">
                    <li>Successful completion of course requirements</li>
                    <li>Assessment outcomes by the relevant awarding body</li>
                  </ul>
                  <p>
                    HK International does not guarantee certification, as final
                    decisions are made by awarding organisations such as IOSH,
                    OTHM, and others.
                  </p>

                  <h4 className="text-white font-medium">
                    8. Learner Responsibilities
                  </h4>
                  <p>Learners must:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Attend sessions regularly</li>
                    <li>Submit assignments honestly</li>
                    <li>Follow all academic integrity rules</li>
                    <li>
                      Avoid plagiarism and strictly avoid use of AI tools in
                      assessments where prohibited
                    </li>
                  </ul>
                  <p>Any malpractice may result in:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Disqualification</li>
                    <li>Reporting to awarding bodies</li>
                    <li>Cancellation of enrolment without refund</li>
                  </ul>

                  <h4 className="text-white font-medium">
                    9. Intellectual Property
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      All course materials, content, and resources are the
                      property of HK International or its partners.
                    </li>
                  </ul>
                  <p>Materials must not be:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Copied</li>
                    <li>Shared</li>
                    <li>Reproduced</li>
                  </ul>
                  <p>without written permission.</p>

                  <h4 className="text-white font-medium">10. Use of Website</h4>
                  <p>You agree not to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Use the website for unlawful purposes</li>
                    <li>Attempt to hack, disrupt, or misuse the platform</li>
                    <li>Share false or misleading information</li>
                  </ul>

                  <h4 className="text-white font-medium">
                    11. Limitation of Liability
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>HK International is not liable for:</li>
                  </ul>
                  <ul className="list-disc pl-10 space-y-1">
                    <li>Any indirect or consequential losses</li>
                    <li>Career outcomes or employment results</li>
                  </ul>
                  <p>
                    Our services are intended to support professional
                    development but do not guarantee job placement or promotion.
                  </p>

                  <h4 className="text-white font-medium">
                    12. Data Protection
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      We collect and process personal data in accordance with
                      applicable data protection laws.
                    </li>
                    <li>Your information will be used only for:</li>
                  </ul>
                  <ul className="list-disc pl-10 space-y-1">
                    <li>Course administration</li>
                    <li>Communication</li>
                    <li>Certification processes</li>
                  </ul>

                  <h4 className="text-white font-medium">
                    13. Third-Party Accreditation
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Some courses are delivered in partnership with external
                      awarding bodies.
                    </li>
                    <li>Their terms and conditions may also apply.</li>
                  </ul>

                  <h4 className="text-white font-medium">
                    14. Changes to Terms
                  </h4>
                  <p>
                    HK International reserves the right to update these Terms
                    and Conditions at any time. Continued use of our services
                    indicates acceptance of any changes.
                  </p>

                  <h4 className="text-white font-medium">15. Governing Law</h4>
                  <p>
                    These Terms shall be governed in accordance with applicable
                    laws and international business practices.
                  </p>

                  <h4 className="text-white font-medium">16. Contact Us</h4>
                  <p>For any queries, please contact:</p>
                  <p>HK International</p>
                  <p>Website: https://hkinternational.uk</p>
                  <p>Email: info@hkinternational.uk</p>

                  <p className="text-green-400 font-medium pt-2">
                    Final Statement: HK International is committed to
                    maintaining the highest standards of academic integrity,
                    professional ethics, and global compliance in all its
                    training programmes.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
