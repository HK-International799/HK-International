import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ShieldX, ShieldAlert, Search, Loader2,
  CalendarDays, GraduationCap, User, Hash, BadgeCheck,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import SEO from "../../components/SEO";
import { verifyCertificate } from "../../services/certificateVerificationService";

// Presentation config per computed `displayStatus` returned by the API.
// "issued" here means valid/current (backend already folds expiry+revocation
// into this one field so the UI doesn't have to re-derive it).
const STATUS_CONFIG = {
  issued: {
    icon: ShieldCheck,
    heading: "Certificate Verified",
    tone: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    message: "This certificate is valid and was issued by 1A HK International.",
  },
  revoked: {
    icon: ShieldX,
    heading: "Certificate Revoked",
    tone: "text-red-600",
    bg: "bg-red-50",
    ring: "ring-red-200",
    message: "This certificate has been revoked and is no longer valid.",
  },
  expired: {
    icon: ShieldAlert,
    heading: "Certificate Expired",
    tone: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    message: "This certificate was valid but has since expired.",
  },
};

function ResultCard({ result }) {
  const config = STATUS_CONFIG[result.displayStatus] || STATUS_CONFIG.issued;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${config.ring} ${config.bg} p-6 sm:p-8`}
    >
      <div className="flex items-start gap-4">
        <div className={`shrink-0 w-12 h-12 rounded-xl bg-white flex items-center justify-center ${config.tone}`}>
          <Icon size={26} />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${config.tone}`}>{config.heading}</h2>
          <p className="text-sm text-slate-600 mt-1">{config.message}</p>
        </div>
      </div>

      {result.displayStatus === "revoked" && result.revocationReason && (
        <div className="mt-4 text-sm text-red-700 bg-white/70 rounded-xl p-3">
          <strong>Reason: </strong>{result.revocationReason}
        </div>
      )}

      <div className="mt-6 bg-white rounded-xl divide-y divide-slate-100 overflow-hidden">
        <Row icon={User} label="Certificate Holder" value={result.studentName} />
        <Row icon={GraduationCap} label="Course" value={result.courseName} sub={result.courseCode} />
        <Row icon={Hash} label="Certificate Number" value={result.certificateNumber} mono />
        <Row icon={CalendarDays} label="Date of Issue" value={new Date(result.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
        {result.hasExpiry && result.expiryDate && (
          <Row icon={CalendarDays} label="Valid Until" value={new Date(result.expiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
        )}
        {result.grade && <Row icon={BadgeCheck} label="Grade" value={result.grade} />}
        {result.accreditingBody && <Row icon={ShieldCheck} label="Accredited By" value={result.accreditingBody} />}
      </div>
    </motion.div>
  );
}

function Row({ icon: Icon, label, value, sub, mono }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon size={16} className="text-slate-400 shrink-0" />
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
        <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
        <span className={`text-sm text-slate-800 font-medium ${mono ? "font-mono" : ""}`}>
          {value}{sub ? ` (${sub})` : ""}
        </span>
      </div>
    </div>
  );
}

export default function VerifyCertificate() {
  const { certificateNumber: paramCertNumber } = useParams();
  const navigate = useNavigate();

  const [input, setInput] = useState(paramCertNumber || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const runVerify = async (certNumber) => {
    if (!certNumber?.trim()) return;
    setLoading(true);
    setError("");
    setNotFound(false);
    setResult(null);
    try {
      const data = await verifyCertificate(certNumber.trim());
      setResult(data);
    } catch (err) {
      if (err?.message?.toLowerCase().includes("not found")) {
        setNotFound(true);
      } else {
        setError(err?.message || "Something went wrong verifying this certificate. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramCertNumber) runVerify(paramCertNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramCertNumber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    navigate(`/verify-certificate/${encodeURIComponent(input.trim())}`);
  };

  return (
    <MainLayout>
      <SEO
        title="Verify a Certificate | 1A HK International"
        description="Verify the authenticity of a 1A HK International health & safety training certificate using its certificate number."
        url="https://hkinternational.uk/verify-certificate"
      />

      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-indigo-600 font-semibold mb-2 text-sm uppercase tracking-wide">Certificate Verification</p>
            <h1 className="text-3xl font-bold text-slate-800">Verify a Certificate</h1>
            <p className="text-slate-500 mt-2">
              Enter a certificate number to confirm it was genuinely issued by 1A HK International.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. CERT-1732000000000-A1B2C3"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Verify"}
            </button>
          </form>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-12">
                <Loader2 size={28} className="animate-spin text-indigo-400" />
              </motion.div>
            )}

            {!loading && result && <ResultCard key="result" result={result} />}

            {!loading && notFound && (
              <motion.div key="notfound" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border ring-1 ring-slate-200 bg-white p-8 text-center">
                <ShieldX size={32} className="mx-auto text-slate-400 mb-3" />
                <h2 className="text-lg font-bold text-slate-700">No Certificate Found</h2>
                <p className="text-sm text-slate-500 mt-1">
                  We couldn't find a certificate matching that number. Please double-check it and try again.
                </p>
              </motion.div>
            )}

            {!loading && error && (
              <motion.div key="error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border ring-1 ring-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
}
