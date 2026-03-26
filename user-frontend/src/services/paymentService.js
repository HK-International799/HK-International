


import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Initiate payment: calls backend, then redirects user to Easebuzz payment page
 */
export const initiatePayment = async ({ name, email, phone, amount }) => {
  const response = await axios.post(`${API_URL}/api/payment/initiate`, {
    name,
    email,
    phone,
    amount,
  });

  return response.data;
};
