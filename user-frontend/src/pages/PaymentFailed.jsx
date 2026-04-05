import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { XCircle } from "lucide-react";

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reason = searchParams.get("reason");

  const getMessage = () => {
    switch (reason) {
      case "hash_mismatch":
        return "Payment verification failed. Please contact support.";
      case "server_error":
        return "Server error occurred. Please try again.";
      case "payment_failed":
        return "Payment was declined or cancelled.";
      default:
        return "Your payment could not be completed.";
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <XCircle size={60} className="mx-auto text-red-500" />

          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            Payment Failed
          </h2>

          <p className="text-gray-500 mt-2">{getMessage()}</p>

          <button
            onClick={() => navigate("/payment")}
            className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentFailed;
