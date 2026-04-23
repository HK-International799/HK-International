import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Users,
  FileText,
  Archive,
  RefreshCw,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  getAllScenarioExams,
  archiveScenarioExam,
  publishScenarioExam,
} from "../../services/scenarioExamService";

const StatusBadge = ({ status }) => {
  const map = {
    draft: "bg-yellow-100 text-yellow-700",
    published: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status === "published" && <CheckCircle2 size={10} />}
      {status}
    </span>
  );
};

export default function AdminExamListPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [actionId, setActionId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllScenarioExams();
      setExams(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePublish = async (examId) => {
    if (!window.confirm("Publish this exam? Students will be able to see it."))
      return;
    setActionId(examId);
    try {
      await publishScenarioExam(examId);
      setExams((prev) =>
        prev.map((e) =>
          e._id === examId ? { ...e, status: "published" } : e
        )
      );
    } catch (e) {
      alert(e.response?.data?.message || "Publish failed");
    } finally {
      setActionId(null);
    }
  };

  const handleArchive = async (examId) => {
    if (!window.confirm("Archive this exam?")) return;
    setActionId(examId);
    try {
      await archiveScenarioExam(examId);
      setExams((prev) =>
        prev.map((e) =>
          e._id === examId ? { ...e, status: "archived" } : e
        )
      );
    } catch (e) {
      alert(e.response?.data?.message || "Archive failed");
    } finally {
      setActionId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Scenario Exams
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage PDF-based scenario exams for students
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => navigate("/admin/scenario-exams/create")}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg px-4 py-2 font-medium"
            >
              <Plus size={15} /> New Exam
            </button>
          </div>
        </div>

        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
            {err}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-gray-400">
              <Loader2 className="animate-spin" size={20} /> Loading exams…
            </div>
          ) : exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
              <FileText size={40} className="mb-3 opacity-30" />
              <p className="text-sm">No scenario exams yet.</p>
              <button
                onClick={() => navigate("/admin/scenario-exams/create")}
                className="mt-3 text-indigo-600 hover:underline text-sm"
              >
                Create your first exam
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b text-left">
                <tr>
                  <th className="p-4 font-medium text-gray-600">Title</th>
                  <th className="p-4 font-medium text-gray-600">Status</th>
                  <th className="p-4 font-medium text-gray-600">Duration</th>
                  <th className="p-4 font-medium text-gray-600">Scenarios</th>
                  <th className="p-4 font-medium text-gray-600">Created By</th>
                  <th className="p-4 text-right font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {exams.map((exam) => (
                  <tr
                    key={exam._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-medium text-gray-800">
                        {exam.title}
                      </span>
                      {exam.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                          {exam.description}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={exam.status} />
                    </td>
                    <td className="p-4 text-gray-600">
                      {exam.duration} min
                    </td>
                    <td className="p-4 text-gray-600">
                      {exam.questions?.length ?? 0}
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {exam.createdBy?.name || "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        {actionId === exam._id ? (
                          <Loader2 size={14} className="animate-spin text-gray-400" />
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/scenario-exams/${exam._id}/edit`
                                )
                              }
                              className="p-1.5 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/scenario-exams/${exam._id}/submissions`
                                )
                              }
                              className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                              title="View Submissions"
                            >
                              <Users size={14} />
                            </button>

                            {exam.status === "draft" && (
                              <button
                                onClick={() => handlePublish(exam._id)}
                                className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                                title="Publish"
                              >
                                <Send size={14} />
                              </button>
                            )}

                            {exam.status !== "archived" && (
                              <button
                                onClick={() => handleArchive(exam._id)}
                                className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                title="Archive"
                              >
                                <Archive size={14} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}