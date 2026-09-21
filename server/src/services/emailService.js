// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const emailService = {
//   sendWelcomeEmail: async (to, password) => {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to,
//       subject: "Welcome to HK International LMS",
//       text: `Hello,\n\nYour account has been created.\nUsername: ${to}\nPassword: ${password}\n\nPlease log in and change your password on first login.\n\nRegards,\nHK International`,
//     });
//   },

//   sendPasswordResetEmail: async (to, resetLink) => {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to,
//       subject: "Password Reset Request",
//       text: `Click the following link to reset your password:\n${resetLink}\n\nThis link will expire in 15 minutes.`,
//     });
//   },

//   sendRegistrationStatusEmail: async (to, studentName, courseName, status, remarks = "") => {
//     const statusText = status === "approved"
//       ? "has been APPROVED. You can now access the LMS."
//       : "has been REJECTED.";

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to,
//       subject: `Registration ${status.toUpperCase()} — ${courseName}`,
//       text: `Hello ${studentName},\n\nYour registration for "${courseName}" ${statusText}\n${remarks ? `Remarks: ${remarks}\n` : ""}\nRegards,\nHK International`,
//     });
//   },

//   sendRegistrationCreatedEmail: async (to, studentName, courseName) => {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to,
//       subject: `Registration Submitted — ${courseName}`,
//       text: `Hello ${studentName},\n\nYour registration for "${courseName}" has been submitted and is pending approval.\n\nRegards,\nHK International`,
//     });
//   },
// };

// export default emailService;






import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Escapes user-controlled text before it is placed inside HTML.
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const emailService = {
  sendWelcomeEmail: async (to, password) => {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "Welcome to 1A HK International LMS",
      text: `Hello,\n\nYour account has been created.\nUsername: ${to}\nPassword: ${password}\n\nPlease log in and change your password on first login.\n\nRegards,\n1A HK International`,
    });
  },

  sendPasswordResetEmail: async (
    to,
    userName,
    resetLink,
    expiresInMinutes = 15,
  ) => {
    const name = escapeHtml(userName || "there");

    await transporter.sendMail({
      from: `"1A HK International" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Reset your 1A HK International password",
      text: `Hello ${userName || "there"},\n\nWe received a request to reset the password for your 1A HK International LMS account.\n\nReset your password using the link below:\n${resetLink}\n\nThis link will expire in ${expiresInMinutes} minutes and can be used only once.\n\nIf you did not request this, you can safely ignore this email — your password will not be changed.\n\nRegards,\n1A HK International`,
      html: `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:#3730a3;padding:24px 32px;">
                <h1 style="margin:0;font-size:20px;color:#ffffff;">1A HK International</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#374151;font-size:15px;line-height:1.6;">
                <p style="margin:0 0 16px;">Hello ${name},</p>
                <p style="margin:0 0 24px;">We received a request to reset the password for your 1A HK International LMS account. Click the button below to choose a new password.</p>
                <p style="margin:0 0 24px;text-align:center;">
                  <a href="${resetLink}" style="display:inline-block;background-color:#4f46e5;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 32px;border-radius:8px;">Reset Password</a>
                </p>
                <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Or copy and paste this link into your browser:</p>
                <p style="margin:0 0 24px;font-size:13px;word-break:break-all;"><a href="${resetLink}" style="color:#4f46e5;">${resetLink}</a></p>
                <p style="margin:0 0 16px;"><strong>This link will expire in ${expiresInMinutes} minutes</strong> and can be used only once.</p>
                <p style="margin:0;color:#6b7280;font-size:13px;">If you did not request a password reset, you can safely ignore this email — your password will not be changed.</p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f9fafb;padding:16px 32px;font-size:12px;color:#9ca3af;text-align:center;">
                &copy; 1A HK International &middot; info@hkinternational.uk
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
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
      text: `Hello ${studentName},\n\nYour registration for "${courseName}" ${statusText}\n${remarks ? `Remarks: ${remarks}\n` : ""}\nRegards,\n1A HK International`,
    });
  },

  sendRegistrationCreatedEmail: async (to, studentName, courseName) => {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Registration Submitted — ${courseName}`,
      text: `Hello ${studentName},\n\nYour registration for "${courseName}" has been submitted and is pending approval.\n\nRegards,\n1A HK International`,
    });
  },
};

export default emailService;
