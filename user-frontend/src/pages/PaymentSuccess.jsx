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

  // Logo
// Get page width
const pageWidth = doc.internal.pageSize.getWidth();

// Set desired logo width (almost full width with margin)
const logoWidth = pageWidth - 40; // 20 margin on both sides
const logoHeight = 40; // adjust if needed

// Center position
const x = (pageWidth - logoWidth) / 2;

doc.addImage(logo, "PNG", x, 5, logoWidth, logoHeight);


  /* ---------------- Receipt Badge ---------------- */
  doc.setFillColor(59, 130, 246); // Blue
  doc.roundedRect(70, 42, 70, 10, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", 105, 49, { align: "center" });

  /* ---------------- Info Cards ---------------- */
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 55, 90, 55, 3, 3, "F"); // Left box
  doc.roundedRect(110, 55, 90, 55, 3, 3, "F"); // Right box

  /* ---------------- Transaction Info ---------------- */
  doc.setTextColor(0, 0, 0);
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

  /* ---------------- Student Info ---------------- */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Student Info", 115, 65);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(`Name: ${transaction.name}`, 115, 73);
  doc.text(`Email: ${transaction.email}`, 115, 80);
  doc.text(`Phone: ${transaction.phone}`, 115, 87);

  if (transaction.courseName) {
    doc.text(`Course: ${transaction.courseName}`, 115, 94);
  }

  /* ---------------- Amount Section ---------------- */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Amount", 15, 125);

  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(15, 130, 180, 10, 2, 2, "F");

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("Description", 20, 137);
  doc.text("Amount", 170, 137, { align: "right" });

  // Table Row
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 140, 180, 12, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.text("Course Payment", 20, 148);

  doc.text(
    `${transaction.currency || "INR"} ${transaction.amount}`,
    170,
    148,
    { align: "right" }
  );

  /* ---------------- Total Paid Bar ---------------- */
  doc.setFillColor(37, 99, 235); // Blue
  doc.roundedRect(15, 160, 120, 14, 3, 3, "F");

  doc.setFillColor(249, 115, 22); // Orange
  doc.roundedRect(135, 160, 60, 14, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");

  doc.text("Total Paid", 75, 169, { align: "center" });

  doc.text(
    `${transaction.currency || "INR"} ${transaction.amount}`,
    165,
    169,
    { align: "center" }
  );

  /* ---------------- Status ---------------- */
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(70, 185, 70, 10, 3, 3, "F");

  doc.setTextColor(22, 163, 74);
  doc.setFontSize(12);
  doc.text(
    `STATUS: ${transaction.status.toUpperCase()}`,
    105,
    192,
    { align: "center" }
  );

  /* ---------------- Footer ---------------- */
  doc.setDrawColor(200);
  doc.line(20, 210, 190, 210);

  doc.setFontSize(9);
  doc.setTextColor(120);

  doc.text(
    "This is a system generated payment receipt and does not require signature.",
    105,
    218,
    { align: "center" }
  );

  doc.text("1A HK International | www.hkinternational.uk", 105, 224, {
    align: "center",
  });

  // ✅ UPDATED EMAIL HERE
  doc.text("Email: info@hkinternational.uk", 105, 230, {
    align: "center",
  });

  /* ---------------- Save ---------------- */
  doc.save(`HK_Receipt_${transaction.orderId}.pdf`);
};
  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center w-[400px]">
          <CheckCircle className="mx-auto text-green-500" size={60} />

          <h1 className="text-2xl font-bold mt-4">Payment Successful 🎉</h1>

          <p className="text-gray-500 mt-2">Your payment has been completed</p>

          {transaction && (
            <div className="mt-6 text-left space-y-2 text-sm">
              <p>
                <b>Order ID:</b> {transaction.orderId}
              </p>
              <p>
                <b>Payment ID:</b> {transaction.paymentId}
              </p>
              <p>
                <b>Name:</b> {transaction.name}
              </p>
              <p>
                <b>Email:</b> {transaction.email}
              </p>
              <p>
                <b>Phone:</b> {transaction.phone}
              </p>
              <p>
                <b>Amount:</b> {transaction.currency} {transaction.amount}
              </p>
              <p>
                <b>Status:</b> {transaction.status}
              </p>
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
