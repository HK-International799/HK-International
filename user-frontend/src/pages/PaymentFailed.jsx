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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center w-[400px]">

          <XCircle
            size={60}
            className="mx-auto text-red-500"
          />

          <h2 className="text-2xl font-bold mt-4">
            Payment Failed 
          </h2>

          <p className="text-gray-500 mt-2">
            {getMessage()}
          </p>

          {reason && (
            <p className="text-sm text-gray-400 mt-2">
              Error Code: {reason}
            </p>
          )}

          <button
            onClick={() => navigate("/payment")}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded w-full"
          >
            Try Again
          </button>

          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-3 bg-black text-white rounded w-full"
          >
            Go Home
          </button>

        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentFailed;