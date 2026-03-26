import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getDashboardStats } from "../../services/analyticsService";
import { useNavigate } from "react-router-dom";

import {
  Users,
  BookOpen,
  Layers,
  GraduationCap,
  ClipboardList,
  FileCheck,
  Award,
  Video,
  TrendingUp,
  PlusCircle,
  ArrowUpRight,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

const COLORS = ["#6366f1", "#06b6d4", "#10b981"];

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getDashboardStats();

        if (data) {
          setStats(data);
        } else {
          setStats(null);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ---------------- Loading UI ---------------- */

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">

          <div className="h-8 w-60 bg-gray-200 rounded animate-pulse" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
          </div>

        </div>
      </AdminLayout>
    );
  }

  /* ---------------- Error UI ---------------- */

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">

          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl">

            <h2 className="text-lg font-semibold">
              Failed to load dashboard
            </h2>

            <p className="text-sm mt-1">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Retry
            </button>

          </div>

        </div>
      </AdminLayout>
    );
  }

  /* ---------------- Empty UI ---------------- */

  if (!stats) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-gray-500">
          No dashboard data available
        </div>
      </AdminLayout>
    );
  }

  /* ---------------- Cards ---------------- */

  const cards = [
    {
      title: "Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Students",
      value: stats?.totalStudents || 0,
      icon: GraduationCap,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      title: "Courses",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Batches",
      value: stats?.totalBatches || 0,
      icon: Layers,
      color: "from-amber-500 to-amber-600",
    },
    {
      title: "Assignments",
      value: stats?.totalAssignments || 0,
      icon: ClipboardList,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Exams",
      value: stats?.totalExams || 0,
      icon: FileCheck,
      color: "from-red-500 to-red-600",
    },
    {
      title: "Live Classes",
      value: stats?.totalLiveClasses || 0,
      icon: Video,
      color: "from-pink-500 to-pink-600",
    },
    {
      title: "Certificates",
      value: stats?.totalCertificates || 0,
      icon: Award,
      color: "from-teal-500 to-teal-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>

            <p className="text-gray-500 mt-1">
              Welcome back 👋 Manage your LMS system efficiently
            </p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">

            <button
              onClick={() => navigate("/admin/courses")}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
            >
              <PlusCircle size={16} />
              Add Course
            </button>

            <button
              onClick={() => navigate("/admin/analytics")}
              className="flex items-center gap-2 bg-white border px-4 py-2 rounded-xl hover:bg-gray-50 transition"
            >
              <TrendingUp size={16} />
              Analytics
            </button>

          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

          {cards.map((card, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl text-white shadow-md bg-gradient-to-br ${card.color} hover:scale-105 transition`}
            >
              <div className="flex justify-between">

                <div>
                  <p className="text-sm opacity-80">
                    {card.title}
                  </p>

                  <h2 className="text-2xl font-bold mt-1">
                    {card.value}
                  </h2>
                </div>

                <card.icon className="opacity-80" />

              </div>

              <div className="flex items-center text-xs mt-4 opacity-90">
                <ArrowUpRight size={14} className="mr-1" />
                Live Data
              </div>
            </div>
          ))}

        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* User Growth */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">

            <div className="flex justify-between mb-6">

              <div>
                <h3 className="font-semibold text-gray-800">
                  User Growth
                </h3>

                <p className="text-sm text-gray-400">
                  Monthly registrations
                </p>
              </div>

              <div className="text-green-500 flex items-center">
                <TrendingUp size={16} className="mr-1" />
                Live
              </div>

            </div>

            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats?.monthlyUsers || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#6366f1"
                  fill="#6366f133"
                />
              </AreaChart>
            </ResponsiveContainer>

          </div>

          {/* Pie */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">

            <h3 className="font-semibold text-gray-800 mb-4">
              User Distribution
            </h3>

            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats?.roleDistribution || []}
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                >
                  {(stats?.roleDistribution || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

          </div>

        </div>

        {/* Bottom */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Recent Users */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">

            <h3 className="font-semibold mb-4">
              Recent Users
            </h3>

            <div className="space-y-3">

              {(stats?.recentUsers || []).map((u) => (

                <div
                  key={u._id}
                  className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      {u?.name?.charAt(0)}
                    </div>

                    <div>
                      <p className="font-medium">
                        {u?.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {u?.email}
                      </p>
                    </div>

                  </div>

                  <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                    {u?.role}
                  </span>

                </div>
              ))}

            </div>

          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl text-white shadow">

            <h3 className="text-lg font-semibold mb-4">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-4">

              <button
                onClick={() => navigate("/admin/courses")}
                className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition"
              >
                Add Course
              </button>

              <button
                onClick={() => navigate("/admin/assignments")}
                className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition"
              >
                Add Assignment
              </button>

              <button
                onClick={() => navigate("/admin/tutors")}
                className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition"
              >
                Add Tutor
              </button>

              <button
                onClick={() => navigate("/admin/students")}
                className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition"
              >
                Add Student
              </button>

            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}