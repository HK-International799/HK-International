import { useEffect, useState } from "react";
import {
  getAllAssignments,
  updateExistingAssignment,
  deleteExistingAssignment,
} from "../../services/assignmentService";
import { useNavigate } from "react-router-dom";

export default function Assignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    totalMarks: "",
  });

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAllAssignments();
      setAssignments(Array.isArray(data) ? data : data.assignments || []);
    } catch (error) {
      console.error("Failed to fetch assignments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // open edit modal
  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);

    setForm({
      title: assignment.title || "",
      description: assignment.description || "",
      dueDate: assignment.dueDate?.slice(0, 10) || "",
      totalMarks: assignment.totalMarks || "",
    });

    setEditModal(true);
  };

  // update assignment
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await updateExistingAssignment(selectedAssignment._id, form);
      setEditModal(false);
      fetchAssignments();
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  // delete assignment
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this assignment?",
    );

    if (!confirmDelete) return;

    try {
      await deleteExistingAssignment(id);
      fetchAssignments();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-gray-500">Manage all assignments</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Loading assignments...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Course</th>
                <th className="p-4 text-left">Due Date</th>
                <th className="p-4 text-left">Marks</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {assignments.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="p-4 font-medium">{item.title}</td>

                  <td className="p-4">{item.courseId?.title || "-"}</td>

                  <td className="p-4">{item.dueDate?.slice(0, 10)}</td>

                  <td className="p-4">{item.totalMarks}</td>

                  <td className="p-4 flex gap-4">
                    <button
                      onClick={() => navigate(`/admin/assignment/${item._id}`)}
                      className="text-green-600 font-medium"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 font-medium"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!assignments.length && (
                <tr>
                  <td colSpan="5" className="p-6 text-center">
                    No assignments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Edit Assignment</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border p-3 rounded"
                placeholder="Title"
              />

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full border p-3 rounded"
                placeholder="Description"
              />

              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full border p-3 rounded"
              />

              <input
                value={form.totalMarks}
                onChange={(e) =>
                  setForm({ ...form, totalMarks: e.target.value })
                }
                className="w-full border p-3 rounded"
                placeholder="Total Marks"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2 rounded"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
