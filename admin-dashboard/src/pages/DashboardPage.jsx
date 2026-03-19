import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import AdminLayout from "../components/layout/AdminLayout";
import StatsCard from "../components/admin/StatsCard";

import {
  BookOpen,
  Users,
  UserCheck,
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalTutors: 0,
  });

  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/activity"),
        ]);

        setStats(statsRes.data);
        setActivity(activityRes.data);

      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ⏳ Loading State
  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-gray-500">Loading dashboard...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Welcome back, manage your LMS efficiently 🚀
          </p>
        </div>

        {/* 🔥 Create User Button */}
        <button
          onClick={() => navigate("/admin/create-user")}
          className="bg-black text-white px-4 py-2 rounded hover:opacity-90"
        >
          + Create User
        </button>
      </div>

      {/* ✅ Stats Section (REAL DATA) */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">

        <StatsCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={<BookOpen size={20} />}
        />

        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<Users size={20} />}
        />

        <StatsCard
          title="Total Tutors"
          value={stats.totalTutors}
          icon={<UserCheck size={20} />}
        />

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 📊 Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">

          <h2 className="text-lg font-semibold mb-4">
            Recent Activity
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead>
                <tr className="text-left border-b text-gray-500">
                  <th className="py-2">User</th>
                  <th className="py-2">Action</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>

              <tbody>
                {activity.length > 0 ? (
                  activity.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-medium">
                        {item.user || "Unknown"}
                      </td>
                      <td>{item.action}</td>
                      <td className="text-gray-500 text-xs">
                        {item.date}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-gray-400">
                      No activity yet
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

        </div>

        {/* ⚡ Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-lg font-semibold mb-4">
            Quick Actions
          </h2>

          <div className="flex flex-col gap-3">

            <button className="bg-black text-white py-2 rounded hover:opacity-90">
              + Create Course
            </button>

            <button
              onClick={() => navigate("/admin/users")}
              className="border py-2 rounded hover:bg-gray-100"
            >
              Manage Users
            </button>

            <button
              onClick={() => navigate("/admin/analytics")}
              className="border py-2 rounded hover:bg-gray-100"
            >
              View Analytics
            </button>

          </div>

        </div>

      </div>

    </AdminLayout>
  );
}