import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import MainLayout from "../components/layout/MainLayout";
import { getTransaction } from "../services/paymentService";
import { CheckCircle } from "lucide-react";

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

    doc.text("HK International Payment Receipt", 20, 20);
    doc.text(`Order ID: ${transaction.orderId}`, 20, 40);
    doc.text(`Payment ID: ${transaction.paymentId}`, 20, 50);
    doc.text(`Name: ${transaction.name}`, 20, 60);
    doc.text(`Email: ${transaction.email}`, 20, 70);
    doc.text(`Phone: ${transaction.phone}`, 20, 80);
    doc.text(
      `Amount: ${transaction.currency} ${transaction.amount}`,
      20,
      90
    );
    doc.text(`Status: ${transaction.status}`, 20, 100);

    doc.save("receipt.pdf");
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

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
              <p>
                Amount: {transaction.currency} {transaction.amount}
              </p>
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