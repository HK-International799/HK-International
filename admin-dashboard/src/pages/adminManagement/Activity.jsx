import { useEffect, useState } from "react";
import { getRecentActivity } from "../../services/adminService";
import AdminLayout from "../../components/layout/AdminLayout";

const Activity = () => {
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    const data = await getRecentActivity();
    setActivity(data);
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Activity Timeline</h1>

        <div className="space-y-4">
          {activity.map((item, index) => (
            <div
              key={index}
              className="bg-white shadow rounded-xl p-4 border-l-4 border-blue-500"
            >
              <p className="text-gray-800">{item.message}</p>
              <span className="text-xs text-gray-400">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Activity;
