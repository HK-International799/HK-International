
import Payment from "../models/Payment.js";
import crypto from "crypto";
import fetch from "node-fetch";

// export const initiatePayment = async (req, res) => {
//   try {
//     const { name, email, phone, amount } = req.body;

//     if (!name || !email || !phone || !amount) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     const key = process.env.EASEBUZZ_KEY;
//     const salt = process.env.EASEBUZZ_SALT;
//     const env = process.env.EASEBUZZ_ENV || "test";

//     const txnid = "txn_" + Date.now();
//     const productinfo = "LMS Course Payment";

//     const surl = `${process.env.BACKEND_URL}/api/payment/success`;
//     const furl = `${process.env.BACKEND_URL}/api/payment/failure`;

//     const hashString = `${key}|${txnid}|${amount}|${productinfo}|${name}|${email}|||||||||||${salt}`;

//     const hash = crypto.createHash("sha512").update(hashString).digest("hex");

//     const params = new URLSearchParams();

//     params.append("key", key);
//     params.append("txnid", txnid);
//     params.append("amount", amount);
//     params.append("productinfo", productinfo);
//     params.append("firstname", name);
//     params.append("email", email);
//     params.append("phone", phone);
//     params.append("surl", surl);
//     params.append("furl", furl);
//     params.append("hash", hash);

//     const easebuzzURL =
//       env === "prod"
//         ? "https://pay.easebuzz.in/payment/initiateLink"
//         : "https://testpay.easebuzz.in/payment/initiateLink";

//     const response = await fetch(easebuzzURL, {
//       method: "POST",
//       body: params,
//     });

//     const result = await response.json();

//     if (result.status === 1) {
//       const paymentURL =
//         env === "prod"
//           ? `https://pay.easebuzz.in/pay/${result.data}`
//           : `https://testpay.easebuzz.in/pay/${result.data}`;

//       return res.json({
//         success: true,
//         txnid,
//         paymentURL,
//       });
//     }

//     res.status(400).json({
//       success: false,
//       message: result.data,
//     });
//   } catch (error) {
//     console.error("Initiate payment error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Payment initiation failed",
//     });
//   }
// };



export const initiatePayment = async (req, res) => {
  try {
    let { name, email, phone, amount } = req.body;

    // 🔒 Basic Validation
    if (!name || !email || !phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 🔒 Clean Inputs
    name = name.trim();
    email = email.trim();

    // 🔒 Phone Validation (10 digits only)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // 🔥 Format Amount (IMPORTANT FOR PROD)
    const formattedAmount = parseFloat(amount).toFixed(2);

    const key = process.env.EASEBUZZ_KEY;
    const salt = process.env.EASEBUZZ_SALT;
    const env = process.env.EASEBUZZ_ENV || "test";

    const txnid = "txn_" + Date.now();
    const productinfo = "LMS Course Payment";

    const surl = `${process.env.BACKEND_URL}/api/payment/success`;
    const furl = `${process.env.BACKEND_URL}/api/payment/failure`;

    // 🔥 Correct Hash (with formatted amount)
    const hashString = `${key}|${txnid}|${formattedAmount}|${productinfo}|${name}|${email}|||||||||||${salt}`;

    const hash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex");

    const params = new URLSearchParams();

    params.append("key", key);
    params.append("txnid", txnid);
    params.append("amount", formattedAmount);
    params.append("productinfo", productinfo);
    params.append("firstname", name);
    params.append("email", email);
    params.append("phone", phone);
    params.append("surl", surl);
    params.append("furl", furl);
    params.append("hash", hash);

    // 🔥 REQUIRED IN PRODUCTION (VERY IMPORTANT)
    params.append("udf1", "");
    params.append("udf2", "");
    params.append("udf3", "");
    params.append("udf4", "");
    params.append("udf5", "");

    // 🔍 Debug log (remove in production later)
    console.log("Payment Params:", {
      key,
      txnid,
      amount: formattedAmount,
      name,
      email,
      phone,
      surl,
      furl,
    });

    const easebuzzURL =
      env === "prod"
        ? "https://pay.easebuzz.in/payment/initiateLink"
        : "https://testpay.easebuzz.in/payment/initiateLink";

    const response = await fetch(easebuzzURL, {
      method: "POST",
      body: params,
    });

    const result = await response.json();

    // 🔍 Debug response
    console.log("Easebuzz Response:", result);

    if (result.status === 1) {
      const paymentURL =
        env === "prod"
          ? `https://pay.easebuzz.in/pay/${result.data}`
          : `https://testpay.easebuzz.in/pay/${result.data}`;

      return res.json({
        success: true,
        txnid,
        paymentURL,
      });
    }

    return res.status(400).json({
      success: false,
      message: result.data || "Payment initiation failed",
    });

  } catch (error) {
    console.error("Initiate payment error:", error);

    res.status(500).json({
      success: false,
      message: "Payment initiation failed",
    });
  }
};


export const paymentSuccess = async (req, res) => {
  try {
    const data = req.body;

    const key = process.env.EASEBUZZ_KEY;
    const salt = process.env.EASEBUZZ_SALT;

    const reverseHashString = `${salt}|${data.status}|||||||||||${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${key}`;

    const generatedHash = crypto
      .createHash("sha512")
      .update(reverseHashString)
      .digest("hex");

    if (generatedHash !== data.hash) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed?reason=hash_mismatch`,
      );
    }

    await Payment.create({
      name: data.firstname,
      email: data.email,
      phone: data.phone,
      amount: data.amount,
      txnid: data.txnid,
      paymentId: data.easepayid,
      status: data.status,
      date: new Date(),
      easebuzzResponse: data,
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/payment-success?txnid=${data.txnid}`,
    );
  } catch (error) {
    console.error(error);

    res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed?reason=server_error`,
    );
  }
};

export const paymentFailure = async (req, res) => {
  try {
    const data = req.body;

    await Payment.create({
      name: data.firstname,
      email: data.email,
      phone: data.phone,
      amount: data.amount,
      txnid: data.txnid,
      status: "failed",
      date: new Date(),
      easebuzzResponse: data,
    });
  } catch (error) {
    console.error(error);
  }

  res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
};

export const getTransactionByTxnId = async (req, res) => {
  try {
    const txn = await Payment.findOne({
      txnid: req.params.txnid,
    });

    if (!txn) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json(txn);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};
