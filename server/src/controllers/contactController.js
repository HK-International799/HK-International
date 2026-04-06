import Contact from "../models/contact.js";
import nodemailer from "nodemailer";

/* ---------------- Email Transporter ---------------- */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ---------------- Submit Contact ---------------- */

export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, country, company, subject, message } = req.body;

    /* Validation */

    if (!name || !email || !phone || !country || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    if (phone.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    /* Save to DB */

    const contact = await Contact.create({
      name,
      email,
      phone,
      country,
      company,
      subject,
      message,
    });

    /* Send Email to Admin */

    try {
      await transporter.sendMail({
        from: `"HK International" <${process.env.EMAIL_USER}>`,
        to: "info@hkinternational.uk",
        subject: `New Contact: ${subject}`,
        html: `
          <h3>New Contact Message</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Country:</b> ${country}</p>
          <p><b>Company:</b> ${company}</p>
          <p><b>Subject:</b> ${subject}</p>
          <p><b>Message:</b> ${message}</p>
        `,
      });
    } catch (emailError) {
      console.log("Email sending failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Contact submitted successfully",
      data: contact,
    });
  } catch (error) {
    console.error("CONTACT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ---------------- Get All Contacts ---------------- */

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("GET CONTACT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ---------------- Get Contact By ID ---------------- */

export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("GET CONTACT BY ID ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ---------------- Update Status ---------------- */

export const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["new", "read", "replied"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("UPDATE CONTACT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ---------------- Delete Contact ---------------- */

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      message: "Contact deleted",
    });
  } catch (error) {
    console.error("DELETE CONTACT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};