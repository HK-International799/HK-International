import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ScrollText, Search, Download, Filter, Loader2,
  ChevronLeft, ChevronRight, User, Award, LogIn,
  FileText, BookOpen, AlertCircle, CheckCircle2,
} from "lucide-react";
import AOLayout from "./AOLayout";
import { getAuditLogs } from "../../services/aoService";

const LOG_TYPES = {
  login: { label: "Login", icon: LogIn, color: "text-blue-600 bg-blue-100" },
  cert_issued: { label: "Certificate Issued", icon: Award, color: "text-green-600 bg-green-100" },
  quiz_submitted: { label: "Quiz Submitted", icon: FileText, color: "text-purple-600 bg-purple-100" },
  enrollment: { label: "Enrollment", icon: BookOpen, color: "text-indigo-600 bg-indigo-100" },
  assignment: { label: "Assignment", icon: FileText, color: "text-amber-600 bg-amber-100" },
  profile_update: { label: "Profile Updated", icon: User, color: "text-gray-600 bg-gray-100" },
  access_denied: { label: "Access Denied", icon: AlertCircle, color: "text-red-600 bg-red-100" },
  cert_download: { label: "Cert Downloaded", icon: Download, color: "text-teal-600 bg-teal-100" },
};

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

const MOCK_LOGS = Array.from({ length: 80 }, (_, i) => {
  const types = Object.keys(LOG_TYPES);
  const names = ["Priya Sharma","James Okafor","Maria Santos","Rajesh Kumar","Fatima Al-Hassan",
    "Chen Wei","Amara Diallo","John Smith","Aisha Mohammed","David Park"];
  const type = types[i % types.length];
  return {
    _id: `log${i + 1}`,
    type,
    actor: names[i % names.length],
    actorId: `HK-2025-${String(1000 + i).padStart(4, "0")}`,
    actorRole: i % 7 === 0 ? "admin" : "student",
    description: {
      login: "User logged into the portal",
      cert_issued: "Certificate generated and issued",
      quiz_submitted: "Quiz attempt submitted and graded",
      enrollment: "Enrolled in new course",
      assignment: "Assignment uploaded for review",
      profile_update: "Profile information updated",
      access_denied: "Attempted to access restricted resource",
      cert_download: "Downloaded certificate PDF",
    }[type],
    resource: ["IOSH Managing Safely","IOSH Working Safely","OTHM Level 6","OSH Fundamentals","—"][i % 5],
    ip: `192.168.${(i % 5) + 1}.${(i % 100) + 10}`,
    timestamp: randomDate(new Date(2026, 2, 1), new Date(2026, 3, 3)),
    status: i % 8 === 0 ? "failed" : "success",
  };
}).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

const PAGE_SIZE = 15;

export default function AOAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAuditLogs();
        setLogs(data?.length ? data : MOCK_LOGS);
      } catch { setLogs(MOCK_LOGS); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let res = [...logs];
    if (search) {
      const q = search.toLowerCase();
      res = res.filter((l) =>
        l.actor.toLowerCase().includes(q) ||
        l.actorId.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    }
    if (filterType) res = res.filter((l) => l.type === filterType);
    if (filterRole) res = res.filter((l) => l.actorRole === filterRole);
    return res;
  }, [logs, search, filterType, filterRole]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = () => {
    const headers = ["Timestamp","Type","Actor","Actor ID","Role","Description","Resource","IP","Status"];
    const rows = filtered.map((l) => [
      new Date(l.timestamp).toLocaleString("en-GB"),
      l.type, l.actor, l.actorId, l.actorRole, l.description, l.resource, l.ip, l.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "audit-logs.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AOLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} log entries</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all">
          <Download className="w-4 h-4" /> Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search actor, description..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200">
            <option value="">All Event Types</option>
            {Object.entries(LOG_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200">
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Log entries */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Timestamp","Event","Actor","Resource","IP Address","Status"].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((log) => {
                    const cfg = LOG_TYPES[log.type] || LOG_TYPES.login;
                    const Icon = cfg.icon;
                    return (
                      <tr key={log._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                          <p className="text-gray-700">{new Date(log.timestamp).toLocaleDateString("en-GB", { day:"2-digit", month:"short" })}</p>
                          <p className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" })}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-gray-900 text-sm">{log.actor}</p>
                          <p className="text-xs text-gray-400 font-mono">{log.actorId} · {log.actorRole}</p>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500 max-w-[140px]">
                          <span className="truncate block">{log.resource}</span>
                          <span className="text-gray-400 line-clamp-1">{log.description}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-mono text-gray-400">{log.ip}</td>
                        <td className="px-4 py-3.5">
                          {log.status === "success" ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3" /> Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === page ? "bg-indigo-600 text-white" : "hover:bg-gray-200 text-gray-600"}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AOLayout>
  );
}
