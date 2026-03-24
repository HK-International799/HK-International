import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Video,
  Calendar,
  Clock,
  ExternalLink,
  Users,
  Loader2,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import { getLiveClasses } from "../../services/studentService";

const StatusBadge = ({ status }) => {
  const styles = {
    scheduled: "bg-blue-50 text-blue-600 border-blue-200",
    live: "bg-green-50 text-green-600 border-green-200",
    completed: "bg-gray-50 text-gray-500 border-gray-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
  };
  const icons = {
    scheduled: <Clock className="w-3 h-3" />,
    live: <PlayCircle className="w-3 h-3" />,
    completed: <CheckCircle2 className="w-3 h-3" />,
    cancelled: <AlertCircle className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.scheduled}`}>
      {icons[status]} {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default function LiveClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getLiveClasses();
        setClasses(Array.isArray(data) ? data : []);
      } catch {
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const filtered = filter === "all" ? classes : classes.filter((c) => c.status === filter);

  const formatDate = (d) => {
    if (!d) return "TBD";
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    });
  };

  const formatTime = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <MainLayout>
      <div className="pb-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-6 h-6 text-orange-500" />
            Live classes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Join scheduled sessions and access recordings
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          {["all", "scheduled", "live", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === f
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700">No live classes found</h3>
            <p className="text-sm text-gray-400 mt-1">
              {filter !== "all" ? "Try changing the filter" : "No classes scheduled yet"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((cls, i) => (
              <motion.div
                key={cls._id || i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-orange-100 transition-all group"
              >
                <div className={`h-1.5 ${cls.status === "live" ? "bg-green-500" : cls.status === "scheduled" ? "bg-blue-500" : "bg-gray-300"}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1 mr-2">
                      {cls.title || "Live class"}
                    </h3>
                    <StatusBadge status={cls.status || "scheduled"} />
                  </div>

                  {cls.description && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {cls.description}
                    </p>
                  )}

                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{formatDate(cls.scheduledAt)}</span>
                      {cls.scheduledAt && (
                        <span className="text-gray-400">at {formatTime(cls.scheduledAt)}</span>
                      )}
                    </div>
                    {cls.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{cls.duration} min</span>
                      </div>
                    )}
                    {cls.courseId?.title && (
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{cls.courseId.title}</span>
                      </div>
                    )}
                    {cls.tutorId?.name && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>{cls.tutorId.name}</span>
                      </div>
                    )}
                  </div>

                  {cls.meetingLink && cls.status !== "completed" && (
                    <a
                      href={cls.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition ${
                        cls.status === "live"
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                      }`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      {cls.status === "live" ? "Join now" : "Open link"}
                    </a>
                  )}

                  {cls.recordingUrl && (
                    <a
                      href={cls.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Watch recording
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
