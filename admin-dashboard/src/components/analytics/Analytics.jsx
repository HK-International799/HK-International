import { useEffect, useState } from "react";
import { getAnalytics } from "../../services/analyticsService";

const Analytics = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    getAnalytics().then(setStats);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Platform Analytics</h1>
      <p>Active Students: {stats.activeStudents}</p>
      <p>Course Completion Rate: {stats.completionRate}%</p>
    </div>
  );
};

export default Analytics;
