import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";

/* ---------------- Razorpay Instance ---------------- */

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys missing");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/* ---------------- Email Validation ---------------- */

const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

/* ---------------- Phone Validation (International) ---------------- */

// const isValidPhone = (phone) => {
//   return /^\+?[1-9]\d{7,14}$/.test(phone);
// };

const isValidPhone = (phone) => {
  const clean = String(phone).replace(/\s/g, "");

  return /^[1-9]\d{7,14}$/.test(
    clean.startsWith("+") ? clean.substring(1) : clean,
  );
};

/* ---------------- Create Order ---------------- */

export const initiatePayment = async (req, res) => {
  try {
    const razorpay = getRazorpay();

    let {
      name,
      email,
      phone,
      amount,
      currency = "INR",
      country = "India",
    } = req.body;

    /* -------- Validation -------- */

    if (!name || !email || !phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid international phone number",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    const receipt = `rcpt_${Date.now()}`;

    /* -------- Create Razorpay Order -------- */

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        name,
        email,
        phone,
        country,
      },
    });

    /* -------- Save in DB -------- */

    await Payment.create({
      name,
      email,
      phone,
      amount: Number(amount),
      currency,
      country,
      orderId: order.id,
      receipt,
      status: "created",
      gateway: "razorpay",
    });

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("INITIATE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Payment initiation failed",
    });
  }
};

/* ---------------- Verify Payment ---------------- */

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    /* -------- Signature Check -------- */

    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "failed" },
      );

      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "success") {
      return res.json({
        success: true,
        message: "Already verified",
      });
    }

    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = "success";
    payment.razorpayResponse = req.body;

    await payment.save();

    res.json({
      success: true,
      message: "Payment verified",
      redirect: `${process.env.FRONTEND_URL}/payment-success?orderId=${razorpay_order_id}`,
    });
  } catch (error) {
    console.error("VERIFY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

/* ---------------- Razorpay Webhook ---------------- */

export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).send("Invalid signature");
    }

    const payload = JSON.parse(req.body.toString());
    const event = payload.event;

    console.log("Webhook Event:", event);

    if (event === "payment.captured") {
      const paymentData = payload.payload.payment.entity;

      await Payment.findOneAndUpdate(
        { orderId: paymentData.order_id },
        {
          paymentId: paymentData.id,
          status: "success",
          webhookVerified: true,
          razorpayResponse: paymentData,
        },
      );
    }

    if (event === "payment.failed") {
      const paymentData = payload.payload.payment.entity;

      await Payment.findOneAndUpdate(
        { orderId: paymentData.order_id },
        {
          status: "failed",
          webhookVerified: true,
          razorpayResponse: paymentData,
        },
      );
    }

    if (event === "order.paid") {
      const orderData = payload.payload.order.entity;

      await Payment.findOneAndUpdate(
        { orderId: orderData.id },
        {
          status: "success",
          webhookVerified: true,
          razorpayResponse: orderData,
        },
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Webhook error",
    });
  }
};

/* ---------------- Get Transaction ---------------- */

export const getTransactionByOrderId = async (req, res) => {
  try {
    const txn = await Payment.findOne({
      orderId: req.params.orderId,
    });

    if (!txn) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: txn,
    });
  } catch (error) {
    console.error("GET TXN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
