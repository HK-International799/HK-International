import React, { useState } from "react";
import { initiatePayment } from "../services/paymentService";
import MainLayout from "../components/layout/MainLayout";
import { CreditCard } from "lucide-react";

const PaymentPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await initiatePayment(form);

      if (data.success && data.paymentURL) {
        window.location.href = data.paymentURL;
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-green-50 flex items-center justify-center p-6">

        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">

          <div className="text-center mb-6">
            <CreditCard size={40} className="mx-auto text-indigo-600" />
            <h2 className="text-2xl font-bold mt-3">Make Payment</h2>
            <p className="text-gray-500">Secure payment gateway</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <Input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
            <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <Input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <Input name="amount" placeholder="Amount" type="number" value={form.amount} onChange={handleChange} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>

          </form>
        </div>
      </div>
    </MainLayout>
  );
};

const Input = ({ name, placeholder, value, onChange, type = "text" }) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required
    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-200 outline-none"
  />
);

export default PaymentPage;