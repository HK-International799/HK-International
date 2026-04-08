import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Award, BookOpen, TrendingUp, CheckCircle2,
  Clock, AlertCircle, BarChart2, Loader2, Building2,
  GraduationCap, FileText,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import AOLayout from "./AOLayout";
import { getAoDashboard } from "../../services/aoService";

const MOCK_DASHBOARD = {
  stats: {
    totalLearners: 247,
    activeLearners: 183,
    totalCertifications: 189,
    pendingCertifications: 14,
    completionRate: 76,
    totalCourses: 8,
    partnerInstitutes: 5,
    thisMonthEnrollments: 23,
  },
  enrollmentTrend: [
    { month: "Oct", enrollments: 18, completions: 9 },
    { month: "Nov", enrollments: 24, completions: 14 },
    { month: "Dec", enrollments: 15, completions: 11 },
    { month: "Jan", enrollments: 31, completions: 18 },
    { month: "Feb", enrollments: 28, completions: 22 },
    { month: "Mar", enrollments: 23, completions: 17 },
  ],
  certsByCourse: [
    { course: "IOSH Managing Safely", certs: 64 },
    { course: "IOSH Working Safely", certs: 48 },
    { course: "OTHM Level 6", certs: 31 },
    { course: "OSH Fundamentals", certs: 27 },
    { course: "PECB ISO 45001", certs: 19 },
  ],
  statusBreakdown: [
    { name: "Certified", value: 189, color: "#10b981" },
    { name: "In Progress", value: 44, color: "#6366f1" },
    { name: "Not Started", value: 14, color: "#e5e7eb" },
  ],
  recentActivity: [
    { id: 1, learner: "Priya Sharma", action: "Certificate issued", course: "IOSH Managing Safely", time: "2 hours ago", type: "cert" },
    { id: 2, learner: "James Okafor", action: "Quiz passed", course: "OSH Fundamentals", time: "5 hours ago", type: "quiz" },
    { id: 3, learner: "Maria Santos", action: "Enrolled", course: "OTHM Level 6", time: "1 day ago", type: "enroll" },
    { id: 4, learner: "Rajesh Kumar", action: "Certificate issued", course: "IOSH Working Safely", time: "1 day ago", type: "cert" },
    { id: 5, learner: "Fatima Al-Hassan", action: "Assignment submitted", course: "PECB ISO 45001", time: "2 days ago", type: "assign" },
  ],
};

const ACTIVITY_COLORS = {
  cert: { bg: "bg-yellow-100", icon: Award, color: "text-yellow-600" },
  quiz: { bg: "bg-green-100", icon: CheckCircle2, color: "text-green-600" },
  enroll: { bg: "bg-indigo-100", icon: GraduationCap, color: "text-indigo-600" },
  assign: { bg: "bg-purple-100", icon: FileText, color: "text-purple-600" },
};

function StatCard({ icon: Icon, label, value, sub, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

export default function AODashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAoDashboard();
        setData(res);
      } catch {
        setData(MOCK_DASHBOARD);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <AOLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </AOLayout>
    );
  }

  const { stats, enrollmentTrend, certsByCourse, statusBreakdown, recentActivity } = data;

  return (
    <AOLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AO Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Awarding Organisation overview — read-only view
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Learners" value={stats.totalLearners}
          sub={`${stats.activeLearners} active`} color="bg-indigo-500" delay={0} />
        <StatCard icon={Award} label="Certifications Issued" value={stats.totalCertifications}
          sub={`${stats.pendingCertifications} pending`} color="bg-amber-500" delay={0.05} />
        <StatCard icon={TrendingUp} label="Completion Rate" value={`${stats.completionRate}%`}
          sub="across all courses" color="bg-green-500" delay={0.1} />
        <StatCard icon={Building2} label="Partner Institutes" value={stats.partnerInstitutes}
          sub={`${stats.totalCourses} active courses`} color="bg-purple-500" delay={0.15} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Enrollment Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="font-bold text-gray-900 mb-1">Enrollment & Completion Trend</h3>
          <p className="text-xs text-gray-400 mb-6">Last 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={enrollmentTrend}>
              <defs>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="completeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="enrollments" stroke="#6366f1" strokeWidth={2}
                fill="url(#enrollGrad)" name="Enrollments" />
              <Area type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={2}
                fill="url(#completeGrad)" name="Completions" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="font-bold text-gray-900 mb-1">Learner Status</h3>
          <p className="text-xs text-gray-400 mb-4">Current distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="value" paddingAngle={3}>
                {statusBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Certs by Course */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="font-bold text-gray-900 mb-1">Certifications by Course</h3>
          <p className="text-xs text-gray-400 mb-6">Total issued per programme</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={certsByCourse} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="course" width={130} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="certs" fill="#6366f1" radius={[0, 6, 6, 0]} name="Certificates" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="font-bold text-gray-900 mb-1">Recent Activity</h3>
          <p className="text-xs text-gray-400 mb-5">Latest learner events</p>
          <div className="space-y-4">
            {recentActivity.map((item) => {
              const cfg = ACTIVITY_COLORS[item.type] || ACTIVITY_COLORS.enroll;
              const Icon = cfg.icon;
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.learner}</p>
                    <p className="text-xs text-gray-500">{item.action} · <span className="text-indigo-600">{item.course}</span></p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-auto">{item.time}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AOLayout>
  );
}
