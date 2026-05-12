import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getDashboardStats } from "../../services/analyticsService";
import { getAdminStats } from "../../services/adminService";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  Layers,
  GraduationCap,
  ClipboardList,
  Award,
  Video,
  TrendingUp,
  PlusCircle,
  ArrowUpRight,
  ClipboardCheck,
  Building2,
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
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [d, a] = await Promise.all([
          getDashboardStats().catch(() => null),
          getAdminStats().catch(() => null),
        ]);
        setStats(d);
        setAdminStats(a);
      } catch {
        setError("Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 w-60 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-28 bg-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </AdminLayout>
    );

  if (error && !stats && !adminStats)
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl">
          <h2 className="font-semibold">Failed to load</h2>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );

  const s = stats || {},
    a = adminStats || {};
  const cards = [
    {
      title: "Total Users",
      value: s.totalUsers || 0,
      icon: Users,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Students",
      value: a.totalStudents || s.totalStudents || 0,
      icon: GraduationCap,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      title: "Courses",
      value: a.totalCourses || s.totalCourses || 0,
      icon: BookOpen,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Batches",
      value: s.totalBatches || 0,
      icon: Layers,
      color: "from-amber-500 to-amber-600",
    },
    {
      title: "Registrations",
      value: a.totalRegistrations || s.totalRegistrations || 0,
      icon: ClipboardCheck,
      color: "from-violet-500 to-violet-600",
    },
    {
      title: "Certificates",
      value: s.totalCertificates || 0,
      icon: Award,
      color: "from-teal-500 to-teal-600",
    },
    {
      title: "Assignments",
      value: s.totalAssignments || 0,
      icon: ClipboardList,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Live Classes",
      value: s.totalLiveClasses || 0,
      icon: Video,
      color: "from-pink-500 to-pink-600",
    },
  ];

  const roleData = [
    { name: "Students", value: a.totalStudents || s.totalStudents || 0 },
    { name: "Tutors", value: a.totalTutors || s.totalTutors || 0 },
  ].filter((d) => d.value > 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Overview of your LMS platform
            </p>
          </div>
          {/* <div className="flex gap-3 mt-4 md:mt-0">
            
            <button
              onClick={() => navigate("/admin/registrations")}
              className="flex items-center gap-2 bg-white border px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
            >
              <ClipboardCheck size={16} />
              Registrations
            </button>
          </div> */}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((c, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl text-white shadow-md bg-gradient-to-br ${c.color} hover:scale-[1.02] transition-transform`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-80">{c.title}</p>
                  <h2 className="text-2xl font-bold mt-1">{c.value}</h2>
                </div>
                <c.icon size={22} className="opacity-70" />
              </div>
              <div className="flex items-center text-xs mt-3 opacity-80">
                <ArrowUpRight size={14} className="mr-1" />
                Live
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">
                  Platform Overview
                </h3>
                <p className="text-sm text-gray-400">Key metrics</p>
              </div>
              <div className="text-emerald-500 flex items-center text-sm">
                <TrendingUp size={16} className="mr-1" />
                Live
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={[
                  {
                    name: "Students",
                    v: a.totalStudents || s.totalStudents || 0,
                  },
                  { name: "Courses", v: a.totalCourses || s.totalCourses || 0 },
                  { name: "Batches", v: s.totalBatches || 0 },
                  { name: "Certs", v: s.totalCertificates || 0 },
                  { name: "Regs", v: a.totalRegistrations || 0 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="v" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">
              User Distribution
            </h3>
            {roleData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={roleData}
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {roleData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {roleData.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-xs text-gray-500"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[i] }}
                      />
                      {d.name}: {d.value}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No data yet
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Recent Users</h3>
            <div className="space-y-2">
              {(s.recentUsers || []).length > 0 ? (
                s.recentUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                        {u?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {u?.name}
                        </p>
                        <p className="text-xs text-gray-400">{u?.email}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600">
                      {u?.role}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">
                  No recent users
                </p>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl text-white shadow">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Add Course", t: "/admin/courses" },
                { l: "Add Student", t: "/admin/learners" },
                // { l: "Institutes", t: "/admin/institutes" },
                // { l: "Registrations", t: "/admin/registrations" },
                // { l: "Orientation", t: "/admin/orientation" },
                // { l: "Certificates", t: "/admin/certificates" },
              ].map((a) => (
                <>
                  <button
                    key={a.t}
                    onClick={() => navigate(a.t)}
                    className="bg-white/10 p-3.5 rounded-xl text-sm hover:bg-white/40 transition text-left flex items-center gap-2"
                  >
                     <PlusCircle size={16} />
                    {a.l}
                  </button>
                </>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
