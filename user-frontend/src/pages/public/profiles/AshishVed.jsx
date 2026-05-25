import React, { useState, useEffect, useRef, useCallback } from "react";
import MainLayout from "../../../components/layout/MainLayout";

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const ROLES = [
  "Head of Health, Safety & Environment",
  "NEBOSH Examiner & Lead Tutor",
  "ISO 45001 Lead Auditor",
  "30+ Years HSE Leadership",
];

const STATS = [
  {
    value: 98,
    unit: "%",
    label: "Client Satisfaction",
    desc: "98% of clients reported high satisfaction with services provided.",
  },
  {
    value: 96.7,
    unit: "%",
    label: "Safety Culture Uplift",
    desc: "96.7% of organisations reported improved safety culture and HSE compliance post-engagement.",
  },
  {
    value: 180,
    unit: "+",
    label: "HSE Audits Conducted",
    desc: "Comprehensive audits spanning oil & gas, construction, mining, and manufacturing sectors.",
  },
  {
    value: 30,
    unit: "+",
    label: "Years of Experience",
    desc: "Three decades of elite HSE leadership across 15+ countries worldwide.",
  },
];

const SYNOPSIS = [
  {
    id: "001",
    tag: "LEADERSHIP",
    text: "Highly motivated and proactive leader, driving organisational goals for Health, Safety and Environment performance and full compliance across Training Matrix requirements.",
  },
  {
    id: "002",
    tag: "AWARENESS",
    text: "Promoting Quality, Health, Safety and Environment awareness by ensuring QHSE compliance, job-specific training, and robust policy and procedure governance.",
  },
  {
    id: "003",
    tag: "AUDITING & COACHING",
    text: "Proactive approach to auditing HSEQ management systems and coaching employees on Behaviour Based Safety to achieve the highest standards across the organisation.",
  },
  {
    id: "004",
    tag: "TRAINING & PUBLISHING",
    text: "Expert in conducting and managing HSE training programmes. Independently authored and edited health and safety journals and articles for newspapers, magazines and websites internationally.",
  },
];

const AWARDS = [
  {
    title: "Falcon Talon Safety Excellence Award — 2023",
    sub: "Honoured by ISSP — International Society of Safety Professionals, USA.",
  },
  {
    title: "Safe Tech Hero Plus 2023",
    sub: "Excellence in Safety Leadership Award by Fire and Safety Trade Magazine — India.",
  },
];

const HIGHLIGHTS = [
  "Examiner for NEBOSH IGC and NEBOSH IDip — International Diploma.",
  "PDO (Petroleum Development Oman) approved trainer for Level 1 training courses.",
  "Published Occupational Safety and Health related articles in International Newspapers and Health and Safety trade magazines.",
  "Developed Health & Safety Policy at Work, Data Protection Policy, Equality & Disability policy, and Student Code of Conduct policy for Falcon Multi Services Ltd.",
  "Managing Accreditation of NEBOSH and IOSH courses and playing Lead Tutor role — conducted NEBOSH IGC, IOGC and HSW training at Amsterdam, UAE, India, Philippines, Indonesia and Thailand.",
  "Published articles in newspapers and international trade magazines on Health and Safety topics in Qatar, India and Nepal.",
  "Developed in-house HSE training programme and processed IADC approval for DIT courses for Falcon Multiservice Ltd.",
  "Instrumental in initiating Basic First Aid Training (Medic First Aid — ASHI) for Key Energy Services, Bahrain.",
  "Received recommendation and appreciation letters from prominent industry personnel acknowledging critical career contributions.",
  "Coordinated and achieved the highest standard to maintain Saudi Aramco QSA Quarterly Safety Audit for Arabian Drilling Company in Saudi Arabia.",
  "Achieved 100% training compliance for Aramco trainings whilst working with Arabian Drilling Company in Saudi Arabia.",
  "Instrumental in achieving rig Noble Charles Copeland 4 years LTI-free in Qatar and rig ADC 15 2 years LTI-free in Saudi Arabia.",
  "Recipient of Noble Charles Copeland Recognition Award for Medevac process on 16 August 2006 in Qatar.",
  "Instrumental in developing and editing content for Medical Website www.Mediket2000.com.",
  "Entrusted with marking and judging assessments as a NEBOSH Examiner for candidates appearing worldwide.",
];

