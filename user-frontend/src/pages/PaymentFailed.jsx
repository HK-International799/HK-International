import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reason = searchParams.get("reason");

  const getMessage = () => {
    switch (reason) {
      case "hash_mismatch":
        return "Payment verification failed. Please contact support.";
      case "server_error":
        return "A server error occurred. Please try again later.";
      default:
        return "Your payment could not be completed. Please try again.";
    }
  };

  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>✕</div>
          <h2 style={styles.title}>Payment Failed</h2>
          <p style={styles.message}>{getMessage()}</p>
          <button style={styles.button} onClick={() => navigate("/payment")}>
            Try Again
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "40px 32px",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  icon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    fontSize: "28px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: "22px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  message: {
    color: "#666",
    fontSize: "15px",
    marginBottom: "24px",
    lineHeight: "1.5",
  },
  button: {
    padding: "12px 32px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default PaymentFailed;
