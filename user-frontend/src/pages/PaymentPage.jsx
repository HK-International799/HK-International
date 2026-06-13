import React, { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { CreditCard } from "lucide-react";
import { initiatePayment, verifyPayment } from "../services/paymentService";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const PaymentPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
    currency: "INR",
    country: "India",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- Handle Change ---------------- */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* ---------------- Phone Change ---------------- */

  // const handlePhoneChange = (value, country) => {
  //   setForm({
  //     ...form,
  //     phone: value,
  //     country: country.name,
  //   });
  // };

  const handlePhoneChange = (value, country) => {
    const cleaned = value.replace(/[^\d]/g, "");

    setForm((prev) => ({
      ...prev,
      phone: cleaned,
      country: country?.name || "India",
    }));
  };

  /* ---------------- Validation ---------------- */

  const validateForm = () => {
    if (!form.name || !form.email || !form.phone || !form.amount) {
      return "All fields are required";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return "Invalid email";
    }

    if (form.phone.length < 8) {
      return "Invalid phone number";
    }

    if (form.amount <= 0) {
      return "Invalid amount";
    }

    return null;
  };

  /* ---------------- Submit ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!window.Razorpay) {
      setError("Payment gateway not loaded");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await initiatePayment(form);

      if (!data.success) {
        setError(data.message || "Payment initiation failed");
        setLoading(false);
        return;
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "1A HK International",
        description: "Course Payment",
        order_id: data.order.id,

        handler: async function (response) {
          const verifyRes = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes.success) {
            navigate(`/payment-success?orderId=${response.razorpay_order_id}`);
          } else {
            navigate("/payment-failed?reason=verification_failed");
          }
        },

        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },

        notes: {
          country: form.country,
        },

        theme: {
          color: "#4f46e5",
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function () {
        navigate("/payment-failed?reason=payment_failed");
      });

      try {
        rzp.open();
      } catch (e) {
        console.log("OPEN ERROR", e);

        window.location.href = `https://api.razorpay.com/v1/checkout/embedded?order_id=${data.order.id}`;
      }
    } catch (error) {
      console.log("FULL ERROR");

      console.log({
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Payment initiation failed",
      };
    }
  };

  return (
    <MainLayout>
      <h1 className="text-center">
        <span className="text-red-600 font-bold">Note :</span> Make sure to
        enter correct credentials. Company will not be responsible if you enter
        incorrect data.{" "}
      </h1>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-green-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          {/* Header */}

          <div className="text-center mb-6">
            <CreditCard size={40} className="mx-auto text-indigo-600" />

            <h2 className="text-2xl font-bold mt-3">Make Payment</h2>

            <p className="text-gray-500">Secure Global Razorpay Payment</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
            />

            <Input
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
            />

            {/* International Phone */}

            <PhoneInput
              country={"gb"}
              value={form.phone}
              onChange={handlePhoneChange}
              inputClass="!w-full !py-6"
              containerClass="w-full"
              enableSearch
              inputProps={{
                name: "phone",
                required: true,
              }}
            />

            <Input
              name="amount"
              placeholder="Amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
            />

            {/* Currency */}

            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
            >
              <option value="INR">INR - India</option>
              <option value="USD">USD - United States</option>
              <option value="EUR">EUR - Europe</option>
              <option value="GBP">GBP - United Kingdom</option>
              <option value="AED">AED - UAE</option>
            </select>

            {/* Country */}

            <Input
              name="country"
              placeholder="Country"
              value={form.country}
              onChange={handleChange}
            />

            {/* Submit */}

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
