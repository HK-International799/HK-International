import React from "react";
import jsPDF from "jspdf";

const PaymentSuccess = () => {
  // 👉 In real case, fetch this from backend using txnid
  const transaction = {
    name: "Anurag",
    email: "anuhackerag799@gmail.com",
    phone: "7991845638",
    amount: "499",
    txnid: "txn_123456789",
    paymentId: "EZB123456",
    status: "Success",
    course: "MERN LMS Course",
    date: new Date().toLocaleString(),
    receiver: "HK International",
  };

  // 📄 Download Receipt
  const downloadReceipt = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Payment Receipt", 20, 20);

    doc.setFontSize(12);
    let y = 40;

    Object.entries(transaction).forEach(([key, value]) => {
      doc.text(`${key.toUpperCase()}: ${value}`, 20, y);
      y += 10;
    });

    doc.save("receipt.pdf");
  };

  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>✅</div>

          <h1 style={styles.title}>Payment Successful</h1>
          <p style={styles.subtitle}>
            Thank you! Your payment has been processed successfully.
          </p>

          {/* Transaction Details */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Transaction Details</h3>

            <div style={styles.row}>
              <span>Transaction ID</span>
              <span>{transaction.txnid}</span>
            </div>

            <div style={styles.row}>
              <span>Payment ID</span>
              <span>{transaction.paymentId}</span>
            </div>

            <div style={styles.row}>
              <span>Status</span>
              <span style={{ color: "green" }}>{transaction.status}</span>
            </div>

            <div style={styles.row}>
              <span>Date</span>
              <span>{transaction.date}</span>
            </div>
          </div>

          {/* User Info */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>User Details</h3>

            <div style={styles.row}>
              <span>Name</span>
              <span>{transaction.name}</span>
            </div>

            <div style={styles.row}>
              <span>Email</span>
              <span>{transaction.email}</span>
            </div>

            <div style={styles.row}>
              <span>Phone</span>
              <span>{transaction.phone}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Payment Info</h3>

            <div style={styles.row}>
              <span>Course</span>
              <span>{transaction.course}</span>
            </div>

            <div style={styles.row}>
              <span>Paid To</span>
              <span>{transaction.receiver}</span>
            </div>

            <div style={styles.row}>
              <span>Amount</span>
              <span style={styles.amount}>₹{transaction.amount}</span>
            </div>
          </div>

          {/* Buttons */}
          <div style={styles.actions}>
            <button style={styles.downloadBtn} onClick={downloadReceipt}>
              📄 Download Receipt
            </button>

            <button
              style={styles.dashboardBtn}
              onClick={() => (window.location.href = "/student/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentSuccess;

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    padding: "20px",
  },
  card: {
    width: "420px",
    background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  icon: {
    fontSize: "50px",
    marginBottom: "10px",
  },
  title: {
    fontSize: "24px",
    marginBottom: "5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "20px",
  },
  section: {
    textAlign: "left",
    marginBottom: "20px",
    background: "#f9fafb",
    padding: "15px",
    borderRadius: "10px",
  },
  sectionTitle: {
    fontSize: "16px",
    marginBottom: "10px",
    fontWeight: "600",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    marginBottom: "6px",
  },
  amount: {
    fontWeight: "bold",
    color: "#16a34a",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  downloadBtn: {
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
  dashboardBtn: {
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
};
