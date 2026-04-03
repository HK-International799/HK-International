

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

export const initiatePayment = async (form) => {
  const res = await axios.post(
    `${API_URL}/payment/initiate`,
    form
  );

  return res.data;
};

export const verifyPayment = async (paymentData) => {
  const res = await axios.post(
    `${API_URL}/payment/verify`,
    paymentData
  );

  return res.data;
};