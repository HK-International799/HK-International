import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, DataTable, Badge, Button } from "../../components/ui";
import { getReportsData } from "../../services/analyticsService";

import {
  Download,
  BookOpen,
  GraduationCap,
  ClipboardList,
  FileCheck,
  FileText,
} from "lucide-react";

const reportTypes = [
  { key: "courses", label: "Courses", icon: BookOpen },
  { key: "students", label: "Students", icon: GraduationCap },
  { key: "assignments", label: "Assignments", icon: ClipboardList },
  { key: "exams", label: "Exams", icon: FileCheck },
];

export default function Reports() {
  const [activeType, setActiveType] = useState("courses");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, [activeType]);

  const load = async () => {
    setLoading(true);
    try {
      const d = await getReportsData(activeType);
      setData(Array.isArray(d) ? d : []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Export CSV ---------------- */

  const exportCSV = () => {
    if (!data.length) return;

    const keys = Object.keys(data[0]).filter(
      (k) => !k.startsWith("_") && typeof data[0][k] !== "object"
    );

    const header = keys.join(",");
    const rows = data.map((r) =>
      keys.map((k) => `"${r[k] ?? ""}"`).join(",")
    );

    const csv = [header, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeType}-report.csv`;
    a.click();
  };

  /* ---------------- Columns ---------------- */

  const columnMap = {
    courses: [
      { key: "title", label: "Course" },
      {
        key: "status",
        label: "Status",
        render: (r) => (
          <Badge variant={r.status === "published" ? "success" : "warning"}>
            {r.status}
          </Badge>
        ),
      },
      {
        key: "tutor",
        label: "Tutor",
        render: (r) => r.assignedTutor?.name || "—",
      },
      { key: "enrollmentCount", label: "Enrollments" },
      {
        key: "sections",
        label: "Sections",
        render: (r) => r.sections?.length || 0,
      },
    ],

    students: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      {
        key: "courses",
        label: "Courses",
        render: (r) => r.enrolledCourses?.length || 0,
      },
      { key: "submissionCount", label: "Submissions" },
      { key: "certificateCount", label: "Certificates" },
      {
        key: "createdAt",
        label: "Joined",
        render: (r) =>
          new Date(r.createdAt).toLocaleDateString(),
      },
    ],

    assignments: [
      { key: "title", label: "Assignment" },
      {
        key: "course",
        label: "Course",
        render: (r) => r.courseId?.title || "—",
      },
      { key: "totalMarks", label: "Marks" },
      { key: "submissionCount", label: "Submissions" },
      { key: "gradedCount", label: "Graded" },
      {
        key: "rate",
        label: "Completion",
        render: (r) =>
          r.submissionCount > 0
            ? `${(
                (r.gradedCount / r.submissionCount) *
                100
              ).toFixed(0)}%`
            : "—",
      },
    ],

    exams: [
      { key: "title", label: "Exam" },
      {
        key: "course",
        label: "Course",
        render: (r) => r.courseId?.title || "—",
      },
      { key: "totalMarks", label: "Total Marks" },
      { key: "totalAttempts", label: "Attempts" },
      {
        key: "avgScore",
        label: "Avg Score",
        render: (r) =>
          r.avgScore
            ? r.avgScore.toFixed(1)
            : "—",
      },
      {
        key: "status",
        label: "Status",
        render: (r) => (
          <Badge
            variant={
              r.status === "completed"
                ? "success"
                : "warning"
            }
          >
            {r.status}
          </Badge>
        ),
      },
    ],
  };

  /* ---------------- Summary ---------------- */

  const summary = {
    total: data.length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <PageHeader
          title="Reports"
          subtitle="Generate insights and export platform reports"
          actions={
            <Button
              variant="outline"
              onClick={exportCSV}
              disabled={!data.length}
            >
              <Download size={16} />
              Export CSV
            </Button>
          }
        />

        {/* Report Type Selector */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {reportTypes.map((rt) => (
            <button
              key={rt.key}
              onClick={() => setActiveType(rt.key)}
              className={`p-5 rounded-2xl border transition-all flex items-center gap-4 group
              ${
                activeType === rt.key
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
              }`}
            >
              <div
                className={`p-3 rounded-xl
                ${
                  activeType === rt.key
                    ? "bg-primary/10"
                    : "bg-gray-100 group-hover:bg-gray-200"
                }`}
              >
                <rt.icon
                  size={20}
                  className={
                    activeType === rt.key
                      ? "text-primary"
                      : "text-gray-500"
                  }
                />
              </div>

              <div className="text-left">
                <p
                  className={`text-sm font-semibold
                  ${
                    activeType === rt.key
                      ? "text-primary"
                      : "text-gray-700"
                  }`}
                >
                  {rt.label}
                </p>

                <p className="text-xs text-gray-400">
                  View {rt.label} report
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Summary Card */}

        <div className="bg-white border rounded-2xl p-5 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <FileText className="text-primary" size={20} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total {activeType}
              </p>

              <h2 className="text-2xl font-bold">
                {summary.total}
              </h2>
            </div>
          </div>

          <p className="text-sm text-gray-400">
            Live data from database
          </p>

        </div>

        {/* Table */}

        <div className="bg-white rounded-2xl border p-4">

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <DataTable
              columns={columnMap[activeType] || []}
              data={data}
              emptyMessage={`No ${activeType} report data available`}
            />
          )}

        </div>

      </div>
    </AdminLayout>
  );
}