const CAREER = [
  {
    period: "JAN 2021 — PRESENT",
    role: "Head of HSE Department",
    org: "H K International",
    loc: "Mumbai, India",
    lead: "Leading all aspects of HSE management at H K International to ensure safety and environmental standards exceed regulatory requirements — developing and implementing HSE management systems aligned with international standards, conducting thorough risk evaluations, and crafting mitigation strategies.",
    bullets: [
      "Achieved zero Lost Time Incidents (LTI) for 3 consecutive years, 45% reduction in recurring incidents, and 25% reduction in Total Recordable Incident Rate (TRIR).",
      "Ensured 100% compliance in safety audits, implemented Behaviour-Based Safety (BBS) programmes reducing unsafe behaviours by 30%, and mitigated over 216 critical hazards through risk assessments.",
      "Conducted over 180 HSE audits, improved key safety KPIs by over 40%, and achieved 99% adherence to internal safety protocols with a new HSE Management System.",
      "Facilitated monthly HSE reviews contributing to a 20% improvement in hazard closure rates and enhanced safety culture.",
    ],
    open: true,
  },
  {
    period: "AUG 2017 — JAN 2021",
    role: "Senior HSE Trainer & Manager",
    org: "Ray Skills International Development",
    loc: "Muscat, Sultanate of Oman",
    lead: "Senior HSE Manager & Trainer at Ray International Skills Development LLC, Muscat. NEBOSH and IOSH approved trainer and assessor; PDO approved HSE trainer; DCRP — Ministry of Manpower of Sultanate Oman approved HSE trainer.",
    bullets: [
      "Delivered HSE Trainings to clients including PDO, OXY — Occidental Petroleum Oman, Seeh Al Sarya Engineering, Zawawi Powertech Engineering, Punj Lloyd, OMIFCO and Global Chemicals.",
      "Conducted HSE Audits, Safety Observations, Risk Assessments and HSE performance evaluations.",
      "Prepared training documentation and ensured maintenance of certifications and cards.",
      "Maintained training standards; identified, implemented and maintained feedback on training facilities, materials and resources.",
    ],
  },
  {
    period: "JAN 2016 — AUG 2017",
    role: "Lead HSEQ Training Instructor",
    org: "Falcon Multi Services Ltd.",
    loc: "Mumbai, India",
    lead: "Lead Tutor for NEBOSH and IOSH courses and Senior Trainer for HSE courses across international locations.",
    bullets: [
      "Approved NEBOSH Lead Tutor & Practical Assessor for NEBOSH IGC, NEBOSH IOGC and NEBOSH HSW — conducted training at Amsterdam, UAE, India, Philippines, Indonesia and Thailand.",
      "Represented the Management team for NEBOSH Audit to maintain NEBOSH accreditation.",
      "Nominated Member of IOSH and approved IOSH trainer — conducted IOSH Managing Safely training programmes.",
    ],
  },
  {
    period: "MAR 2012 — AUG 2015",
    role: "Senior HSE Coordinator",
    org: "Key Energy Services",
    loc: "Kingdom of Bahrain",
    lead: "Safety and Occupational Health Specialist in the Awali Oilfield with operating company Tatweer Petroleum.",
    bullets: [
      "Led and supervised 8 Rig Site HSE Representatives based on sites.",
      "Carried out HSE Audits of Rig Sites, creating Action Items and following up on corrective actions.",
      "Carried out Incident Investigations, Root Cause Analysis and Action Items to prevent recurrence.",
      "Conducted in-house training sessions: Basic First Aid, H2S Awareness, Behaviour Based Safety, Safety Observation Data Process and Tatweer Petroleum HSE Induction.",
    ],
  },
  {
    period: "DEC 2009 — FEB 2012",
    role: "Rig Safety Training Coordinator",
    org: "Arabian Drilling Company",
    loc: "Saudi Arabia",
    lead: "Arabian Drilling Company (ADC) — a joint venture between IESCO and Services Petroliers Schlumberger S.A.",
    bullets: [
      "Conducted In-house HSE Trainings including Medic First Aid, H2S, SCBA, STOP, Fire Prevention and Behaviour Based Safety.",
      "Conducted audits, recommended improvement areas and remedial plans to meet ADC-QHSE training requirements.",
      "Achieved 100% compliance for ADC and client-based trainings for all employees.",
    ],
  },
  {
    period: "AUG 2004 — SEP 2009",
    role: "Medic — Safety",
    org: "Noble International Ltd.",
    loc: "Qatar, Bahrain & U.A.E.",
    lead: "Managing QHSE system and training employees on offshore jack-up rigs during drilling and work-over jobs across Qatar, Bahrain & U.A.E.",
    bullets: [],
  },
  {
    period: "SEP 2001 — JUL 2004",
    role: "Medic",
    org: "Noble International Ltd.",
    loc: "Qatar",
    lead: "Treatment of medical and surgical cases including first aid; coordinating with Rig Manager for QHSE system, safety meetings and health and safety presentations. Delivered ISO 14001 Awareness training.",
    bullets: [],
  },
  {
    period: "1991 — 2001",
    role: "Doctor / HSEO & Medical Practice",
    org: "Viking Offshore Drilling · Consulting Practice · Ketan Consultancy",
    loc: "India & Gulf",
    lead: "Attending medical and surgical emergencies on offshore drilling ships; conducting weekly safety meetings, HSEQ inspections and presentations. Private medical consulting practice. Medical content editing for mediket2000.com.",
    bullets: [],
  },
  {
    period: "1988 — 1991",
    role: "Resident Doctor",
    org: "Bhatia General Hospital & Suchak Hospital",
    loc: "Mumbai, India",
    lead: "Resident Doctor across General Medicine, General Surgery, Orthopaedics, Paediatrics, ICU and ICCU. Handled OPD, assisted in surgeries and provided ICU, ICCU, ER & Casualty support.",
    bullets: [],
  },
];

const EDUCATION = [
  {
    year: "2017",
    title: "MBA — Fire Protection & Safety Management",
    inst: "Jaipur National University — India",
  },
  {
    year: "2015",
    title: "B.Sc. — Applied Science",
    inst: "Monad University — India",
  },
  {
    year: "2014",
    title: "NEBOSH International Diploma in OHS — Level 6",
    inst: "United Kingdom",
  },
  {
    year: "2012",
    title: "DHM — Doctorate of Homeopathic Medicine (PG Degree)",
    inst: "British Institute of Homeopathy",
  },
  {
    year: "2008",
    title: "Diploma in Industrial Safety",
    inst: "National Institute of Labor Education & Management — India",
  },
  {
    year: "1988",
    title: "DHMS — Medical Graduation",
    inst: "DSH Medical College — Pune, India",
  },
];

const CERTS = [
  "NEBOSH International Diploma in OHS (Level 6, UK) — equivalent to NQF Level 6 / NVQ Level 5 Diploma",
  "PTLLS — Certified Train The Trainer, UK (CIEH), January 2012",
  "ISO 45001 OHSMS IRCA Certified Lead Auditor",
  "ISO 14001 Lead Auditor — Exemplar Global Certified",
  "IEMA — Environment Management System, IEMA Certified",
  "DNV-IRCA Certified Lead Auditor — OHSAS 18001, April 2014",
  "Certified Instructional Designer (CID) — Carlton Management Institute, USA, Jul 2015",
  "NEBOSH International General Certificate (Level 3, UK), 2009",
  "RSP — Registered Safety Professional (IBOEHS, USA), 2017",
  "Level 3 Instructor Trainer — First Aid/CPR/AED (ASHI), renewed 2012",
  "H2S Safety Awareness & OSH Trainer — OSHA Academy / RRC Training Middle East, 2014",
  "Introduction to Well Control (IADC) — WCS, Saudi Arabia, 2010",
  "Advance Fire Fighting Training — Fire-Direct Institute, Dammam, Saudi Arabia, 2010",
  "ITLS — International Trauma and Life Support (ACoEP endorsed), 2008",
  "ACLS & BLS — Advanced & Basic Life Support (AHA endorsed), 2008",
  "STCW 95 — EFA, PST, PSSR; Firefighting & Fire Prevention; HUET & Sea Survival",
  "Helicopter Landing Officer — QISC, Doha, Qatar",
  "Schlumberger SIPP Level 3 Instructor, HARC Level 3 & Mechanical Lifting Supervisor",
  "Accident Investigation & Root Cause Analysis — Dhahran, KSA, 2010",
];

