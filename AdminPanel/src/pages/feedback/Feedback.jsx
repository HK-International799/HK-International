import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, Badge, Button, StatCard } from "../../components/ui";
import { getAllFeedback, getFeedbackStats, updateFeedbackStatus, deleteFeedback } from "../../services/feedbackService";
import { MessageSquare, Star, Trash2, CheckCircle, Search, BarChart3 } from "lucide-react";

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const [fb, st] = await Promise.all([getAllFeedback(), getFeedbackStats()]);
      setFeedbacks(Array.isArray(fb) ? fb : []);
      setStats(st);
    } catch { }
  };

  const handleStatus = async (id, status) => { try { await updateFeedbackStatus(id, status); load(); } catch { } };
  const handleDelete = async (id) => { if (!confirm("Delete?")) return; try { await deleteFeedback(id); load(); } catch { } };

  const filtered = feedbacks.filter((f) => {
    const matchSearch = f.comment?.toLowerCase().includes(search.toLowerCase()) || f.fromUser?.name?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || f.type === typeFilter;
    return matchSearch && matchType;
  });

  const statusColor = { new: "primary", read: "warning", resolved: "success" };
  const renderStars = (n) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={14} className={i < (n || 0) ? "text-warning fill-warning" : "text-gray-200"} />
  ));

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader title="Feedback" subtitle="Student & tutor feedback" />

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Feedback" value={stats.total} icon={MessageSquare} color="primary" />
            <StatCard title="Avg Rating" value={stats.avgRating?.toFixed(1) || "—"} icon={Star} color="warning" />
            <StatCard title="New" value={stats.byStatus?.find((s) => s._id === "new")?.count || 0} icon={BarChart3} color="accent" />
            <StatCard title="Resolved" value={stats.byStatus?.find((s) => s._id === "resolved")?.count || 0} icon={CheckCircle} color="success" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search feedback..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "course", "tutor", "platform", "general"].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${typeFilter === t ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((f) => (
            <div key={f._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {f.fromUser?.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-800">{f.fromUser?.name || "Anonymous"}</p>
                      <Badge variant={statusColor[f.status]}>{f.status}</Badge>
                      <Badge variant="default">{f.type}</Badge>
                    </div>
                    {f.rating && <div className="flex items-center gap-0.5 mt-1">{renderStars(f.rating)}</div>}
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{f.comment}</p>
                    {f.courseId && <p className="text-xs text-gray-400 mt-1.5">Course: {f.courseId.title}</p>}
                    <p className="text-xs text-gray-300 mt-1">{new Date(f.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {f.status !== "resolved" && (
                    <button onClick={() => handleStatus(f._id, "resolved")} className="p-1.5 rounded-lg hover:bg-green-50" title="Mark Resolved">
                      <CheckCircle size={16} className="text-success" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(f._id)} className="p-1.5 rounded-lg hover:bg-red-50">
                    <Trash2 size={16} className="text-danger" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-gray-400 py-12">No feedback found</p>}
        </div>
      </div>
    </AdminLayout>
  );
}
