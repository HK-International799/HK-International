import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-black text-white min-h-screen p-5">

      <h1 className="text-xl font-bold mb-8">
        HK International
      </h1>

      <nav className="flex flex-col gap-4">

        <Link to="/admin/dashboard">Dashboard</Link>

        <Link to="/admin/courses">Courses</Link>

        <Link to="/admin/create-course">Create Course</Link>

        <Link to="/admin/users">Users</Link>

        <Link to="/admin/assignments">Assignments</Link>

        <Link to="/admin/quizzes">Quizzes</Link>

        <Link to="/admin/analytics">Analytics</Link>

      </nav>

    </div>
  );
}