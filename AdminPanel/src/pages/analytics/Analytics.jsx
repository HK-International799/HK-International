import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, StatCard } from "../../components/ui";
import { getAnalyticsOverview } from "../../services/analyticsService";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";

import {
  TrendingUp,
  Users,
  BookOpen,
  Award,
} from "lucide-react";

const COLORS = [
  "#6366f1",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- Fetch API ---------------- */

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getAnalyticsOverview();

        setData(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ---------------- Chart Card ---------------- */

  const chartCard = (title, subtitle, children) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
      <h3 className="text-base font-semibold text-gray-800">
        {title}
      </h3>

      {subtitle && (
        <p className="text-xs text-gray-400 mt-1 mb-4">
          {subtitle}
        </p>
      )}

      {children}
    </div>
  );

  /* ---------------- Loading UI ---------------- */

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">

          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-72 bg-gray-200 rounded-2xl animate-pulse"
              />
            ))}
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

            <h2 className="font-semibold text-lg">
              Failed to load analytics
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

  if (!data) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-gray-500">
          No analytics data available
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">

        <PageHeader
          title="Analytics"
          subtitle="Platform performance and growth insights"
        />

        {/* Stats */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <StatCard
            title="Growth Rate"
            value={`${data?.growthRate || 0}%`}
            icon={TrendingUp}
            color="success"
          />

          <StatCard
            title="Active Users"
            value={data?.activeUsers || 0}
            icon={Users}
            color="primary"
          />

          <StatCard
            title="Course Completion"
            value={`${data?.completionRate || 0}%`}
            icon={BookOpen}
            color="accent"
          />

          <StatCard
            title="Avg Rating"
            value={data?.avgRating || 0}
            icon={Award}
            color="warning"
          />

        </div>

        {/* Charts */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Growth */}

          {chartCard(
            "User & Enrollment Growth",
            "Monthly trend",
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data?.monthlyGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  name="Users"
                />

                <Line
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  name="Enrollments"
                />

              </LineChart>
            </ResponsiveContainer>
          )}

          {/* Role Distribution */}

          {chartCard(
            "User Distribution",
            "By role",
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>

                <Pie
                  data={data?.roleDistribution || []}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {(data?.roleDistribution || []).map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />

              </PieChart>
            </ResponsiveContainer>
          )}

          {/* Course Performance */}

          {chartCard(
            "Course Performance",
            "Enrollment vs completion",
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.coursePerformance || []}>

                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="enrolled"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="completed"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Feedback */}

          {chartCard(
            "Feedback Ratings",
            "Average ratings",
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={data?.feedbackRatings || []}>

                <PolarGrid />

                <PolarAngleAxis
                  dataKey="type"
                />

                <Radar
                  dataKey="avg"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />

                <Tooltip />

              </RadarChart>
            </ResponsiveContainer>
          )}

        </div>

      </div>
    </AdminLayout>
  );
}