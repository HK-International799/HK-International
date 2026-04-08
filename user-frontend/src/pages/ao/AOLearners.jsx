import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Filter, Users, ChevronUp, ChevronDown, ChevronLeft,
  ChevronRight, Award, Clock, CheckCircle2, XCircle, Loader2,
  Download, Eye, BookOpen, Building2,
} from "lucide-react";
import AOLayout from "./AOLayout";
import { getAllLearners, getPartnerInstitutes, getCoursesList } from "../../services/aoService";

const MOCK_LEARNERS = Array.from({ length: 40 }, (_, i) => ({
  _id: `l${i + 1}`,
  name: ["Priya Sharma","James Okafor","Maria Santos","Rajesh Kumar","Fatima Al-Hassan",
         "Chen Wei","Amara Diallo","John Smith","Aisha Mohammed","David Park",
         "Rania Hassan","Carlos Mendes","Yuki Tanaka","Olga Petrov","Sam Ibrahim"][i % 15],
  email: `learner${i + 1}@example.com`,
  studentId: `HK-2025-${String(1000 + i).padStart(4, "0")}`,
  course: ["IOSH Managing Safely","IOSH Working Safely","OTHM Level 6 OSH","OSH Fundamentals","PECB ISO 45001"][i % 5],
  institute: ["HK International Main","Dubai Centre","Lagos Branch","London Office","Singapore Hub"][i % 5],
  enrolledAt: new Date(2025, 8 + (i % 6), (i % 28) + 1).toISOString(),
  status: ["certified","in_progress","in_progress","not_started","certified"][i % 5],
  progress: [100, 65, 42, 10, 100][i % 5],
  certDate: i % 5 === 0 || i % 5 === 4 ? new Date(2026, (i % 3), (i % 28) + 1).toISOString() : null,
}));

const STATUS_CONFIG = {
  certified: { label: "Certified", color: "bg-green-100 text-green-700", icon: Award },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700", icon: Clock },
  not_started: { label: "Not Started", color: "bg-gray-100 text-gray-500", icon: XCircle },
  completed: { label: "Completed", color: "bg-teal-100 text-teal-700", icon: CheckCircle2 },
};

const PAGE_SIZE = 10;

export default function AOLearners() {
  const [learners, setLearners] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterInstitute, setFilterInstitute] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    const load = async () => {
      try {
        const [l, inst, c] = await Promise.all([
          getAllLearners(),
          getPartnerInstitutes(),
          getCoursesList(),
        ]);
        setLearners(l?.length ? l : MOCK_LEARNERS);
        setInstitutes(inst?.length ? inst : [...new Set(MOCK_LEARNERS.map((x) => x.institute))].map((n) => ({ _id: n, name: n })));
        setCourses(c?.length ? c : [...new Set(MOCK_LEARNERS.map((x) => x.course))].map((n) => ({ _id: n, title: n })));
      } catch {
        setLearners(MOCK_LEARNERS);
        setInstitutes([...new Set(MOCK_LEARNERS.map((x) => x.institute))].map((n) => ({ _id: n, name: n })));
        setCourses([...new Set(MOCK_LEARNERS.map((x) => x.course))].map((n) => ({ _id: n, title: n })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let result = [...learners];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.studentId.toLowerCase().includes(q)
      );
    }
    if (filterCourse) result = result.filter((l) => l.course === filterCourse);
    if (filterInstitute) result = result.filter((l) => l.institute === filterInstitute);
    if (filterStatus) result = result.filter((l) => l.status === filterStatus);

    result.sort((a, b) => {
      let av = a[sortKey] ?? "";
      let bv = b[sortKey] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      return sortDir === "asc" ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
    });
    return result;
  }, [learners, search, filterCourse, filterInstitute, filterStatus, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp className="w-3.5 h-3.5 text-gray-300" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3.5 h-3.5 text-indigo-500" />
      : <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />;
  };

  const handleExportCSV = () => {
    const headers = ["Student ID","Name","Email","Course","Institute","Status","Progress","Cert Date"];
    const rows = filtered.map((l) => [
      l.studentId, l.name, l.email, l.course, l.institute, l.status,
      `${l.progress}%`,
      l.certDate ? new Date(l.certDate).toLocaleDateString("en-GB") : "—",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "learners-export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AOLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learners</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} learners found</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-gray-50"
            />
          </div>
          {/* Course Filter */}
          <select
            value={filterCourse}
            onChange={(e) => { setFilterCourse(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c.title || c._id}>{c.title || c._id}</option>
            ))}
          </select>
          {/* Institute Filter */}
          <select
            value={filterInstitute}
            onChange={(e) => { setFilterInstitute(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">All Institutes</option>
            {institutes.map((inst) => (
              <option key={inst._id} value={inst.name || inst._id}>{inst.name || inst._id}</option>
            ))}
          </select>
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">All Statuses</option>
            <option value="certified">Certified</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
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
                    {[
                      { key: "studentId", label: "Student ID" },
                      { key: "name", label: "Name" },
                      { key: "course", label: "Course" },
                      { key: "institute", label: "Institute" },
                      { key: "status", label: "Status" },
                      { key: "progress", label: "Progress" },
                      { key: "certDate", label: "Cert Date" },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                      >
                        <span className="flex items-center gap-1">
                          {label} <SortIcon col={key} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((learner) => {
                    const sc = STATUS_CONFIG[learner.status] || STATUS_CONFIG.not_started;
                    const Icon = sc.icon;
                    return (
                      <tr key={learner._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {learner.studentId}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                              {learner.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{learner.name}</p>
                              <p className="text-xs text-gray-400">{learner.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1.5 text-xs text-gray-600">
                            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                            <span className="max-w-[140px] truncate">{learner.course}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            <span className="max-w-[120px] truncate">{learner.institute}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                            <Icon className="w-3 h-3" />
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  learner.progress === 100 ? "bg-green-500" :
                                  learner.progress > 50 ? "bg-indigo-500" : "bg-amber-400"
                                }`}
                                style={{ width: `${learner.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8">{learner.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">
                          {learner.certDate
                            ? new Date(learner.certDate).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric",
                              })
                            : <span className="text-gray-300">—</span>}
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
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        p === page ? "bg-indigo-600 text-white" : "hover:bg-gray-200 text-gray-600"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-all"
                >
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
