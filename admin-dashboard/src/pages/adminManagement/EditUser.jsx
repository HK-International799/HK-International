import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { updateUser, getAllUsers } from "../../services/adminService";
import AdminLayout from "../../components/layout/AdminLayout";

const EditUser = () => {
  const { id } = useParams();
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const users = await getAllUsers();
    const user = users.find((u) => u._id === id);
    if (user) setForm(user);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUser(id, form);
    alert("User Updated");
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-xl mx-auto">
        <div className="bg-white shadow rounded-2xl p-6">
          <h1 className="text-xl font-bold mb-4">Edit User</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full border p-2 rounded"
              value={form.name}
              placeholder="Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="w-full border p-2 rounded"
              value={form.email}
              placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              Update
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditUser;
