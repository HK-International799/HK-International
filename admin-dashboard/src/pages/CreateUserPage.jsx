import { useState } from "react";
import api from "../services/api";

export default function CreateUserPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);
  

  // 🔥 Generate random password
  const generatePassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email) {
      return alert("All fields required");
    }

    const password = generatePassword();

    try {
      setLoading(true);

      const res = await api.post("/auth/register", {
        ...form,
        password,
      });

      setCredentials({
        email: res.data.user.email,
        password: res.data.generatedPassword,
      });

      // Reset form
      setForm({
        name: "",
        email: "",
        role: "student",
      });

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  // 📋 Copy to clipboard
  const copyCredentials = () => {
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-full max-w-md"
      >
        <input
          placeholder="Name"
          className="w-full p-2 mb-3 border rounded"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* Role Selection */}
        <select
          className="w-full p-2 mb-3 border rounded"
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
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

      {/* ✅ Show Credentials */}
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
  );
}