// import React, { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import jsPDF from "jspdf";
// import MainLayout from "../components/layout/MainLayout";
// import api from "../services/api";
// import { CheckCircle, Download, LayoutDashboard } from "lucide-react";

// const PaymentSuccess = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   // const txnid = searchParams.get("txnid");
//   const orderId = searchParams.get("orderId");

//   const [transaction, setTransaction] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchTransaction();
//   }, []);

//   const fetchTransaction = async () => {
//     try {
//       // const { data } = await api.get(`/payment/transaction/${txnid}`);
//       const { data } = await api.get(`/payment/transaction/${orderId}`);
//       setTransaction(data);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadReceipt = () => {
//     if (!transaction) return;

//     const doc = new jsPDF();

//     doc.setFontSize(18);
//     doc.text("Payment Receipt", 20, 20);

//     doc.setFontSize(12);

//     let y = 40;

//     Object.entries(transaction).forEach(([key, value]) => {
//       doc.text(`${key.toUpperCase()}: ${value}`, 20, y);
//       y += 10;
//     });

//     doc.save("payment-receipt.pdf");
//   };

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="text-gray-500">Loading payment details...</div>
//         </div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout>
//       <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-indigo-50 flex items-center justify-center p-6">

//         <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

//           <div className="text-center">

//             <CheckCircle className="mx-auto text-green-500" size={60} />

//             <h1 className="text-2xl font-bold text-gray-800 mt-4">
//               Payment Successful 🎉
//             </h1>

//             <p className="text-gray-500 mt-2">
//               Your payment has been processed successfully
//             </p>

//           </div>

//           {/* Transaction Details */}
//           <div className="mt-8 space-y-4">

//             <div className="bg-gray-50 rounded-xl p-4">
//               <h3 className="font-semibold text-gray-700 mb-3">
//                 Transaction Details
//               </h3>

//               <div className="space-y-2 text-sm">

//                 <Row label="Transaction ID" value={transaction.txnid} />
//                 <Row label="Payment ID" value={transaction.paymentId} />
//                 <Row label="Status" value="Success" />
//                 <Row label="Date" value={transaction.date} />

//               </div>
//             </div>

//             <div className="bg-gray-50 rounded-xl p-4">
//               <h3 className="font-semibold text-gray-700 mb-3">
//                 User Details
//               </h3>

//               <div className="space-y-2 text-sm">

//                 <Row label="Name" value={transaction.name} />
//                 <Row label="Email" value={transaction.email} />
//                 <Row label="Phone" value={transaction.phone} />

//               </div>
//             </div>

//             <div className="bg-gray-50 rounded-xl p-4">
//               <h3 className="font-semibold text-gray-700 mb-3">
//                 Payment Info
//               </h3>

//               <div className="space-y-2 text-sm">

//                 <Row label="Course" value={transaction.course} />
//                 <Row label="Receiver" value={transaction.receiver} />
//                 <Row
//                   label="Amount"
//                   value={`₹${transaction.amount}`}
//                   highlight
//                 />

//               </div>
//             </div>

//           </div>

//           {/* Buttons */}
//           <div className="mt-6 space-y-3">

//             <button
//               onClick={downloadReceipt}
//               className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
//             >
//               <Download size={18} />
//               Download Receipt
//             </button>

//             <button
//               onClick={() => navigate("/student/dashboard")}
//               className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-black transition"
//             >
//               <LayoutDashboard size={18} />
//               Go to Dashboard
//             </button>

//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// const Row = ({ label, value, highlight }) => (
//   <div className="flex justify-between">
//     <span className="text-gray-500">{label}</span>
//     <span className={`font-medium ${highlight ? "text-green-600" : "text-gray-800"}`}>
//       {value}
//     </span>
//   </div>
// );

// export default PaymentSuccess;


import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import MainLayout from "../components/layout/MainLayout";
import { getTransaction } from "../services/paymentService";
import { CheckCircle, Download, LayoutDashboard } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("orderId");

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransaction();
  }, []);

  const fetchTransaction = async () => {
    const res = await getTransaction(orderId);

    if (res?.success) {
      setTransaction(res.data);
    }

    setLoading(false);
  };

  const downloadReceipt = () => {
    if (!transaction) return;

    const doc = new jsPDF();

    doc.text("Payment Receipt", 20, 20);
    doc.text(`Order ID: ${transaction.orderId}`, 20, 40);
    doc.text(`Payment ID: ${transaction.paymentId}`, 20, 50);
    doc.text(`Name: ${transaction.name}`, 20, 60);
    doc.text(`Email: ${transaction.email}`, 20, 70);
    doc.text(`Phone: ${transaction.phone}`, 20, 80);
    doc.text(`Amount: ₹${transaction.amount}`, 20, 90);
    doc.text(`Status: ${transaction.status}`, 20, 100);

    doc.save("receipt.pdf");
  };

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center">

        <div className="bg-white p-8 rounded-xl shadow-xl text-center">

          <CheckCircle className="mx-auto text-green-500" size={60} />

          <h1 className="text-2xl font-bold mt-4">
            Payment Successful 🎉
          </h1>

          <p className="text-gray-500 mt-2">
            Your payment has been completed
          </p>

          {transaction && (
            <div className="mt-6 text-left space-y-2">

              <p>Order ID: {transaction.orderId}</p>
              <p>Payment ID: {transaction.paymentId}</p>
              <p>Name: {transaction.name}</p>
              <p>Amount: ₹{transaction.amount}</p>
              <p>Status: {transaction.status}</p>

            </div>
          )}

          <button
            onClick={downloadReceipt}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded"
          >
            Download Receipt
          </button>

          <button
            onClick={() => navigate("/student/dashboard")}
            className="mt-4 px-6 py-3 bg-black text-white rounded block w-full"
          >
            Go to Dashboard
          </button>

        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentSuccess;