import { useEffect, useState } from "react";
import { getAdminStats, getRecentActivity } from "../../services/adminService";
import AdminLayout from "../../components/layout/AdminLayout";

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const statsData = await getAdminStats();
      const activityData = await getRecentActivity();

      setStats(statsData);
      setActivity(activityData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-2xl p-5">
          <h2 className="text-gray-500">Total Users</h2>
          <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
        </div>

        <div className="bg-white shadow rounded-2xl p-5">
          <h2 className="text-gray-500">Courses</h2>
          <p className="text-3xl font-bold">{stats?.totalCourses || 0}</p>
        </div>

        <div className="bg-white shadow rounded-2xl p-5">
          <h2 className="text-gray-500">Enrollments</h2>
          <p className="text-3xl font-bold">{stats?.totalEnrollments || 0}</p>
        </div>
      </div>

      {/* Activity */}
      <div className="bg-white shadow rounded-2xl p-5">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {activity.map((item, i) => (
            <div key={i} className="border-b pb-2 text-sm text-gray-700">
              {item.message}
            </div>
          ))}
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default Dashboard;