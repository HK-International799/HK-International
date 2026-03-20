import { useState } from "react";
import api from "../../services/api";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [form, setForm] = useState({
    adminLoginId: "",
    password: "",
  });

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.adminLoginId || !form.password) {
      return alert("All fields required");
    }

    try {
      const res = await api.post("/auth/login", {
        adminLoginId: form.adminLoginId,
        password: form.password,
      });

      login(res.data);

      navigate("/admin/dashboard"); // ✅ correct
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        <form onSubmit={handleSubmit} className="">
          <h2 className="text-2xl font-bold mb-6">Admin Login</h2>

          <input
            type="text"
            placeholder="Admin Login ID"
            className="w-full p-2 mb-4 border rounded"
            onChange={(e) => setForm({ ...form, adminLoginId: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button className="w-full bg-black text-white py-2 rounded">
            Login
          </button>
        </form>
        <button
          className="pt-3 mt-2"
          onClick={() => {
            navigate("/register");
          }}
        >
          Don't have an account?{" "}
          <span className="text-blue-700 cursor-pointer">Sign up</span>
        </button>
      </div>
    </div>
  );
}
