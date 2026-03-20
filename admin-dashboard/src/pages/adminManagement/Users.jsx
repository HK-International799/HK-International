import { useEffect, useState } from "react";
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
} from "../../services/adminService";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";

const Users = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    await deleteUser(id);
    fetchUsers();
  };

  const handleRoleChange = async (id, role) => {
    await updateUserRole(id, role);
    fetchUsers();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Users</h1>

          <button
            onClick={() => navigate("/admin/create-user")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Create User
          </button>
        </div>

        <div className="bg-white shadow rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="p-4">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="p-4">{user.name}</td>
                  <td>{user.email}</td>

                  <td>
                    <select
                      className="border rounded px-2 py-1"
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                    >
                      <option value="student">Student</option>
                      <option value="tutor">Tutor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td className="space-x-2">
                    <button
                      onClick={() => navigate(`/admin/edit-user/${user._id}`)}
                      className="text-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Users;
