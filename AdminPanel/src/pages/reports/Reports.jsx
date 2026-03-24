import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, DataTable, Badge, Button } from "../../components/ui";
import { getReportsData } from "../../services/analyticsService";
import { FileText, Download, BookOpen, GraduationCap, ClipboardList, FileCheck } from "lucide-react";

const reportTypes = [
  { key: "courses", label: "Courses", icon: BookOpen, color: "primary" },
  { key: "students", label: "Students", icon: GraduationCap, color: "accent" },
  { key: "assignments", label: "Assignments", icon: ClipboardList, color: "warning" },
  { key: "exams", label: "Exams", icon: FileCheck, color: "danger" },
];

export default function Reports() {
  const [activeType, setActiveType] = useState("courses");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, [activeType]);

  const load = async () => {
    setLoading(true);
    try { const d = await getReportsData(activeType); setData(Array.isArray(d) ? d : []); }
    catch { setData([]); }
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const keys = Object.keys(data[0]).filter((k) => !k.startsWith("_") && typeof data[0][k] !== "object");
    const header = keys.join(",");
    const rows = data.map((r) => keys.map((k) => {
      const val = typeof r[k] === "object" ? JSON.stringify(r[k]) : r[k];
      return `"${val ?? ""}"`;
    }).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${activeType}-report.csv`; a.click();
  };

  const columnMap = {
    courses: [
      { key: "title", label: "Course" },
      { key: "status", label: "Status", render: (r) => <Badge variant={r.status === "published" ? "success" : "warning"}>{r.status}</Badge> },
      { key: "tutor", label: "Tutor", render: (r) => r.assignedTutor?.name || "—" },
      { key: "enrollmentCount", label: "Enrollments" },
      { key: "sections", label: "Sections", render: (r) => r.sections?.length || 0 },
    ],
    students: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "courses", label: "Courses", render: (r) => r.enrolledCourses?.length || 0 },
      { key: "submissionCount", label: "Submissions" },
      { key: "certificateCount", label: "Certificates" },
      { key: "createdAt", label: "Joined", render: (r) => new Date(r.createdAt).toLocaleDateString() },
    ],
    assignments: [
      { key: "title", label: "Assignment" },
      { key: "course", label: "Course", render: (r) => r.courseId?.title || "—" },
      { key: "totalMarks", label: "Marks" },
      { key: "submissionCount", label: "Submissions" },
      { key: "gradedCount", label: "Graded" },
      { key: "rate", label: "Completion", render: (r) => r.submissionCount > 0 ? `${((r.gradedCount / r.submissionCount) * 100).toFixed(0)}%` : "—" },
    ],
    exams: [
      { key: "title", label: "Exam" },
      { key: "course", label: "Course", render: (r) => r.courseId?.title || "—" },
      { key: "totalMarks", label: "Total Marks" },
      { key: "totalAttempts", label: "Attempts" },
      { key: "avgScore", label: "Avg Score", render: (r) => r.avgScore ? r.avgScore.toFixed(1) : "—" },
      { key: "status", label: "Status", render: (r) => <Badge variant={r.status === "completed" ? "success" : "warning"}>{r.status}</Badge> },
    ],
  };

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader title="Reports" subtitle="Generate and export reports"
          actions={<Button variant="outline" onClick={exportCSV}><Download size={16} /> Export CSV</Button>} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {reportTypes.map((rt) => (
            <button key={rt.key} onClick={() => setActiveType(rt.key)}
              className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${activeType === rt.key ? "border-primary bg-primary/5" : "border-gray-100 bg-white hover:border-gray-200"}`}>
              <div className={`p-2 rounded-xl ${activeType === rt.key ? "bg-primary/10" : "bg-gray-100"}`}>
                <rt.icon size={20} className={activeType === rt.key ? "text-primary" : "text-gray-500"} />
              </div>
              <span className={`text-sm font-medium ${activeType === rt.key ? "text-primary" : "text-gray-600"}`}>{rt.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <DataTable columns={columnMap[activeType] || []} data={data} emptyMessage={`No ${activeType} report data available. Connect your API to generate reports.`} />
        )}
      </div>
    </AdminLayout>
  );
}
