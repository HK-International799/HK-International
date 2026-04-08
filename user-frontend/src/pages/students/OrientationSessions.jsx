import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Clock, Users, PlayCircle, CheckCircle2,
  AlertCircle, Loader2, Video, BookOpen, Award, ChevronRight,
  MapPin, Wifi, WifiOff,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import { getMySessions, joinSession } from "../../services/orientationService";
import { toast } from "sonner";

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700", icon: Clock },
  live: { label: "Live Now", color: "bg-green-100 text-green-700 animate-pulse", icon: Wifi },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-600", icon: CheckCircle2 },
  missed: { label: "Missed", color: "bg-red-100 text-red-600", icon: WifiOff },
};

const MOCK_SESSIONS = [
  {
    _id: "s1",
    title: "IOSH Level 3 — Induction Orientation",
    course: "IOSH Managing Safely",
    date: "2026-04-10T10:00:00Z",
    duration: 90,
    mode: "online",
    link: "https://meet.example.com/iosh-orientation",
    status: "scheduled",
    maxParticipants: 30,
    enrolled: 18,
    attended: false,
    quizAttempted: false,
    quizPassed: false,
    certificateAvailable: false,
    description: "Mandatory orientation session covering course structure, assessment methods, and key OSH regulations.",
  },
  {
    _id: "s2",
    title: "OSH Fundamentals — Batch B Orientation",
    course: "OSH Fundamentals",
    date: "2026-03-25T14:00:00Z",
    duration: 60,
    mode: "online",
    link: "https://meet.example.com/osh-orientation",
    status: "completed",
    maxParticipants: 25,
    enrolled: 22,
    attended: true,
    quizAttempted: true,
    quizPassed: true,
    certificateAvailable: true,
    score: 85,
    description: "Introduction to workplace health and safety fundamentals, risk assessment basics, and legal frameworks.",
  },
  {
    _id: "s3",
    title: "OTHM Level 6 — Programme Overview",
    course: "OTHM Level 6 OSH",
    date: "2026-04-15T11:00:00Z",
    duration: 120,
    mode: "offline",
    venue: "Training Room A, HK International Centre",
    status: "scheduled",
    maxParticipants: 20,
    enrolled: 12,
    attended: false,
    quizAttempted: false,
    quizPassed: false,
    certificateAvailable: false,
    description: "Comprehensive orientation for OTHM Level 6 covering module breakdown, research requirements, and assessment criteria.",
  },
];

export default function OrientationSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMySessions();
        setSessions(data?.length ? data : MOCK_SESSIONS);
      } catch {
        setSessions(MOCK_SESSIONS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleJoin = async (session) => {
    if (session.mode === "online" && session.link) {
      setJoiningId(session._id);
      try {
        await joinSession(session._id);
        window.open(session.link, "_blank");
        toast.success("Joined session successfully!");
        setSessions((prev) =>
          prev.map((s) => (s._id === session._id ? { ...s, attended: true } : s))
        );
      } catch {
        window.open(session.link, "_blank");
      } finally {
        setJoiningId(null);
      }
    }
  };

  const filtered = sessions.filter((s) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return s.status === "scheduled" || s.status === "live";
    if (filter === "completed") return s.status === "completed";
    return true;
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading sessions...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-lg"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/20 rounded-xl">
              <Video className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Orientation Sessions</h1>
              <p className="text-indigo-200 text-sm mt-0.5">
                Attend sessions · Complete quizzes · Download certificates
              </p>
            </div>
          </div>
          {/* Stats */}
          <div className="flex gap-6 mt-6 text-sm">
            {[
              { label: "Total", value: sessions.length },
              { label: "Attended", value: sessions.filter((s) => s.attended).length },
              { label: "Passed", value: sessions.filter((s) => s.quizPassed).length },
              { label: "Certificates", value: sessions.filter((s) => s.certificateAvailable).length },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-indigo-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {["all", "upcoming", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sessions Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filtered.map((session, i) => {
              const StatusIcon = STATUS_CONFIG[session.status]?.icon || Clock;
              const statusCfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.scheduled;
              const canAttemptQuiz = session.attended && !session.quizAttempted;
              const canViewResult = session.quizAttempted;
              const canDownloadCert = session.certificateAvailable;

              return (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Top bar */}
                  <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                  <div className="p-6">
                    {/* Status + Mode */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        {session.mode === "online" ? (
                          <><Wifi className="w-3.5 h-3.5 text-green-500" /> Online</>
                        ) : (
                          <><MapPin className="w-3.5 h-3.5 text-orange-500" /> In-Person</>
                        )}
                      </span>
                    </div>

                    {/* Title + Course */}
                    <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1">
                      {session.title}
                    </h3>
                    <p className="text-xs text-indigo-600 font-medium mb-3 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {session.course}
                    </p>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
                      {session.description}
                    </p>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                        <CalendarDays className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="text-xs">
                          {new Date(session.date).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                        <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="text-xs">
                          {new Date(session.date).toLocaleTimeString("en-GB", {
                            hour: "2-digit", minute: "2-digit",
                          })} · {session.duration}min
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                        <Users className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-xs">
                          {session.enrolled}/{session.maxParticipants} enrolled
                        </span>
                      </div>
                      {session.score !== undefined && (
                        <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
                          <Award className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs font-semibold text-green-700">
                            Score: {session.score}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 mb-5">
                      {[
                        { label: "Attend", done: session.attended },
                        { label: "Quiz", done: session.quizAttempted },
                        { label: "Pass", done: session.quizPassed },
                        { label: "Certificate", done: session.certificateAvailable },
                      ].map((step, idx) => (
                        <div key={step.label} className="flex items-center">
                          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${
                            step.done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                          }`}>
                            {step.done ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                            {step.label}
                          </div>
                          {idx < 3 && <ChevronRight className="w-3 h-3 text-gray-300 mx-0.5" />}
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {(session.status === "live" || session.status === "scheduled") && session.mode === "online" && (
                        <button
                          onClick={() => handleJoin(session)}
                          disabled={joiningId === session._id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-60"
                        >
                          {joiningId === session._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <PlayCircle className="w-4 h-4" />
                          )}
                          {session.status === "live" ? "Join Now" : "Join Session"}
                        </button>
                      )}

                      {session.status === "offline" && (
                        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 text-orange-700 text-sm font-medium">
                          <MapPin className="w-4 h-4" />
                          {session.venue || "In-Person Event"}
                        </div>
                      )}

                      {canAttemptQuiz && (
                        <button
                          onClick={() => navigate(`/student/orientation/${session._id}/quiz`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all"
                        >
                          <BookOpen className="w-4 h-4" />
                          Attempt Quiz
                        </button>
                      )}

                      {canViewResult && !canDownloadCert && (
                        <button
                          onClick={() => navigate(`/student/orientation/${session._id}/result`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-all"
                        >
                          <AlertCircle className="w-4 h-4" />
                          View Result
                        </button>
                      )}

                      {canDownloadCert && (
                        <button
                          onClick={() => navigate(`/student/orientation/${session._id}/certificate`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm font-semibold hover:from-yellow-600 hover:to-amber-600 transition-all shadow-sm"
                        >
                          <Award className="w-4 h-4" />
                          Download Certificate
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Video className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-700 text-lg mb-2">No sessions found</h3>
            <p className="text-sm text-gray-400">
              {filter === "upcoming"
                ? "No upcoming sessions scheduled yet."
                : "No sessions available in this category."}
            </p>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
