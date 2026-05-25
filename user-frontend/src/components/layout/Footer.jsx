import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useState } from "react";

/* All 27 accredited courses — used to build internal links for SEO crawlability. */
const ALL_COURSES = [
  { id: "iosh-managing-safely", title: "IOSH Managing Safely Certificate" },
  { id: "iosh-level3", title: "IOSH Level 3 Certificate in OSH" },
  { id: "othm-iqa-award", title: "OTHM Level 3 Award in IQA" },
  { id: "othm-iqa-certificate", title: "OTHM Level 4 Certificate in IQA" },
  {
    id: "othm-level5-law",
    title: "OTHM Level 5 Award in Health and Safety Law",
  },
  {
    id: "othm-level6",
    title: "OTHM Level 6 Diploma in Occupational Health and Safety",
  },
  {
    id: "othm-level7-ohs",
    title: "OTHM Level 7 Diploma in Occupational Health and Safety",
  },
  { id: "othm-level7-risk", title: "OTHM Level 7 Diploma in Risk Management" },
  {
    id: "othm-level7-environment",
    title: "OTHM Level 7 Diploma in Environmental Management",
  },
  {
    id: "iso-45001-auditor",
    title: "ISO 45001 Lead Auditor Certificate (PECB Canada)",
  },
  {
    id: "iso-9001-auditor",
    title: "ISO 9001 Lead Auditor Certificate (PECB Canada)",
  },
  {
    id: "osha-construction",
    title: "OSHA 30 Hour Construction Safety Certificate (USA)",
  },
  {
    id: "osha-general",
    title: "OSHA 30 Hour General Industry Certificate (USA)",
  },
  { id: "cieh-level1-food", title: "CIEH Level 1 Award in Food Safety" },
  { id: "cieh-level2-food", title: "CIEH Level 2 Award in Food Safety" },
  { id: "cieh-level3-food", title: "CIEH Level 3 Award in Food Safety" },
  { id: "cieh-level2-firstaid", title: "CIEH Level 2 Award in First Aid" },
  { id: "cieh-level3-firstaid", title: "CIEH Level 3 Award in First Aid" },
  { id: "esc-l6-d-idhse", title: "ESC Level 6 International Diploma in HSE" },
  { id: "esc-l7-d-osh", title: "ESC Level 7 Diploma in OSH" },
  {
    id: "esc-l7-d-psm",
    title: "ESC Level 7 Diploma in Process Safety Management",
  },
  { id: "eosh-train-the-trainer", title: "EOSH Train the Trainer Certificate" },
  {
    id: "she-hse-plan-training",
    title: "SHE / HSE Plan Development & Implementation",
  },
  { id: "bbs-training", title: "Behaviour Based Safety (BBS) Training" },
  { id: "confined-space-safety", title: "Confined Space Safety Training" },
  { id: "permit-to-work", title: "Permit to Work (PTW) Training" },
  { id: "e-waste-management", title: "E-Waste Management Training" },
];

