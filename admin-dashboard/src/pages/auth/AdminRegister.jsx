import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
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
            name="mobile"
            placeholder="Mobile Number"
            className="w-full p-2 mb-3 border rounded"
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
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



// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import api from "../../services/api";
// import { UserPlus, Eye, EyeOff } from "lucide-react";

// export default function Register() {
//   const [form, setForm] = useState({ name: "", email: "", password: "", mobile: "", role: "admin" });
//   const [showPw, setShowPw] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       await api.post("/auth/register", form);
//       navigate("/login");
//     } catch (err) {
//       setError(err.response?.data?.message || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-surface p-6">
//       <div className="w-full max-w-md">
//         <h2 className="text-2xl font-bold text-gray-800">Create Admin Account</h2>
//         <p className="text-gray-400 mt-1 mb-8">Register to manage your LMS</p>

//         {error && <div className="mb-4 px-4 py-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl">{error}</div>}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name</label>
//             <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
//             <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
//               className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-600 mb-1.5">Mobile</label>
//             <input type="text" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
//               className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
//             <div className="relative">
//               <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
//                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 pr-11" required />
//               <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                 {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//           </div>
//           <button type="submit" disabled={loading}
//             className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2">
//             {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><UserPlus size={18} /> Register</>}
//           </button>
//         </form>

//         <p className="text-center text-sm text-gray-400 mt-6">
//           Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
//         </p>
//       </div>
//     </div>
//   );
// }
