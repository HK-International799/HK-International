import { useState } from "react";
import { createUser } from "../../services/adminService"; // ✅ USE SERVICE
import AdminLayout from "../../components/layout/AdminLayout";

export default function CreateUserPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.mobile) {
      return alert("All fields required");
    }

    try {
      setLoading(true);

      const data = await createUser(form); // ✅ CLEAN CALL

      setCredentials(data.credentials);

      setForm({
        name: "",
        email: "",
        mobile: "",
        role: "student",
      });

    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.msg || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Create New User</h1>

        <p className="text-sm text-gray-500 mb-6">
          Default password will be the mobile number
        </p>

        <form className="bg-white p-6 rounded shadow w-full max-w-md" onSubmit={handleSubmit}>

          <input
            placeholder="Name"
            className="w-full p-2 mb-3 border rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Email"
            className="w-full p-2 mb-3 border rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            placeholder="Mobile Number"
            className="w-full p-2 mb-3 border rounded"
            value={form.mobile} // ✅ FIXED
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />

          <select
            className="w-full p-2 mb-3 border rounded"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>

          <button
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>

        {credentials && (
          <div className="mt-6 bg-green-100 p-4 rounded w-full max-w-md">
            <h2 className="font-bold mb-2">User Created 🎉</h2>

            <p><strong>Email:</strong> {credentials.email}</p>
            <p><strong>Password:</strong> {credentials.password}</p>

            <button
              onClick={copyCredentials}
              className="mt-3 bg-green-600 text-white px-4 py-1 rounded"
            >
              Copy Credentials
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}