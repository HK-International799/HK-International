import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailService = {
  sendWelcomeEmail: async (to, password) => {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "Welcome to HK International LMS",
      text: `Hello,\n\nYour account has been created.\nUsername: ${to}\nPassword: ${password}\n\nPlease log in and change your password on first login.\n\nRegards,\nHK International`,
    });
  },

  sendPasswordResetEmail: async (to, resetLink) => {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "Password Reset Request",
      text: `Click the following link to reset your password:\n${resetLink}\n\nThis link will expire in 15 minutes.`,
    });
  },

  sendRegistrationStatusEmail: async (to, studentName, courseName, status, remarks = "") => {
    const statusText = status === "approved"
      ? "has been APPROVED. You can now access the LMS."
      : "has been REJECTED.";

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Registration ${status.toUpperCase()} — ${courseName}`,
      text: `Hello ${studentName},\n\nYour registration for "${courseName}" ${statusText}\n${remarks ? `Remarks: ${remarks}\n` : ""}\nRegards,\nHK International`,
    });
  },

  sendRegistrationCreatedEmail: async (to, studentName, courseName) => {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Registration Submitted — ${courseName}`,
      text: `Hello ${studentName},\n\nYour registration for "${courseName}" has been submitted and is pending approval.\n\nRegards,\nHK International`,
    });
  },
};

export default emailService;
