
// import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL;

// export const initiatePayment = async (form) => {
//   const res = await axios.post(
//     `${API_URL}/payment/initiate`,
//     form
//   );

//   return res.data;
// };

// export const verifyPayment = async (paymentData) => {
//   const res = await axios.post(
//     `${API_URL}/payment/verify`,
//     paymentData
//   );

//   return res.data;
// };

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const paymentAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/* ---------------- Initiate Payment ---------------- */

export const initiatePayment = async (form) => {
  try {
    const res = await paymentAPI.post("/payment/initiate", form);
    return res.data;
  } catch (error) {
    console.error("INITIATE ERROR:", error?.response?.data || error.message);

    return {
      success: false,
      message: error?.response?.data?.message || "Payment initiation failed",
    };
  }
};

/* ---------------- Verify Payment ---------------- */

export const verifyPayment = async (paymentData) => {
  try {
    const res = await paymentAPI.post("/payment/verify", paymentData);
    return res.data;
  } catch (error) {
    console.error("VERIFY ERROR:", error?.response?.data || error.message);

    return {
      success: false,
      message: error?.response?.data?.message || "Verification failed",
    };
  }
};

/* ---------------- Get Transaction ---------------- */

export const getTransaction = async (orderId) => {
  try {
    const res = await paymentAPI.get(`/payment/transaction/${orderId}`);
    return res.data;
  } catch (error) {
    console.error("GET TXN ERROR:", error);
    return null;
  }
};