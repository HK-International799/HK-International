import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAssignmentById,
  getSubmissionsByAssignment,
} from "../../services/assignmentService";

export default function AssignmentDetails() {
  const { id } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const assignmentData = await getAssignmentById(id);
      const submissionData = await getSubmissionsByAssignment(id);

      setAssignment(assignmentData.assignment || assignmentData);
      setSubmissions(submissionData.submissions || submissionData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      {/* Assignment Info */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{assignment.title}</h1>

        <p className="text-gray-600 mb-4">{assignment.description}</p>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500">Course</p>
            <p className="font-medium">{assignment.courseId?.title}</p>
          </div>

          <div>
            <p className="text-gray-500">Due Date</p>
            <p className="font-medium">{assignment.dueDate?.slice(0, 10)}</p>
          </div>

          <div>
            <p className="text-gray-500">Total Marks</p>
            <p className="font-medium">{assignment.totalMarks}</p>
          </div>
        </div>

        {assignment.file && (
          <a
            href={`http://localhost:5000${assignment.file?.url}`}
            target="_blank"
            className="text-blue-600 underline"
          >
            View Document
          </a>
        )}
      </div>

      {/* Submissions */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Submissions</h2>

        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Marks</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">File</th>
            </tr>
          </thead>

          <tbody>
            {submissions.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="p-3">{s.student?.name}</td>

                <td className="p-3">{s.student?.email}</td>

                <td className="p-3">{s.marks || "-"}</td>

                <td className="p-3">{s.status}</td>

                <td className="p-3">
                  {s.file && (
                    <a href={s.file} target="_blank" className="text-blue-600">
                      View
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
