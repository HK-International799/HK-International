import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  Hourglass,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getExamSubmissions } from "../../services/scenarioExamService";

const statusBadge = (s) => {
  const map = {
    in_progress: "bg-yellow-100 text-yellow-700",
    submitted: "bg-blue-100 text-blue-700",
    reviewed: "bg-green-100 text-green-700",
  };
  return map[s] || "bg-gray-100 text-gray-700";
};

const statusIcon = (s) => {
  if (s === "in_progress") return <Hourglass size={12} className="inline" />;
  if (s === "submitted") return <Clock size={12} className="inline" />;
  if (s === "reviewed") return <CheckCircle2 size={12} className="inline" />;
  return null;
};

export default function AdminSubmissionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getExamSubmissions(id);
        setSubmissions(res.data || []);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <button
          onClick={() => navigate("/admin/scenario-exams")}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back to exams
        </button>

        <h1 className="text-2xl font-semibold text-gray-800">
          Exam Submissions
        </h1>

        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md">
            {err}
          </div>
        )}

        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Attempt #</th>
                <th className="p-3">Status</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Marks</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-400">
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-gray-800">
                      {s.studentId?.name || "—"}
                      <div className="text-xs text-gray-500">
                        {s.studentId?.email}
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{s.attemptNumber}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${statusBadge(
                          s.status,
                        )}`}
                      >
                        {statusIcon(s.status)} {s.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      {s.submittedAt
                        ? new Date(s.submittedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {s.status === "reviewed" ? s.totalMarksObtained : "—"}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/admin/scenario-exams/attempts/${s._id}/review`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs"
                      >
                        <FileText size={14} />
                        {s.status === "reviewed" ? "View" : "Review"}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
