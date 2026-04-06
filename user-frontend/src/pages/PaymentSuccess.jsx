import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import MainLayout from "../components/layout/MainLayout";
import { getTransaction } from "../services/paymentService";
import { CheckCircle } from "lucide-react";
import logo from "/logos/hk_logo.png";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("orderId");

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    fetchTransaction();
  }, []);

  const fetchTransaction = async () => {
    try {
      const res = await getTransaction(orderId);

      if (res?.success) {
        setTransaction(res.data);
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  /* ---------------- PDF Receipt ---------------- */

  const downloadReceipt = () => {
    if (!transaction) return;

    const doc = new jsPDF("p", "mm", "a4");

    /* ---------------- Background ---------------- */
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, 210, 297, "F");

    /* ---------------- Header ---------------- */
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(10, 10, 190, 35, 3, 3, "F");

    const pageWidth = doc.internal.pageSize.getWidth();

    const logoWidth = 100;
    const logoHeight = 40;
    const x = (pageWidth - logoWidth) / 2;

    doc.addImage(logo, "PNG", x, 5, logoWidth, logoHeight);

    /* ---------------- Receipt Badge ---------------- */

    doc.setFillColor(59, 130, 246);
    doc.roundedRect(70, 42, 70, 10, 3, 3, "F");

    doc.setTextColor(255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT RECEIPT", 105, 49, { align: "center" });

    /* ---------------- Info Cards ---------------- */

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(10, 55, 90, 60, 3, 3, "F");
    doc.roundedRect(110, 55, 90, 60, 3, 3, "F");

    /* ---------------- Transaction Info ---------------- */

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Transaction Info", 15, 65);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(`Order ID: ${transaction.orderId}`, 15, 73);
    doc.text(`Payment ID: ${transaction.paymentId}`, 15, 80);
    doc.text(
      `Date: ${new Date(
        transaction.createdAt || Date.now()
      ).toLocaleDateString()}`,
      15,
      87
    );
    doc.text(`Currency: ${transaction.currency || "INR"}`, 15, 94);
    doc.text(`Gateway: Razorpay`, 15, 101);

    /* ---------------- Student Info ---------------- */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Student Info", 115, 65);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(`Name: ${transaction.name}`, 115, 73);
    doc.text(`Email: ${transaction.email}`, 115, 80);
    doc.text(`Phone: ${transaction.phone}`, 115, 87);
    doc.text(`Country: ${transaction.country || "N/A"}`, 115, 94);

    if (transaction.courseName) {
      doc.text(`Course: ${transaction.courseName}`, 115, 101);
    }

    /* ---------------- Amount Section ---------------- */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Amount", 15, 130);

    doc.setFillColor(240, 240, 240);
    doc.roundedRect(15, 135, 180, 10, 2, 2, "F");

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("Description", 20, 142);
    doc.text("Amount", 170, 142, { align: "right" });

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 145, 180, 12, 2, 2, "F");

    doc.setFont("helvetica", "normal");
    doc.text("Course Payment", 20, 153);

    doc.text(
      `${transaction.currency || "INR"} ${transaction.amount}`,
      170,
      153,
      { align: "right" }
    );

    /* ---------------- Total Paid ---------------- */

    doc.setFillColor(37, 99, 235);
    doc.roundedRect(15, 165, 120, 14, 3, 3, "F");

    doc.setFillColor(249, 115, 22);
    doc.roundedRect(135, 165, 60, 14, 3, 3, "F");

    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");

    doc.text("Total Paid", 75, 174, { align: "center" });

    doc.text(
      `${transaction.currency || "INR"} ${transaction.amount}`,
      165,
      174,
      { align: "center" }
    );

    /* ---------------- Status ---------------- */

    doc.setFillColor(220, 252, 231);
    doc.roundedRect(70, 190, 70, 10, 3, 3, "F");

    doc.setTextColor(22, 163, 74);
    doc.setFontSize(12);

    doc.text(
      `STATUS: ${transaction.status.toUpperCase()}`,
      105,
      197,
      { align: "center" }
    );

    /* ---------------- Footer ---------------- */

    doc.setDrawColor(200);
    doc.line(20, 215, 190, 215);

    doc.setFontSize(9);
    doc.setTextColor(120);

    doc.text(
      "This is a system generated payment receipt and does not require signature.",
      105,
      223,
      { align: "center" }
    );

    doc.text("1A HK International | www.hkinternational.uk", 105, 229, {
      align: "center",
    });

    doc.text("Email: info@hkinternational.uk", 105, 235, {
      align: "center",
    });

    doc.save(`HK_Receipt_${transaction.orderId}.pdf`);
  };

  if (loading)
    return <div className="text-center mt-20">Loading...</div>;

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center w-[400px]">

          <CheckCircle
            className="mx-auto text-green-500"
            size={60}
          />

          <h1 className="text-2xl font-bold mt-4">
            Payment Successful
          </h1>

          <p className="text-gray-500 mt-2">
            Your payment has been completed
          </p>

          {transaction && (
            <div className="mt-6 text-left space-y-2 text-sm">
              <p><b>Order ID:</b> {transaction.orderId}</p>
              <p><b>Payment ID:</b> {transaction.paymentId}</p>
              <p><b>Name:</b> {transaction.name}</p>
              <p><b>Email:</b> {transaction.email}</p>
              <p><b>Phone:</b> {transaction.phone}</p>
              <p><b>Country:</b> {transaction.country}</p>
              <p><b>Currency:</b> {transaction.currency}</p>
              <p><b>Amount:</b> {transaction.currency} {transaction.amount}</p>
              <p><b>Status:</b> {transaction.status}</p>
              <p><b>Date:</b> {new Date(transaction.createdAt).toLocaleString()}</p>
            </div>
          )}

          <button
            onClick={downloadReceipt}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded w-full"
          >
            Download Receipt
          </button>

          <button
            onClick={() => navigate("/student/dashboard")}
            className="mt-4 px-6 py-3 bg-black text-white rounded w-full"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentSuccess;