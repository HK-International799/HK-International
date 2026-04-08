import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Award, Search, Download, CheckCircle2, Clock,
  XCircle, Loader2, Calendar, Filter,
} from "lucide-react";
import AOLayout from "./AOLayout";
import { getCertificationStatus } from "../../services/aoService";

const MOCK_CERTS = Array.from({ length: 30 }, (_, i) => ({
  _id: `c${i + 1}`,
  certificateNumber: `HKINT-${2025 + Math.floor(i / 10)}-${String(1000 + i).padStart(4, "0")}`,
  studentName: ["Priya Sharma","James Okafor","Maria Santos","Rajesh Kumar","Fatima Al-Hassan",
    "Chen Wei","Amara Diallo","John Smith","Aisha Mohammed","David Park"][i % 10],
  studentId: `HK-2025-${String(1000 + i).padStart(4, "0")}`,
  course: ["IOSH Managing Safely","IOSH Working Safely","OTHM Level 6 OSH","OSH Fundamentals","PECB ISO 45001"][i % 5],
  issuedAt: i % 3 !== 0 ? new Date(2026, i % 4, (i % 28) + 1).toISOString() : null,
  expiresAt: i % 3 !== 0 ? new Date(2029, i % 4, (i % 28) + 1).toISOString() : null,
  status: ["issued", "issued", "pending", "issued", "expired"][i % 5],
  verificationCode: `VER-${String(Math.random()).slice(2, 8).toUpperCase()}`,
}));

const STATUS_CONF = {
  issued: { label: "Issued", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  expired: { label: "Expired", color: "bg-red-100 text-red-600", icon: XCircle },
};

export default function AOCertifications() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCertificationStatus();
        setCerts(data?.length ? data : MOCK_CERTS);
      } catch { setCerts(MOCK_CERTS); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const courses = useMemo(() => [...new Set(certs.map((c) => c.course))], [certs]);

  const filtered = useMemo(() => {
    let res = [...certs];
    if (search) {
      const q = search.toLowerCase();
      res = res.filter((c) =>
        c.studentName.toLowerCase().includes(q) ||
        c.certificateNumber.toLowerCase().includes(q) ||
        c.studentId.toLowerCase().includes(q)
      );
    }
    if (filterStatus) res = res.filter((c) => c.status === filterStatus);
    if (filterCourse) res = res.filter((c) => c.course === filterCourse);
    return res;
  }, [certs, search, filterStatus, filterCourse]);

  const stats = useMemo(() => ({
    issued: certs.filter((c) => c.status === "issued").length,
    pending: certs.filter((c) => c.status === "pending").length,
    expired: certs.filter((c) => c.status === "expired").length,
  }), [certs]);

  const handleExport = () => {
    const headers = ["Certificate No","Student ID","Student Name","Course","Status","Issued","Expires","Verification"];
    const rows = filtered.map((c) => [
      c.certificateNumber, c.studentId, c.studentName, c.course, c.status,
      c.issuedAt ? new Date(c.issuedAt).toLocaleDateString("en-GB") : "—",
      c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-GB") : "—",
      c.verificationCode,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "certifications-export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AOLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certifications</h1>
          <p className="text-gray-500 text-sm mt-0.5">Certification status across all programmes</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Issued", value: stats.issued, color: "bg-green-500", icon: CheckCircle2 },
          { label: "Pending", value: stats.pending, color: "bg-amber-500", icon: Clock },
          { label: "Expired", value: stats.expired, color: "bg-red-500", icon: XCircle },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, cert no, ID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200">
            <option value="">All Statuses</option>
            <option value="issued">Issued</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
          <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200">
            <option value="">All Courses</option>
            {courses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Certificate No","Student","Course","Status","Issued","Expires","Verification"].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((cert) => {
                  const sc = STATUS_CONF[cert.status] || STATUS_CONF.pending;
                  const Icon = sc.icon;
                  return (
                    <tr key={cert._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                          {cert.certificateNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-900 text-sm">{cert.studentName}</p>
                        <p className="text-xs text-gray-400 font-mono">{cert.studentId}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600 max-w-[160px]">
                        <span className="truncate block">{cert.course}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                          <Icon className="w-3 h-3" />{sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">
                        {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">
                        {cert.expiresAt ? new Date(cert.expiresAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {cert.verificationCode}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm">No certifications match your filters.</div>
            )}
          </div>
        )}
      </motion.div>
    </AOLayout>
  );
}