const MEMBERSHIPS = [
  { ab: "FIIRSM", name: "Fellow Member — IIRSM, U.K.", id: "No. 313002" },
  { ab: "FOTHM", name: "Fellow Member — OTHM, UK", id: "No. F24300308" },
  {
    ab: "SAIOSH",
    name: "Chartered Member — South African Institution of Occupational Safety & Health",
    id: "No. 72720483",
  },
  {
    ab: "ASSP",
    name: "Professional Member — American Society of Safety Professionals, USA",
    id: "No. 010219562",
  },
  { ab: "CertIOSH", name: "Certified Member — IOSH, U.K.", id: "No. 172666" },
];

const LANGUAGES = [
  { name: "English", level: "Native / Expert", pct: 100 },
  { name: "Hindi", level: "Fluent", pct: 88 },
  { name: "Arabic", level: "Basic", pct: 35 },
  { name: "French", level: "Basic", pct: 30 },
];

/* ─────────────────────────────────────────
   HOOKS
───────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCountUp(target, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let cur = 0;
    const isFloat = String(target).includes(".");
    const step = target / 55;
    const tick = () => {
      cur += step;
      if (cur >= target) {
        setVal(isFloat ? parseFloat(target.toFixed(1)) : target);
        return;
      }
      setVal(isFloat ? parseFloat(cur.toFixed(1)) : Math.floor(cur));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target]);
  return val;
}

function useTypewriter(words) {
  const [text, setText] = useState("");
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const cur = words[wi];
    if (!deleting) {
      if (ci <= cur.length) {
        const t = setTimeout(() => {
          setText(cur.slice(0, ci));
          setCi((c) => c + 1);
        }, 72);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setDeleting(true), 2200);
        return () => clearTimeout(t);
      }
    } else {
      if (ci >= 0) {
        const t = setTimeout(() => {
          setText(cur.slice(0, ci));
          setCi((c) => c - 1);
        }, 36);
        return () => clearTimeout(t);
      } else {
        setDeleting(false);
        setWi((w) => (w + 1) % words.length);
        setCi(0);
      }
    }
  }, [ci, deleting, wi, words]);
  return text;
}

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */

function SectionLabel({ num, title }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      className="flex items-end gap-5 mb-12"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(20px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      <div style={{ lineHeight: 1 }}>
        <div
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: "clamp(3rem,8vw,6rem)",
            fontWeight: 300,
            color: "#c8a96e",
            opacity: 0.25,
            letterSpacing: "-0.02em",
            lineHeight: 0.85,
          }}
        >
          {num}
        </div>
      </div>
      <div
        style={{ borderBottom: "2px solid #1e3a5f", paddingBottom: 8, flex: 1 }}
      >
        <h2
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: "clamp(1.6rem,3.5vw,2.6rem)",
            fontWeight: 600,
            color: "#1e3a5f",
            letterSpacing: "0.02em",
            lineHeight: 1,
          }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}

function StatCard({ value, unit, label, desc, active }) {
  const displayed = useCountUp(value, active);
  const isFloat = String(value).includes(".");
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      style={{
        background: "#fff",
        border: "1px solid #e8e0d4",
        borderRadius: 2,
        padding: "2rem 1.75rem",
        position: "relative",
        overflow: "hidden",
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(24px)",
        transition:
          "opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease",
        boxShadow: "0 1px 4px rgba(30,58,95,0.06)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 8px 32px rgba(30,58,95,0.12)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 4px rgba(30,58,95,0.06)")
      }
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 4,
          height: "100%",
          background: "#1e3a5f",
        }}
      />
      <div
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: "clamp(2.8rem,5vw,4rem)",
          fontWeight: 700,
          color: "#1e3a5f",
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {isFloat ? displayed.toFixed(1) : displayed}
        <span style={{ fontSize: "0.45em", color: "#c8a96e", fontWeight: 400 }}>
          {unit}
        </span>
      </div>
      <div
        style={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#1e3a5f",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: '"Lato", sans-serif',
          fontSize: "0.82rem",
          color: "#6b7280",
          lineHeight: 1.6,
        }}
      >
        {desc}
      </div>
    </div>
  );
}

