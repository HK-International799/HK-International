import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    adminLoginId: "",
    role: "tutor", // default
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCheckboxChange = (selectedRole) => {
    setForm({
      ...form,
      role: selectedRole,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 🔍 Basic validation
    if (!form.name || !form.email || !form.password) {
      return setError("All fields are required");
    }

    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    if (form.role === "admin" && !form.adminLoginId) {
      return setError("Admin Secret ID is required for admin");
    }

    try {
      setLoading(true);

      console.log("Submitting:", form); // 🧠 Debug

      const res = await api.post("/auth/register", form);

      console.log("Response:", res.data); // 🧠 Debug

      alert("User Registered Successfully");

      navigate("/login");
    } catch (err) {
      console.error("Register Error:", err);

      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        <form className="" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Register (Admin / Tutor)
          </h2>

          {/* Error Message */}
          {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

          <input
            placeholder="Name"
            className="w-full p-2 mb-3 border rounded"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Email"
            className="w-full p-2 mb-3 border rounded"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            placeholder="Password"
            type="password"
            className="w-full p-2 mb-3 border rounded"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* Role Selection */}
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.role === "admin"}
                onChange={() => handleCheckboxChange("admin")}
              />
              Admin
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.role === "tutor"}
                onChange={() => handleCheckboxChange("tutor")}
              />
              Tutor
            </label>
          </div>

          {/* Admin Secret ID (only if admin selected) */}
          {form.role === "admin" && (
            <input
              placeholder="Admin Secret ID"
              className="w-full p-2 mb-3 border rounded"
              onChange={(e) =>
                setForm({ ...form, adminLoginId: e.target.value })
              }
            />
          )}

          <button
            disabled={loading}
            className="w-full bg-black text-white py-2 mt-2 rounded hover:opacity-90"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <button
          className="pt-3 mt-2"
          onClick={() => {
            navigate("/login");
          }}
        >
          Already have an account?{" "}
          <span className="text-blue-700 cursor-pointer">Login</span>
        </button>
      </div>
    </div>
  );
}