export default function Footer() {
  const [activePolicy, setActivePolicy] = useState(null);
  const currentYear = new Date().getFullYear();

  return (
    <footer
      aria-label="Footer"
      className="bg-slate-950 text-gray-300 pt-16 pb-8 mt-10 border-t border-slate-800 pl-14 pr-2"
    >
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

            <address
              itemScope
              itemType="https://schema.org/PostalAddress"
              className="mt-4 text-gray-400 text-sm not-italic leading-relaxed"
            >
              <FaMapMarkerAlt
                className="inline mr-2 text-indigo-400"
                aria-hidden="true"
              />
              <span itemProp="streetAddress">
                Office 108A, 182-184 High Street North, East Ham
              </span>
              ,&nbsp;
              <span itemProp="addressLocality">London</span>&nbsp;
              <span itemProp="postalCode">E6 2JA</span>,&nbsp;
              <span itemProp="addressCountry">United Kingdom</span>
            </address>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer quick links">
            <h4 className="text-white font-semibold mb-5">Quick Links</h4>

            <ul className="space-y-3 text-gray-400">
              <li>
                <Link
                  to="/"
                  title="1A HK International home page"
                  className="hover:text-white transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/courses"
                  title="Browse all 27 accredited HSE courses"
                  className="hover:text-white transition"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  title="About 1A HK International"
                  className="hover:text-white transition"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  title="Contact 1A HK International offices"
                  className="hover:text-white transition"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  title="Student login portal"
                  className="hover:text-white transition"
                >
                  Student Login
                </Link>
              </li>
              {/* <li>
                <Link
                  to="/ao/login"
                  title="Authorised Officer login"
                  className="hover:text-white transition"
                >
                  AO Login
                </Link>
              </li> */}
            </ul>
          </nav>

          {/* Accreditations */}
          <div>
            <h4 className="text-white font-semibold mb-5">Accreditations</h4>

            <ul className="space-y-3 text-gray-400">
              <li>IOSH (UK) Approved Courses</li>
              <li>OTHM (UK) Ofqual Regulated</li>
              <li>PECB (Canada) Certified</li>
              <li>OSHA (USA) Training</li>
              <li>CIEH (UK) Approved</li>
              <li>European Safety Council</li>
              <li>EOSH (UK) Approved</li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h4 className="text-white font-semibold mb-5">Stay Connected</h4>

            <p className="text-gray-400 mb-4">
              Follow us on social media for course updates and industry
              insights.
            </p>

            <div className="flex gap-3 mt-2 text-lg">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.facebook.com/profile.php?id=61578676434716"
                title="Follow 1A HK International on Facebook"
                aria-label="Follow 1A HK International on Facebook"
                className="bg-slate-800 p-3 rounded-lg hover:bg-blue-600 transition"
              >
                <FaFacebookF aria-hidden="true" />
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.linkedin.com/company/hk-international-uk/?viewAsMember=true"
                title="Follow 1A HK International on LinkedIn"
                aria-label="Follow 1A HK International on LinkedIn"
                className="bg-slate-800 p-3 rounded-lg hover:bg-blue-500 transition"
              >
                <FaLinkedinIn aria-hidden="true" />
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.instagram.com/hkinternational.uk/"
                title="Follow 1A HK International on Instagram"
                aria-label="Follow 1A HK International on Instagram"
                className="bg-slate-800 p-3 rounded-lg hover:bg-pink-500 transition"
              >
                <FaInstagram aria-hidden="true" />
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://x.com/1a_hk85756"
                title="Follow 1A HK International on X (Twitter)"
                aria-label="Follow 1A HK International on X (Twitter)"
                className="bg-slate-800 p-3 rounded-lg hover:bg-sky-500 transition"
              >
                <FaTwitter aria-hidden="true" />
              </a>
            </div>

            <p className="text-gray-400 mt-4 text-sm">
              <FaEnvelope className="inline mr-2" aria-hidden="true" />
              <a
                href="mailto:info@hkinternational.uk"
                title="Email 1A HK International"
                className="text-blue-400 hover:underline"
              >
                info@hkinternational.uk
              </a>
            </p>
          </div>
        </div>

        {/* All Courses Internal Links (SEO) */}
        <nav
          aria-label="All accredited HSE courses"
          className="mt-14 pt-8 border-t border-slate-800"
        >
          <h4 className="text-white font-semibold mb-5">Our Courses</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-gray-400 text-sm list-none p-0">
            {ALL_COURSES.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/course/${c.id}`}
                  title={`View ${c.title} – 1A HK International`}
                  className="hover:text-white transition"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Office Locations */}
        <div className="mt-10 pt-8 border-t border-slate-800 grid sm:grid-cols-3 gap-6 text-sm text-gray-400">
          <address
            itemScope
            itemType="https://schema.org/PostalAddress"
            className="not-italic"
          >
            <h5 className="text-white font-semibold mb-2">United Kingdom</h5>
            <span itemProp="streetAddress">
              Office 108A, 182-184 High Street North, East Ham
            </span>
            <br />
            <span itemProp="addressLocality">London</span>{" "}
            <span itemProp="postalCode">E6 2JA</span>
            <br />
            <span itemProp="addressCountry">United Kingdom</span>
          </address>
          <address
            itemScope
            itemType="https://schema.org/PostalAddress"
            className="not-italic"
          >
            <h5 className="text-white font-semibold mb-2">Portugal</h5>
            <span itemProp="streetAddress">
              Rua Hermano Neves 18, Piso 3, Escritório 7
            </span>
            <br />
            <span itemProp="addressLocality">Lisboa</span>{" "}
            <span itemProp="postalCode">1600-477</span>
            <br />
            <span itemProp="addressCountry">Portugal</span>
          </address>
          <address
            itemScope
            itemType="https://schema.org/PostalAddress"
            className="not-italic"
          >
            <h5 className="text-white font-semibold mb-2">India</h5>
            <span itemProp="streetAddress">
              VO-258, Raheja Platinum, Andheri East
            </span>
            <br />
            <span itemProp="addressLocality">Mumbai</span>,{" "}
            <span itemProp="addressRegion">Maharashtra</span>{" "}
            <span itemProp="postalCode">400059</span>
            <br />
            <span itemProp="addressCountry">India</span>
          </address>
        </div>

        {/* Divider / Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <p>© {currentYear} 1A HK International. All Rights Reserved.</p>

          <ul className="flex gap-4 list-none p-0">
            <li>
              <button
                onClick={() => setActivePolicy("refund")}
                aria-label="View refund and cancellation policy"
                className="hover:text-orange-500 transition"
              >
                Refund & Cancellation Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePolicy("terms")}
                aria-label="View terms and conditions"
                className="hover:text-white transition"
              >
                Terms & Conditions
              </button>
            </li>
          </ul>

          <p>
            Designed & Developed by{" "}
            <a
              href="https://hkinternational.uk"
              target="_blank"
              rel="noopener noreferrer"
              title="1A HK International"
              className="text-blue-400 hover:text-blue-300 font-medium transition"
            >
              1A HK International
            </a>
          </p>
        </div>
      </div>

      {/* {activePolicy && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onContextMenu={(e) => e.preventDefault()}
          role="dialog"
          aria-modal="true"
          aria-label={
            activePolicy === "refund"
              ? "Refund and Cancellation Policy"
              : "Terms and Conditions"
          }
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 max-w-3xl w-full rounded-2xl shadow-2xl border border-slate-700 relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-2xl font-semibold text-white tracking-wide">
                {activePolicy === "refund"
                  ? "Refund & Cancellation Policy"
                  : "Terms & Conditions"}
              </h2>

              <button
                onClick={() => setActivePolicy(null)}
                aria-label="Close policy dialog"
                className="text-gray-400 hover:text-red-400 text-xl transition"
              >
                ✕
              </button>
            </div>

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
                  <p>
                    This Refund and Cancellation Policy applies to all training
                    programmes, services, and products offered by 1A HK
                    International through the website hkinternational.uk or via
                    its authorised representatives.
                  </p>
                  <p>
                    Refunds, where applicable, are processed within 14 working
                    days of an approved cancellation request and are subject to
                    deduction of any administrative, examination, or
                    accreditation-body fees already incurred.
                  </p>
                  <p>
                    Cancellation requests must be submitted in writing to
                    info@hkinternational.uk before course commencement.
                    Cancellations made after the course has started are
                    generally non-refundable.
                  </p>
                  <p className="text-green-400 font-medium pt-2">
                    1A HK International remains committed to transparent and
                    fair refund handling for all learners.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-white font-semibold">
                    Terms & Conditions
                  </h3>
                  <p>
                    By enrolling in any course or service provided by 1A HK
                    International, you agree to abide by these terms, including
                    those of the relevant accreditation body (IOSH, OTHM, PECB,
                    OSHA, CIEH, ESC, EOSH).
                  </p>
                  <p>
                    All course content, materials and certificates are
                    copyrighted and may not be reproduced, redistributed, or
                    used commercially without prior written permission.
                  </p>
                  <p>
                    Learners are expected to maintain academic integrity at all
                    times. Any breach may result in disqualification without
                    refund.
                  </p>
                  <p className="text-green-400 font-medium pt-2">
                    Final Statement: 1A HK International is committed to
                    maintaining the highest standards of academic integrity,
                    professional ethics, and global compliance in all its
                    training programmes.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )} */}




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