function CareerCard({ item, index }) {
  const [open, setOpen] = useState(item.open ?? false);
  const [ref, inView] = useInView(0.05);
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(20px)",
        transition: `opacity 0.6s ease ${index * 0.07}s, transform 0.6s ease ${index * 0.07}s`,
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e0d4",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: open
            ? "0 4px 20px rgba(30,58,95,0.1)"
            : "0 1px 4px rgba(30,58,95,0.04)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            padding: "1.25rem 1.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            borderLeft: open ? "4px solid #1e3a5f" : "4px solid transparent",
            transition: "border-color 0.3s ease",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#c8a96e",
                marginBottom: 4,
              }}
            >
              {item.period}
            </div>
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "1.2rem",
                fontWeight: 600,
                color: "#1e3a5f",
                lineHeight: 1.2,
                marginBottom: 2,
              }}
            >
              {item.role}
            </div>
            <div
              style={{
                fontFamily: '"Lato", sans-serif',
                fontSize: "0.85rem",
                color: "#6b7280",
              }}
            >
              {item.org} &nbsp;·&nbsp; {item.loc}
            </div>
          </div>
          <span
            style={{
              color: "#1e3a5f",
              fontSize: "1.4rem",
              fontWeight: 300,
              lineHeight: 1,
              transform: open ? "rotate(45deg)" : "none",
              transition: "transform 0.3s ease",
              marginTop: 4,
              flexShrink: 0,
            }}
          >
            +
          </span>
        </button>
        {open && (
          <div
            style={{
              padding: "0 1.5rem 1.5rem",
              borderTop: "1px solid #f0ebe3",
            }}
          >
            <p
              style={{
                fontFamily: '"Lato", sans-serif',
                fontSize: "0.9rem",
                color: "#374151",
                lineHeight: 1.75,
                margin: "1rem 0 0.75rem",
              }}
            >
              {item.lead}
            </p>
            {item.bullets.length > 0 && (
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {item.bullets.map((b, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      fontFamily: '"Lato", sans-serif',
                      fontSize: "0.85rem",
                      color: "#4b5563",
                      lineHeight: 1.7,
                      padding: "0.3rem 0",
                      borderBottom: "1px solid #f5f2ee",
                    }}
                  >
                    <span
                      style={{ color: "#c8a96e", flexShrink: 0, marginTop: 2 }}
                    >
                      ◆
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LangBar({ name, level, pct }) {
  const [ref, inView] = useInView(0.3);
  return (
    <div ref={ref} style={{ marginBottom: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#1e3a5f",
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: '"Montserrat", sans-serif',
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#c8a96e",
          }}
        >
          {level}
        </span>
      </div>
      <div
        style={{
          height: 3,
          background: "#e8e0d4",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: inView ? `${pct}%` : "0%",
            background: "linear-gradient(90deg, #1e3a5f, #c8a96e)",
            borderRadius: 2,
            transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}

function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 3,
        width: `${pct}%`,
        background: "linear-gradient(90deg,#1e3a5f,#c8a96e)",
        zIndex: 9999,
        transition: "width 0.1s linear",
      }}
    />
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function AshishVed() {
  const [showTop, setShowTop] = useState(false);
  const [statRef, statsInView] = useInView(0.2);
  const typeText = useTypewriter(ROLES);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const navLinks = ["About", "Career", "Education", "Credentials", "Contact"];

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Montserrat:wght@400;500;600;700;800&family=Lato:wght@300;400;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes shimmerGold {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        @keyframes drawLine {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }

        .anim-fadeup-0  { animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) both; }
        .anim-fadeup-1  { animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) 0.15s both; }
        .anim-fadeup-2  { animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) 0.28s both; }
        .anim-fadeup-3  { animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) 0.42s both; }
        .anim-fadeup-4  { animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) 0.56s both; }
        .anim-fadeup-5  { animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) 0.68s both; }
        .anim-fadein    { animation: fadeIn 1.2s ease 0.8s both; }

        .gold-shimmer {
          background: linear-gradient(120deg, #c8a96e 0%, #e8d4a0 40%, #c8a96e 60%, #9a7940 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerGold 4s linear infinite;
        }

        .cursor-blink {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #c8a96e;
          margin-left: 3px;
          vertical-align: text-bottom;
          animation: blink 1s step-end infinite;
        }

        .hk-section { padding: 5rem 0; border-top: 1px solid #e8e0d4; }

        .hk-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border: 1px solid rgba(200,169,110,0.4);
          background: rgba(200,169,110,0.06);
          border-radius: 1px;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #c8a96e;
        }

        .hk-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0.9rem 2rem;
          background: #1e3a5f;
          color: #fff;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.25s ease, transform 0.2s ease;
          border-radius: 1px;
        }
        .hk-btn-primary:hover { background: #152d4a; transform: translateY(-2px); }

        .hk-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0.9rem 2rem;
          background: transparent;
          color: #1e3a5f;
          border: 2px solid #1e3a5f;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.25s ease;
          border-radius: 1px;
        }
        .hk-btn-outline:hover { background: #1e3a5f; color: #fff; }

        .portrait-frame {
          position: relative;
        }
        .portrait-frame::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 20px;
          right: -20px;
          bottom: -20px;
          border: 2px solid rgba(200,169,110,0.3);
          border-radius: 1px;
          z-index: 0;
          pointer-events: none;
        }

        .cert-card {
          background: #fff;
          border: 1px solid #e8e0d4;
          border-radius: 2px;
          padding: 1rem 1.25rem;
          font-family: 'Lato', sans-serif;
          font-size: 0.84rem;
          color: #374151;
          line-height: 1.6;
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .cert-card:hover { box-shadow: 0 4px 16px rgba(30,58,95,0.1); border-color: #c8a96e; }
        .cert-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 0; height: 2px;
          background: linear-gradient(90deg, #1e3a5f, #c8a96e);
          transition: width 0.4s ease;
        }
        .cert-card:hover::before { width: 100%; }

        .highlight-item {
          display: flex;
          gap: 14px;
          padding: 0.9rem 0;
          border-bottom: 1px solid #f0ebe3;
          font-family: 'Lato', sans-serif;
          font-size: 0.87rem;
          color: #374151;
          line-height: 1.65;
          transition: color 0.2s ease;
        }
        .highlight-item:hover { color: #1e3a5f; }
        .highlight-item:last-child { border-bottom: none; }

        .contact-field {
          display: flex;
          gap: 16px;
          padding: 0.85rem 0;
          border-bottom: 1px solid #f0ebe3;
          align-items: flex-start;
        }
        .contact-field:last-child { border-bottom: none; }

        .award-card {
          background: linear-gradient(135deg, #fffdf9 0%, #fdf8f0 100%);
          border: 1px solid rgba(200,169,110,0.35);
          border-radius: 2px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.3s ease;
        }
        .award-card:hover { box-shadow: 0 8px 28px rgba(200,169,110,0.18); }
        .award-card::before {
          content: '★';
          position: absolute;
          top: -8px;
          right: 12px;
          font-size: 5rem;
          color: rgba(200,169,110,0.07);
          font-family: sans-serif;
          line-height: 1;
        }

        @media (max-width: 768px) {
          .hk-hero-grid { grid-template-columns: 1fr !important; }
          .hk-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .hk-synopsis-grid { grid-template-columns: 1fr !important; }
          .hk-edu-grid { grid-template-columns: 1fr !important; }
          .hk-certs-grid { grid-template-columns: 1fr !important; }
          .hk-mem-grid { grid-template-columns: 1fr 1fr !important; }
          .hk-lang-grid { grid-template-columns: 1fr !important; }
          .hk-contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <MainLayout>
        <div
          style={{
            background: "#faf8f5",
            minHeight: "100vh",
            overflowX: "hidden",
          }}
        >
          <ScrollProgress />

          {/* ── HERO ───────────────────────────────── */}
          <section
            style={{
              background:
                "linear-gradient(160deg, #0f2540 0%, #1e3a5f 60%, #253f68 100%)",
              position: "relative",
              overflow: "hidden",
              minHeight: "92vh",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Decorative diagonal */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                background: "#faf8f5",
                clipPath: "polygon(0 100%, 100% 100%, 100% 0)",
                zIndex: 2,
              }}
            />

            {/* Subtle texture overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(ellipse at 70% 50%, rgba(200,169,110,0.08) 0%, transparent 60%)",
                zIndex: 1,
              }}
            />

            {/* Geometric accent lines */}
            <div
              style={{
                position: "absolute",
                top: "8%",
                right: "5%",
                width: 1,
                height: "55%",
                background:
                  "linear-gradient(to bottom, transparent, rgba(200,169,110,0.4), transparent)",
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "12%",
                right: "calc(5% + 18px)",
                width: 1,
                height: "40%",
                background:
                  "linear-gradient(to bottom, transparent, rgba(200,169,110,0.15), transparent)",
                zIndex: 1,
              }}
            />

            <div
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "6rem 2rem 5rem",
                width: "100%",
                position: "relative",
                zIndex: 3,
              }}
            >
              <div
                className="hk-hero-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1fr",
                  gap: "4rem",
                  alignItems: "center",
                }}
              >
                {/* Left */}
                <div>
                  {heroVisible && (
                    <>
                      <div
                        className="anim-fadeup-0"
                        style={{ marginBottom: "1.25rem" }}
                      >
                        <span className="hk-badge">
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#c8a96e",
                              animation: "blink 2s ease-in-out infinite",
                            }}
                          />
                          Available for Engagement · Mumbai, India
                        </span>
                      </div>

                      <div
                        className="anim-fadeup-1"
                        style={{ marginBottom: "0.5rem" }}
                      >
                        <div
                          style={{
                            fontFamily: '"Montserrat", sans-serif',
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: "rgba(200,169,110,0.7)",
                            marginBottom: 12,
                          }}
                        >
                          Profile · DR-AMV-HSE-001
                        </div>
                        <h1
                          style={{
                            fontFamily: '"Cormorant Garamond", serif',
                            fontSize: "clamp(3.2rem,7vw,5.8rem)",
                            fontWeight: 700,
                            lineHeight: 0.92,
                            letterSpacing: "-0.01em",
                            color: "#fff",
                          }}
                        >
                          Dr Ashish
                          <br />
                          <span className="gold-shimmer">M Ved</span>
                        </h1>
                      </div>

                      <div
                        className="anim-fadeup-2"
                        style={{
                          fontFamily: '"Cormorant Garamond", serif',
                          fontSize: "clamp(1rem,2vw,1.35rem)",
                          fontWeight: 400,
                          fontStyle: "italic",
                          color: "rgba(255,255,255,0.55)",
                          marginTop: "1rem",
                          marginBottom: "0.25rem",
                          minHeight: "2em",
                        }}
                      >
                        {typeText}
                        <span className="cursor-blink" />
                      </div>

                      <div
                        className="anim-fadeup-2"
                        style={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: "0.62rem",
                          fontWeight: 600,
                          letterSpacing: "0.18em",
                          color: "rgba(200,169,110,0.6)",
                          textTransform: "uppercase",
                          marginBottom: "1.75rem",
                        }}
                      >
                        MBBS &nbsp;·&nbsp; NEBOSH IDip &nbsp;·&nbsp; MBA
                        &nbsp;·&nbsp; ISO 45001 Lead Auditor
                      </div>

                      <p
                        className="anim-fadeup-3"
                        style={{
                          fontFamily: '"Lato", sans-serif',
                          fontSize: "1.05rem",
                          fontWeight: 300,
                          lineHeight: 1.8,
                          color: "rgba(255,255,255,0.72)",
                          maxWidth: 520,
                          marginBottom: "2.5rem",
                        }}
                      >
                        30+ years of elite HSE leadership spanning offshore
                        rigs, oil & gas fields, and global training institutions
                        across{" "}
                        <strong
                          style={{
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          15+ countries
                        </strong>
                        . A rare combination of medical expertise and
                        world-class safety leadership.
                      </p>

                      <div
                        className="anim-fadeup-4"
                        style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
                      >
                        <a href="#contact" className="hk-btn-primary">
                          Get in Touch <span>→</span>
                        </a>
                        <a
                          href="#career"
                          className="hk-btn-outline"
                          style={{
                            color: "#fff",
                            borderColor: "rgba(255,255,255,0.3)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(255,255,255,0.1)";
                            e.currentTarget.style.borderColor =
                              "rgba(255,255,255,0.6)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor =
                              "rgba(255,255,255,0.3)";
                          }}
                        >
                          View Career
                        </a>
                      </div>

                      {/* Membership Pills */}
                      <div
                        className="anim-fadeup-5"
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          marginTop: "2.5rem",
                        }}
                      >
                        {["FIIRSM", "FOTHM", "SAIOSH", "CertIOSH", "ASSP"].map(
                          (m) => (
                            <span
                              key={m}
                              style={{
                                padding: "4px 10px",
                                border: "1px solid rgba(200,169,110,0.25)",
                                fontFamily: '"Montserrat", sans-serif',
                                fontSize: "0.58rem",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                color: "rgba(200,169,110,0.7)",
                                borderRadius: 1,
                              }}
                            >
                              {m}
                            </span>
                          ),
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Portrait */}
                {heroVisible && (
                  <div
                    className="anim-fadein portrait-frame"
                    style={{ position: "relative" }}
                  >
                    <div
                      style={{
                        position: "relative",
                        zIndex: 1,
                        background: "linear-gradient(160deg, #1a3356, #112440)",
                        borderRadius: 2,
                        aspectRatio: "4/5",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(200,169,110,0.2)",
                        overflow: "hidden",
                      }}
                    >
                      {/* Abstract HSE Icon / Portrait Placeholder */}
                      <div
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: "50%",
                          border: "2px solid rgba(200,169,110,0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 24,
                        }}
                      >
                        <svg
                          viewBox="0 0 48 48"
                          width={64}
                          height={64}
                          fill="rgba(200,169,110,0.6)"
                        >
                          <path d="M24 4C17.37 4 12 9.37 12 16s5.37 12 12 12 12-5.37 12-12S30.63 4 24 4zm0 28C16.27 32 2 35.9 2 43.6V46h44v-2.4C46 35.9 31.73 32 24 32z" />
                        </svg>
                      </div>
                      <div
                        style={{
                          fontFamily: '"Cormorant Garamond", serif',
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          color: "rgba(200,169,110,0.8)",
                          letterSpacing: "0.06em",
                          marginBottom: 4,
                        }}
                      >
                        Dr Ashish M Ved
                      </div>
                      <div
                        style={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: "0.6rem",
                          fontWeight: 600,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        MBBS · NEBOSH IDip · MBA
                      </div>

                      {/* Stats overlay */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "1.5rem",
                          background:
                            "linear-gradient(to top, rgba(10,25,45,0.95) 70%, transparent)",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        {[
                          ["30+", "Years"],
                          ["15+", "Countries"],
                          ["Zero", "LTI 3yr"],
                        ].map(([v, l]) => (
                          <div key={l} style={{ textAlign: "center" }}>
                            <div
                              style={{
                                fontFamily: '"Cormorant Garamond", serif',
                                fontSize: "1.5rem",
                                fontWeight: 700,
                                color: "#c8a96e",
                                lineHeight: 1,
                              }}
                            >
                              {v}
                            </div>
                            <div
                              style={{
                                fontFamily: '"Montserrat", sans-serif',
                                fontSize: "0.55rem",
                                fontWeight: 700,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: "rgba(255,255,255,0.45)",
                                marginTop: 2,
                              }}
                            >
                              {l}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Corner accents */}
                      {[
                        ["top-3 left-3", "0,0,1,1"],
                        ["top-3 right-3", "1,0,0,1"],
                        ["bottom-3 left-3", "0,1,1,0"],
                        ["bottom-3 right-3", "1,1,0,0"],
                      ].map(([pos, _], i) => (
                        <div
                          key={i}
                          style={{
                            position: "absolute",
                            width: 20,
                            height: 20,
                            ...(i === 0
                              ? {
                                  top: 12,
                                  left: 12,
                                  borderTop:
                                    "1.5px solid rgba(200,169,110,0.5)",
                                  borderLeft:
                                    "1.5px solid rgba(200,169,110,0.5)",
                                }
                              : {}),
                            ...(i === 1
                              ? {
                                  top: 12,
                                  right: 12,
                                  borderTop:
                                    "1.5px solid rgba(200,169,110,0.5)",
                                  borderRight:
                                    "1.5px solid rgba(200,169,110,0.5)",
                                }
                              : {}),
                            ...(i === 2
                              ? {
                                  bottom: 12,
                                  left: 12,
                                  borderBottom:
                                    "1.5px solid rgba(200,169,110,0.5)",
                                  borderLeft:
                                    "1.5px solid rgba(200,169,110,0.5)",
                                }
                              : {}),
                            ...(i === 3
                              ? {
                                  bottom: 12,
                                  right: 12,
                                  borderBottom:
                                    "1.5px solid rgba(200,169,110,0.5)",
                                  borderRight:
                                    "1.5px solid rgba(200,169,110,0.5)",
                                }
                              : {}),
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scroll hint */}
            <div
              style={{
                position: "absolute",
                bottom: 96,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                zIndex: 3,
              }}
            >
              <span
                style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                Scroll
              </span>
              <div
                style={{
                  width: 1,
                  height: 40,
                  background:
                    "linear-gradient(to bottom, rgba(200,169,110,0.5), transparent)",
                  animation: "floatBadge 2s ease-in-out infinite",
                }}
              />
            </div>
          </section>

          {/* ── MAIN CONTENT ──────────────────────── */}
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
            {/* 01 · STATS */}
            <section id="about" className="hk-section">
              <SectionLabel num="01" title="Impact by Numbers" />
              <div
                ref={statRef}
                className="hk-stats-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 20,
                }}
              >
                {STATS.map((s) => (
                  <StatCard key={s.label} {...s} active={statsInView} />
                ))}
              </div>
            </section>

            {/* 02 · SYNOPSIS */}
            <section className="hk-section">
              <SectionLabel num="02" title="Professional Synopsis" />
              <div
                className="hk-synopsis-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                }}
              >
                {SYNOPSIS.map((s, i) => {
                  const [ref, inView] = [useRef(null), false];
                  return <SynopsisCard key={s.id} item={s} index={i} />;
                })}
              </div>
            </section>

            {/* 03 · AWARDS + HIGHLIGHTS */}
            <section className="hk-section">
              <SectionLabel num="03" title="Awards & Highlights" />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                  marginBottom: 40,
                }}
                className="hk-synopsis-grid"
              >
                {AWARDS.map((a) => (
                  <div key={a.title} className="award-card">
                    <div
                      style={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "#c8a96e",
                        marginBottom: 10,
                      }}
                    >
                      International Award
                    </div>
                    <h4
                      style={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: "#1e3a5f",
                        lineHeight: 1.3,
                        marginBottom: 6,
                      }}
                    >
                      {a.title}
                    </h4>
                    <p
                      style={{
                        fontFamily: '"Lato", sans-serif',
                        fontSize: "0.82rem",
                        color: "#6b7280",
                      }}
                    >
                      {a.sub}
                    </p>
                  </div>
                ))}
              </div>
              <div
                style={{ columnCount: 2, columnGap: 40 }}
                className="highlights-cols"
              >
                {HIGHLIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="highlight-item"
                    style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                  >
                    <span
                      style={{ color: "#c8a96e", flexShrink: 0, marginTop: 3 }}
                    >
                      ◆
                    </span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 04 · CAREER */}
            <section id="career" className="hk-section">
              <SectionLabel num="04" title="Career Timeline" />
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {CAREER.map((item, i) => (
                  <CareerCard key={i} item={item} index={i} />
                ))}
              </div>
            </section>

            {/* 05 · EDUCATION */}
            <section id="education" className="hk-section">
              <SectionLabel num="05" title="Education & Academia" />
              <div
                className="hk-edu-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {EDUCATION.map((e, i) => (
                  <EduCard key={e.year + e.title} item={e} index={i} />
                ))}
              </div>
            </section>

            {/* 06 · CERTIFICATIONS */}
            <section id="credentials" className="hk-section">
              <SectionLabel num="06" title="Certifications & Credentials" />
              <div
                className="hk-certs-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                {CERTS.map((c, i) => (
                  <div key={i} className="cert-card">
                    <span
                      style={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#c8a96e",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Certification {String(i + 1).padStart(2, "0")}
                    </span>
                    {c}
                  </div>
                ))}
              </div>
            </section>

            {/* 07 · MEMBERSHIPS */}
            <section className="hk-section">
              <SectionLabel num="07" title="Professional Memberships" />
              <div
                className="hk-mem-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 16,
                }}
              >
                {MEMBERSHIPS.map((m, i) => (
                  <MemberCard key={m.ab} item={m} index={i} />
                ))}
              </div>
            </section>

            {/* 08 · LANGUAGES */}
            <section className="hk-section">
              <SectionLabel num="08" title="Languages" />
              <div
                className="hk-lang-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 4rem",
                }}
              >
                {LANGUAGES.map((l) => (
                  <LangBar key={l.name} {...l} />
                ))}
              </div>
            </section>

            {/* 09 · CONTACT */}
            <section
              id="contact"
              className="hk-section"
              style={{ borderBottom: "1px solid #e8e0d4" }}
            >
              <SectionLabel num="09" title="Contact & References" />
              <div
                className="hk-contact-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 32,
                }}
              >
                {/* Contact info */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e8e0d4",
                    borderRadius: 2,
                    padding: "2rem",
                    boxShadow: "0 1px 4px rgba(30,58,95,0.05)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "#c8a96e",
                      marginBottom: "1.25rem",
                      paddingBottom: "0.75rem",
                      borderBottom: "1px solid #f0ebe3",
                    }}
                  >
                    Direct Channels
                  </div>
                  {[
                    {
                      lbl: "Location",
                      val: "N. G. Complex, Flat 001, C-Wing, Off Military Road, Marol, Andheri (East), Mumbai 400072, India",
                    },
                    {
                      lbl: "Email",
                      val: "drashishved@gmail.com",
                      href: "mailto:drashishved@gmail.com",
                    },
                    {
                      lbl: "Phone",
                      val: "+91-9619954655 · +91-9833601559",
                      href: "tel:+919619954655",
                    },
                    {
                      lbl: "LinkedIn",
                      val: "linkedin.com/in/ashishved",
                      href: "https://www.linkedin.com/in/ashishved/",
                    },
                    { lbl: "Date of Birth", val: "9th November 1965" },
                    {
                      lbl: "Passport",
                      val: "Z4680793 — valid till 25 February 2029",
                    },
                  ].map(({ lbl, val, href }) => (
                    <div key={lbl} className="contact-field">
                      <span
                        style={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#9ca3af",
                          flexShrink: 0,
                          width: 88,
                          paddingTop: 2,
                        }}
                      >
                        {lbl}
                      </span>
                      {href ? (
                        <a
                          href={href}
                          target={
                            href.startsWith("http") ? "_blank" : undefined
                          }
                          rel="noopener noreferrer"
                          style={{
                            fontFamily: '"Lato", sans-serif',
                            fontSize: "0.88rem",
                            color: "#1e3a5f",
                            textDecoration: "none",
                            wordBreak: "break-all",
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#c8a96e")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#1e3a5f")
                          }
                        >
                          {val}
                        </a>
                      ) : (
                        <span
                          style={{
                            fontFamily: '"Lato", sans-serif',
                            fontSize: "0.88rem",
                            color: "#374151",
                          }}
                        >
                          {val}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* References */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
                    style={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "#9ca3af",
                    }}
                  >
                    Professional References
                  </div>
                  {[
                    {
                      name: "Mohammed Al Debabi",
                      role: "Managing Director",
                      co: "Atlas International",
                      email: "malidebabi@rayskills.com",
                    },
                    {
                      name: "Mohammed Refat",
                      role: "ICT and HSE Instructor",
                      co: "RAY International Skills Development LLC",
                      email: "mohammedrefatahmed@gmail.com",
                    },
                  ].map((r) => (
                    <div
                      key={r.name}
                      style={{
                        background: "#fff",
                        border: "1px solid #e8e0d4",
                        borderRadius: 2,
                        padding: "1.5rem",
                        borderLeft: "4px solid #c8a96e",
                        boxShadow: "0 1px 4px rgba(30,58,95,0.05)",
                        transition: "box-shadow 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.boxShadow =
                          "0 6px 24px rgba(30,58,95,0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.boxShadow =
                          "0 1px 4px rgba(30,58,95,0.05)")
                      }
                    >
                      <div
                        style={{
                          fontFamily: '"Cormorant Garamond", serif',
                          fontSize: "1.15rem",
                          fontWeight: 600,
                          color: "#1e3a5f",
                          marginBottom: 2,
                        }}
                      >
                        {r.name}
                      </div>
                      <div
                        style={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "#c8a96e",
                          marginBottom: 4,
                        }}
                      >
                        {r.role}
                      </div>
                      <div
                        style={{
                          fontFamily: '"Lato", sans-serif',
                          fontSize: "0.85rem",
                          color: "#6b7280",
                          marginBottom: 6,
                        }}
                      >
                        {r.co}
                      </div>
                      <div
                        style={{
                          fontFamily: '"Lato", sans-serif',
                          fontSize: "0.8rem",
                          color: "#9ca3af",
                        }}
                      >
                        {r.email}
                      </div>
                    </div>
                  ))}

                  {/* CTA */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, #1e3a5f, #152d4a)",
                      borderRadius: 2,
                      padding: "1.75rem",
                      textAlign: "center",
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: "1.4rem",
                        fontWeight: 600,
                        color: "#fff",
                        marginBottom: 8,
                      }}
                    >
                      Ready to Elevate Your Safety Standards?
                    </div>
                    <p
                      style={{
                        fontFamily: '"Lato", sans-serif',
                        fontSize: "0.85rem",
                        color: "rgba(255,255,255,0.65)",
                        marginBottom: "1.25rem",
                      }}
                    >
                      30+ years of expertise, ready to deploy for your
                      organisation.
                    </p>
                    <a
                      href="mailto:drashishved@gmail.com"
                      className="hk-btn-primary"
                      style={{
                        background: "#c8a96e",
                        color: "#1e3a5f",
                        display: "inline-flex",
                      }}
                    >
                      Send a Message →
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ── FOOTER STRIP ─────────────────────── */}
          <footer
            style={{
              background: "#1e3a5f",
              padding: "2.5rem 2rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "1.3rem",
                fontWeight: 600,
                color: "#fff",
                marginBottom: 4,
              }}
            >
              Dr Ashish M Ved
            </div>
            <div
              style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(200,169,110,0.6)",
              }}
            >
              HSE Division Head &nbsp;·&nbsp; NEBOSH Examiner &nbsp;·&nbsp; 30+
              Years &nbsp;·&nbsp; Global Operations
            </div>
            <div
              style={{
                marginTop: "1rem",
                fontFamily: '"Lato", sans-serif',
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              © 2025 H K International · hkinternational.uk
            </div>
          </footer>

          {/* Back to Top */}
          {showTop && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{
                position: "fixed",
                bottom: 32,
                right: 32,
                zIndex: 999,
                width: 44,
                height: 44,
                background: "#1e3a5f",
                color: "#c8a96e",
                border: "1px solid rgba(200,169,110,0.4)",
                borderRadius: 2,
                cursor: "pointer",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(30,58,95,0.3)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-3px)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              ↑
            </button>
          )}
        </div>
      </MainLayout>
    </>
  );
}

