import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP config
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailService = {
  sendWelcomeEmail: async (to, password) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Welcome to HK International LMS",
      text: `Hello,\n\nYour account has been created.\nUsername: ${to}\nPassword: ${password}\n\nPlease log in and change your password on first login.\n\nRegards,\nHK International`,
    };

    await transporter.sendMail(mailOptions);
  },

  sendPasswordResetEmail: async (to, resetLink) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Password Reset Request",
      text: `Click the following link to reset your password:\n${resetLink}\n\nThis link will expire in 15 minutes.`,
    };

    await transporter.sendMail(mailOptions);
  },
};

export default emailService;
