import { useAuth } from "../../contexts/AuthContext";
import { useCourseProgress } from "../../contexts/CourseProgressContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { progress } = useCourseProgress();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {user?.enrolledCourses?.map((course) => (
          <div key={course._id} className="border rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold">{course.title}</h2>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${progress[course._id]?.percent || 0}%` }}
              />
            </div>
            <p className="text-sm mt-2">{progress[course._id]?.percent || 0}% complete</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