/* ─── Additional card components using hooks properly ─── */
function SynopsisCard({ item, index }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      style={{
        background: "#fff",
        border: "1px solid #e8e0d4",
        borderRadius: 2,
        padding: "1.75rem",
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(20px)",
        transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
        borderLeft: "4px solid #1e3a5f",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: "0.75rem",
        }}
      >
        <span
          style={{
            fontFamily: '"Montserrat", sans-serif',
            fontSize: "0.55rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "#9ca3af",
          }}
        >
          {item.id}
        </span>
        <span
          style={{
            fontFamily: '"Montserrat", sans-serif',
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#c8a96e",
            background: "rgba(200,169,110,0.08)",
            padding: "3px 8px",
            border: "1px solid rgba(200,169,110,0.25)",
          }}
        >
          {item.tag}
        </span>
      </div>
      <p
        style={{
          fontFamily: '"Lato", sans-serif',
          fontSize: "0.9rem",
          color: "#374151",
          lineHeight: 1.75,
        }}
      >
        {item.text}
      </p>
    </div>
  );
}

function EduCard({ item, index }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        gap: 20,
        background: "#fff",
        border: "1px solid #e8e0d4",
        borderRadius: 2,
        padding: "1.25rem 1.5rem",
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(16px)",
        transition: `opacity 0.6s ease ${index * 0.08}s, transform 0.6s ease ${index * 0.08}s`,
        boxShadow: "0 1px 4px rgba(30,58,95,0.04)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 20px rgba(30,58,95,0.1)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 4px rgba(30,58,95,0.04)")
      }
    >
      <div
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: "1.8rem",
          fontWeight: 700,
          color: "#c8a96e",
          opacity: 0.6,
          flexShrink: 0,
          lineHeight: 1,
          paddingTop: 2,
          width: 52,
          textAlign: "right",
        }}
      >
        {item.year}
      </div>
      <div style={{ borderLeft: "2px solid #e8e0d4", paddingLeft: 20 }}>
        <div
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: "1.05rem",
            fontWeight: 600,
            color: "#1e3a5f",
            lineHeight: 1.3,
            marginBottom: 4,
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            fontFamily: '"Lato", sans-serif',
            fontSize: "0.8rem",
            color: "#9ca3af",
          }}
        >
          {item.inst}
        </div>
      </div>
    </div>
  );
}

function MemberCard({ item, index }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      style={{
        background: "#fff",
        border: "1px solid #e8e0d4",
        borderRadius: 2,
        padding: "1.5rem",
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(16px)",
        transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
        borderTop: "3px solid #1e3a5f",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderTopColor = "#c8a96e";
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(30,58,95,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderTopColor = "#1e3a5f";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: "2rem",
          fontWeight: 700,
          color: "#1e3a5f",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {item.ab}
      </div>
      <div
        style={{
          fontFamily: '"Lato", sans-serif',
          fontSize: "0.82rem",
          color: "#374151",
          lineHeight: 1.5,
          marginBottom: 6,
        }}
      >
        {item.name}
      </div>
      <div
        style={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: "0.6rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "#c8a96e",
        }}
      >
        {item.id}
      </div>
    </div>
  );
}
