// import React, { useState } from "react";
// import MainLayout from "../components/layout/MainLayout";
// import { CreditCard } from "lucide-react";
// import { initiatePayment, verifyPayment } from "../services/paymentService";
// import { useNavigate } from "react-router-dom";

// const PaymentPage = () => {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     amount: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value,
//     });
//   };

//   /* ---------------- Razorpay Payment ---------------- */

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setLoading(true);
//     setError("");

//     try {
//       if (!window.Razorpay) {
//         setError("Razorpay SDK not loaded");
//         setLoading(false);
//         return;
//       }

//       const data = await initiatePayment(form);

//       if (!data.success) {
//         setError(data.message);
//         setLoading(false);
//         return;
//       }

//       const options = {
//         key: data.key,
//         amount: data.order.amount,
//         currency: "INR",
//         name: "HK International",
//         description: "Course Payment",
//         order_id: data.order.id,

//         handler: async function (response) {
//           try {
//             const verifyRes = await verifyPayment({
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//             });

//             if (verifyRes.success) {
//               navigate(
//                 `/payment-success?orderId=${response.razorpay_order_id}`
//               );
//             } else {
//               navigate("/payment-failed");
//             }
//           } catch (err) {
//             console.error("Verification error:", err);
//             navigate("/payment-failed");
//           }
//         },

//         prefill: {
//           name: form.name,
//           email: form.email,
//           contact: form.phone,
//         },

//         theme: {
//           color: "#4f46e5",
//         },

//         modal: {
//           ondismiss: function () {
//             setLoading(false);
//           },
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       console.error("Payment error:", err);
//       setError("Payment initiation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <MainLayout>
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-green-50 flex items-center justify-center p-6">
//         <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">

//           <div className="text-center mb-6">
//             <CreditCard size={40} className="mx-auto text-indigo-600" />
//             <h2 className="text-2xl font-bold mt-3">Make Payment</h2>
//             <p className="text-gray-500">Secure Razorpay Payment</p>
//           </div>

//           {error && (
//             <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">

//             <Input
//               name="name"
//               placeholder="Full Name"
//               value={form.name}
//               onChange={handleChange}
//             />

//             <Input
//               name="email"
//               placeholder="Email"
//               value={form.email}
//               onChange={handleChange}
//             />

//             <Input
//               name="phone"
//               placeholder="Phone"
//               value={form.phone}
//               onChange={handleChange}
//             />

//             <Input
//               name="amount"
//               placeholder="Amount"
//               type="number"
//               value={form.amount}
//               onChange={handleChange}
//             />

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
//             >
//               {loading ? "Processing..." : "Pay Now"}
//             </button>

//           </form>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// const Input = ({ name, placeholder, value, onChange, type = "text" }) => (
//   <input
//     type={type}
//     name={name}
//     value={value}
//     onChange={onChange}
//     placeholder={placeholder}
//     required
//     className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-200 outline-none"
//   />
// );

// export default PaymentPage;


import React, { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { CreditCard } from "lucide-react";
import { initiatePayment, verifyPayment } from "../services/paymentService";
import { useNavigate } from "react-router-dom";

const PaymentPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.phone || !form.amount) {
      return "All fields required";
    }

    if (!/^\d{10}$/.test(form.phone)) {
      return "Phone must be 10 digits";
    }

    if (form.amount <= 0) {
      return "Invalid amount";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!window.Razorpay) {
      setError("Razorpay SDK not loaded");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await initiatePayment(form);

      if (!data.success) {
        setError(data.message);
        setLoading(false);
        return;
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "HK International",
        description: "Course Payment",
        order_id: data.order.id,

        handler: async function (response) {
          const verifyRes = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes.success) {
            navigate(
              `/payment-success?orderId=${response.razorpay_order_id}`
            );
          } else {
            navigate("/payment-failed?reason=verification_failed");
          }
        },

        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
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
      rzp.open();
    } catch (err) {
      console.error(err);
      setError("Payment initiation failed");
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
            <p className="text-gray-500">Secure Razorpay Payment</p>
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