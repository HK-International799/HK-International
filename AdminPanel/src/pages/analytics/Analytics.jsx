import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, StatCard } from "../../components/ui";
import { getAnalyticsOverview } from "../../services/analyticsService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { TrendingUp, Users, BookOpen, Award } from "lucide-react";

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// Demo data
const demoMonthly = [
  { month: "Jul", users: 45, enrollments: 120 }, { month: "Aug", users: 62, enrollments: 145 },
  { month: "Sep", users: 78, enrollments: 190 }, { month: "Oct", users: 91, enrollments: 210 },
  { month: "Nov", users: 85, enrollments: 185 }, { month: "Dec", users: 110, enrollments: 240 },
  { month: "Jan", users: 124, enrollments: 280 }, { month: "Feb", users: 138, enrollments: 310 },
  { month: "Mar", users: 156, enrollments: 350 },
];

const demoRoles = [{ name: "Students", value: 980 }, { name: "Tutors", value: 45 }, { name: "Admins", value: 5 }];
const demoCourses = [{ name: "Web Dev", enrolled: 245, completed: 180 }, { name: "Data Sci", enrolled: 198, completed: 120 }, { name: "UI/UX", enrolled: 167, completed: 95 }, { name: "Mobile", enrolled: 143, completed: 88 }, { name: "DevOps", enrolled: 98, completed: 62 }];
const demoFeedback = [{ type: "Course", avg: 4.2 }, { type: "Tutor", avg: 4.5 }, { type: "Platform", avg: 3.8 }, { type: "Support", avg: 4.0 }, { type: "Content", avg: 4.3 }];

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => { try { const d = await getAnalyticsOverview(); setData(d); } catch { } };
    load();
  }, []);

  const chartCard = (title, subtitle, children) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5 mb-4">{subtitle}</p>}
      {children}
    </div>
  );

  return (
    <AdminLayout>
      <div className="animate-fadeIn space-y-6">
        <PageHeader title="Analytics" subtitle="Platform performance insights" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Growth Rate" value="+12.5%" icon={TrendingUp} color="success" />
          <StatCard title="Active Users" value="856" icon={Users} color="primary" />
          <StatCard title="Course Completion" value="68%" icon={BookOpen} color="accent" />
          <StatCard title="Avg Rating" value="4.3" icon={Award} color="warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartCard("User & Enrollment Growth", "Monthly trend", (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={demoMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} name="Users" />
                <Line type="monotone" dataKey="enrollments" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} name="Enrollments" />
              </LineChart>
            </ResponsiveContainer>
          ))}

          {chartCard("User Distribution", "By role", (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={demoRoles} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {demoRoles.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
          ))}

          {chartCard("Course Performance", "Enrollment vs Completion", (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={demoCourses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                <Legend />
                <Bar dataKey="enrolled" fill="#6366f1" radius={[4, 4, 0, 0]} name="Enrolled" />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          ))}

          {chartCard("Feedback Ratings", "Average by category", (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={demoFeedback}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="type" tick={{ fontSize: 12, fill: "#64748b" }} />
                <Radar name="Avg Rating" dataKey="avg" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              </RadarChart>
            </ResponsiveContainer>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
