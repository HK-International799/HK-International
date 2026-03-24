import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { StatCard, Badge } from "../../components/ui";
import { getDashboardStats } from "../../services/analyticsService";
import {
  Users, BookOpen, Layers, GraduationCap, ClipboardList, FileCheck,
  Award, Video, TrendingUp, ArrowUpRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend,
} from "recharts";

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// Mock data for demo when API isn't connected
const mockStats = {
  totalUsers: 1284, totalStudents: 980, totalTutors: 45, totalCourses: 32,
  totalBatches: 18, totalAssignments: 96, totalExams: 24, totalCertificates: 312,
  totalLiveClasses: 67, totalEnrollments: 2456,
  recentUsers: [
    { _id: "1", name: "Priya Sharma", email: "priya@demo.com", role: "student", createdAt: new Date().toISOString() },
    { _id: "2", name: "Raj Patel", email: "raj@demo.com", role: "tutor", createdAt: new Date().toISOString() },
    { _id: "3", name: "Ananya Gupta", email: "ananya@demo.com", role: "student", createdAt: new Date().toISOString() },
  ],
};

const mockMonthly = [
  { name: "Jul", users: 45 }, { name: "Aug", users: 62 }, { name: "Sep", users: 78 },
  { name: "Oct", users: 91 }, { name: "Nov", users: 85 }, { name: "Dec", users: 110 },
  { name: "Jan", users: 124 }, { name: "Feb", users: 138 }, { name: "Mar", users: 156 },
];

const mockPie = [
  { name: "Students", value: 980 }, { name: "Tutors", value: 45 }, { name: "Admins", value: 5 },
];

const mockCourseEnroll = [
  { name: "Web Dev", enrolled: 245 }, { name: "Data Science", enrolled: 198 },
  { name: "UI/UX", enrolled: 167 }, { name: "Mobile Dev", enrolled: 143 },
  { name: "DevOps", enrolled: 98 }, { name: "AI/ML", enrolled: 87 },
];

export default function Dashboard() {
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        if (data) setStats(data);
      } catch {
        // Use mock data on error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "primary" },
    { title: "Students", value: stats.totalStudents, icon: GraduationCap, color: "accent" },
    { title: "Courses", value: stats.totalCourses, icon: BookOpen, color: "success" },
    { title: "Batches", value: stats.totalBatches, icon: Layers, color: "warning" },
    { title: "Assignments", value: stats.totalAssignments, icon: ClipboardList, color: "primary" },
    { title: "Exams", value: stats.totalExams, icon: FileCheck, color: "danger" },
    { title: "Live Classes", value: stats.totalLiveClasses, icon: Video, color: "accent" },
    { title: "Certificates", value: stats.totalCertificates, icon: Award, color: "success" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back! Here's your LMS overview.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <div key={card.title} style={{ animationDelay: `${i * 50}ms` }} className="animate-fadeIn">
              <StatCard {...card} />
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Growth Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-800">User Growth</h3>
                <p className="text-xs text-gray-400 mt-0.5">Monthly registrations</p>
              </div>
              <div className="flex items-center gap-1 text-success text-sm font-medium">
                <TrendingUp size={16} /> +12.5%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={mockMonthly}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Role Distribution Pie */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-1">User Distribution</h3>
            <p className="text-xs text-gray-400 mb-4">By role</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={mockPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {mockPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {mockPie.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Enrollments Bar Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-1">Top Courses by Enrollment</h3>
            <p className="text-xs text-gray-400 mb-6">Student enrollment per course</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mockCourseEnroll} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={85} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                <Bar dataKey="enrolled" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-4">Recent Users</h3>
            <div className="space-y-3">
              {(stats.recentUsers || []).map((u) => (
                <div key={u._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold">
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                  <Badge variant={u.role === "admin" ? "danger" : u.role === "tutor" ? "warning" : "primary"}>
                    {u.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
