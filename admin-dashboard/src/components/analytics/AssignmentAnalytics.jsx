import { useEffect, useState } from "react";
import { getAssignmentAnalytics } from "../../services/analyticsService";

const AssignmentAnalytics = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getAssignmentAnalytics().then(setData);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Assignment Analytics</h1>
      <ul>
        {data.map((item) => (
          <li key={item.assignmentId} className="border p-2 mb-2">
            <p>Assignment: {item.title}</p>
            <p>Submission Rate: {item.submissionRate}%</p>
            <p>Average Score: {item.averageScore}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssignmentAnalytics;
