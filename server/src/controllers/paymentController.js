
import Payment from "../models/Payment.js";
import { generateHash, verifyHash } from "../utils/easebuzzHash.js";
import crypto from "crypto";
import fetch from "node-fetch"; // npm install node-fetch if not already installed

export const initiatePayment = async (req, res) => {
  try {
    const { name, email, phone, amount } = req.body;

    if (!name || !email || !phone || !amount) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const key = process.env.EASEBUZZ_KEY;
    const salt = process.env.EASEBUZZ_SALT;
    const env = process.env.EASEBUZZ_ENV || "test"; // "test" or "prod"

    const txnid = "txn_" + Date.now();
    const productinfo = "LMS Payment";

    const udf1 = "";
    const udf2 = "";
    const udf3 = "";
    const udf4 = "";
    const udf5 = "";

    const surl = `${process.env.FRONTEND_URL}/payment-success`;
    const furl = `${process.env.FRONTEND_URL}/payment-failed`;

    // Generate hash: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${name}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;

    const hash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex");

    // Build form data to send to Easebuzz initiate API
    const params = new URLSearchParams();
    params.append("key", key);
    params.append("txnid", txnid);
    params.append("amount", amount);
    params.append("productinfo", productinfo);
    params.append("firstname", name);
    params.append("email", email);
    params.append("phone", phone);
    params.append("surl", surl);
    params.append("furl", furl);
    params.append("udf1", udf1);
    params.append("udf2", udf2);
    params.append("udf3", udf3);
    params.append("udf4", udf4);
    params.append("udf5", udf5);
    params.append("hash", hash);

    // Call Easebuzz Initiate API
    const easebuzzURL =
      env === "prod"
        ? "https://pay.easebuzz.in/payment/initiateLink"
        : "https://testpay.easebuzz.in/payment/initiateLink";

    const response = await fetch(easebuzzURL, {
      method: "POST",
      body: params,
    });

    const result = await response.json();

    if (result.status === 1) {
      // result.data contains the access key
      const paymentURL =
        env === "prod"
          ? `https://pay.easebuzz.in/pay/${result.data}`
          : `https://testpay.easebuzz.in/pay/${result.data}`;

      res.json({
        success: true,
        accessKey: result.data,
        paymentURL,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.data || "Failed to initiate payment",
      });
    }
  } catch (error) {
    console.error("Initiate payment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const paymentSuccess = async (req, res) => {
  try {
    const data = req.body;

    const key = process.env.EASEBUZZ_KEY;
    const salt = process.env.EASEBUZZ_SALT;

    // Verify reverse hash
    const generatedHash = verifyHash(data, key, salt);

    if (generatedHash !== data.hash) {
      console.error("Hash mismatch on success callback");
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?reason=hash_mismatch`);
    }

    await Payment.create({
      name: data.firstname,
      email: data.email,
      phone: data.phone,
      amount: data.amount,
      txnid: data.txnid,
      easebuzz_payment_id: data.easepayid,
      status: data.status,
      hash: data.hash,
      easebuzzResponse: data,
    });

    res.redirect(`${process.env.FRONTEND_URL}/student/dashboard`);
  } catch (error) {
    console.error("Payment success handler error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/payment-failed?reason=server_error`);
  }
};

export const paymentFailure = async (req, res) => {
  try {
    await Payment.create({
      name: req.body.firstname || "",
      email: req.body.email || "",
      phone: req.body.phone || "",
      amount: req.body.amount || "",
      txnid: req.body.txnid || "",
      status: "failed",
      easebuzzResponse: req.body,
    });
  } catch (err) {
    console.error("Error saving failed payment:", err);
  }

  res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
};
