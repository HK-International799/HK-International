import nodemailer from "nodemailer";

/* ──────────────────────────────────────────────────────────────────────────
 * BRAND & SIGNATURE — edit the values below, nothing else needs to change.
 * Any signature field left as "" is simply omitted from the emails, so no
 * blank rows (or the word "undefined") ever appear.
 * ────────────────────────────────────────────────────────────────────────── */
const BRAND = {
  name: "1A HK International",
  tagline: "Accredited Health & Safety Training",
  primary: "#3730a3", // header bar + team name
  accent: "#4f46e5", // buttons + links
  logoUrl: "", // optional: absolute https URL of a PNG/JPG logo (shown in the header)
};

const SIGNATURE = {
  name: "Anurag Pandey",
  designation: " Full Stack Developer", // e.g. "Full Stack Developer"
  team: "1A HK International",
  mobile: "+91- 7991845638", // e.g. "+91 98765 43210"
  email: "info@hkinternational.uk", // also used as the Reply-To address
  website: "https://hkinternational.uk",
  address: "", // e.g. "Varanasi, Uttar Pradesh, India"
};

/* ──────────────────────────── helpers ──────────────────────────────────── */

const FONT = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// Created on first use, so env vars are read after dotenv has loaded them.
let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

// Escapes user-controlled text before it is placed inside HTML.
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const frontendUrl = () =>
  (process.env.FRONTEND_URL || process.env.CLIENT_URL_STUDENT || "").replace(
    /\/+$/,
    "",
  );

const sendMail = ({ to, subject, text, html }) =>
  getTransporter().sendMail({
    from: `"${BRAND.name}" <${process.env.EMAIL_USER}>`,
    replyTo: SIGNATURE.email || undefined,
    to,
    subject,
    text,
    html,
  });

/* ─────────────────────── signature (HTML + text) ───────────────────────── */

const contactRow = (label, valueHtml) => `
        <tr>
          <td style="padding:2px 14px 2px 0;font-size:13px;color:#6b7280;white-space:nowrap;">${label}</td>
          <td style="padding:2px 0;font-size:13px;color:#111827;">${valueHtml}</td>
        </tr>`;

const signatureHtml = () => {
  const s = SIGNATURE;
  const rows = [];

  if (s.mobile) {
    rows.push(
      contactRow(
        "Mobile",
        `<a href="tel:${escapeHtml(s.mobile.replace(/[^\d+]/g, ""))}" style="color:#111827;text-decoration:none;">${escapeHtml(s.mobile)}</a>`,
      ),
    );
  }
  if (s.email) {
    rows.push(
      contactRow(
        "Email",
        `<a href="mailto:${escapeHtml(s.email)}" style="color:${BRAND.accent};text-decoration:none;">${escapeHtml(s.email)}</a>`,
      ),
    );
  }
  if (s.website) {
    rows.push(
      contactRow(
        "Website",
        `<a href="${escapeHtml(s.website)}" style="color:${BRAND.accent};text-decoration:none;">${escapeHtml(s.website.replace(/^https?:\/\//, ""))}</a>`,
      ),
    );
  }
  if (s.address) rows.push(contactRow("Address", escapeHtml(s.address)));

  return `
        <p style="margin:32px 0 14px;font-size:15px;color:#374151;">Best regards,</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td style="width:4px;background-color:${BRAND.accent};font-size:0;line-height:0;">&nbsp;</td>
            <td style="padding:2px 0 2px 16px;">
                ${
                  s.name
                    ? `
                  <div style="font-size:16px;font-weight:700;">
                    <a
                      href="https://anucortex.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="color:#111827;text-decoration:none;"
                    >
                      ${escapeHtml(s.name)}
                    </a>
                  </div>
                  <div style="font-size:11px;color:#6366f1;margin-top:2px;">
                    Full Stack Developer
                  </div>
                  `
                    : ""
                }
                ${s.designation ? `<div style="font-size:13px;color:#4b5563;">${escapeHtml(s.designation)}</div>` : ""}
              ${s.team ? `<div style="font-size:13px;font-weight:bold;color:${BRAND.primary};margin:2px 0 8px;">${escapeHtml(s.team)}</div>` : ""}
              ${rows.length ? `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows.join("")}</table>` : ""}
            </td>
          </tr>
        </table>`;
};

const signatureText = () => {
  const s = SIGNATURE;
  const lines = [
    s.name && `${s.name} (https://anucortex.vercel.app/)`,
    s.designation,
    s.team,
    s.mobile && `Mobile: ${s.mobile}`,
    s.email && `Email: ${s.email}`,
    s.website && `Website: ${s.website}`,
    s.address && `Address: ${s.address}`,
  ].filter(Boolean);

  return ["Best regards,", ...lines].join("\n");
};

const textEmail = (lines) => `${lines.join("\n")}\n\n${signatureText()}`;

/* ───────────────────────── layout building blocks ──────────────────────── */

const para = (html, style = "") =>
  `<p style="margin:0 0 16px;${style}">${html}</p>`;

const button = (label, url) => `
        <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:8px auto 24px;">
          <tr>
            <td style="background-color:${BRAND.accent};border-radius:8px;">
              <a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
            </td>
          </tr>
        </table>`;

// rows: [[label, valueHtml], ...]
const detailsBox = (rows) => `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
          <tr>
            <td style="padding:14px 18px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                ${rows
                  .map(
                    ([label, value]) => `
                <tr>
                  <td style="padding:4px 16px 4px 0;font-size:13px;color:#6b7280;vertical-align:top;white-space:nowrap;">${label}</td>
                  <td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;">${value}</td>
                </tr>`,
                  )
                  .join("")}
              </table>
            </td>
          </tr>
        </table>`;

const CALLOUT_AMBER = { bg: "#fffbeb", border: "#fde68a", color: "#92400e" };
const CALLOUT_GRAY = { bg: "#f3f4f6", border: "#e5e7eb", color: "#4b5563" };

const callout = (html, { bg, border, color }) => `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background-color:${bg};border:1px solid ${border};border-radius:8px;">
          <tr>
            <td style="padding:12px 16px;font-size:13px;line-height:1.5;color:${color};">${html}</td>
          </tr>
        </table>`;

const renderEmail = ({ preheader = "", heading, bodyHtml }) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:${BRAND.primary};padding:24px 32px;font-family:${FONT};">
                ${BRAND.logoUrl ? `<img src="${escapeHtml(BRAND.logoUrl)}" alt="${escapeHtml(BRAND.name)}" height="40" style="display:block;margin-bottom:8px;border:0;">` : ""}
                <div style="font-size:22px;font-weight:bold;color:#ffffff;">${escapeHtml(BRAND.name)}</div>
                <div style="font-size:12px;letter-spacing:.6px;text-transform:uppercase;color:#c7d2fe;margin-top:2px;">${escapeHtml(BRAND.tagline)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-family:${FONT};color:#374151;font-size:15px;line-height:1.6;">
                <h2 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:#111827;">${escapeHtml(heading)}</h2>
                ${bodyHtml}
                ${signatureHtml()}
              </td>
            </tr>
            <tr>
              <td style="background-color:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 32px;font-family:${FONT};font-size:12px;line-height:1.5;color:#9ca3af;text-align:center;">
                This is an automated message from the ${escapeHtml(BRAND.name)} LMS.${SIGNATURE.email ? ` Questions? Just reply or write to ${escapeHtml(SIGNATURE.email)}.` : ""}<br>
                &copy; ${new Date().getFullYear()} ${escapeHtml(BRAND.name)}. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

/* ───────────────────────────── the emails ──────────────────────────────── */

const emailService = {
  sendWelcomeEmail: async (to, password) => {
    const loginUrl = frontendUrl() ? `${frontendUrl()}/login` : "";

    const html = renderEmail({
      preheader: `Your ${BRAND.name} LMS account is ready.`,
      heading: `Welcome to ${BRAND.name}`,
      bodyHtml: [
        para("Hello,"),
        para(
          `Your account on the ${escapeHtml(BRAND.name)} Learning Management System has been created. You can sign in using the details below.`,
        ),
        detailsBox([
          ["Username", escapeHtml(to)],
          [
            "Password",
            `<span style="font-family:Consolas,'Courier New',monospace;">${escapeHtml(password)}</span>`,
          ],
        ]),
        loginUrl ? button("Log in to your account", loginUrl) : "",
        callout(
          "<strong>Security tip:</strong> please change your password after your first login and never share it with anyone.",
          CALLOUT_AMBER,
        ),
      ].join(""),
    });

    const text = textEmail([
      "Hello,",
      "",
      `Your account on the ${BRAND.name} Learning Management System has been created.`,
      "",
      `Username: ${to}`,
      `Password: ${password}`,
      ...(loginUrl ? ["", `Log in: ${loginUrl}`] : []),
      "",
      "For your security, please change your password after your first login and never share it with anyone.",
    ]);

    await sendMail({
      to,
      subject: `Welcome to ${BRAND.name} LMS`,
      text,
      html,
    });
  },

  sendPasswordResetEmail: async (
    to,
    userName,
    resetLink,
    expiresInMinutes = 15,
  ) => {
    const html = renderEmail({
      preheader: `Use this link to reset your password. It expires in ${expiresInMinutes} minutes.`,
      heading: "Reset your password",
      bodyHtml: [
        para(`Hello ${escapeHtml(userName || "there")},`),
        para(
          `We received a request to reset the password for your ${escapeHtml(BRAND.name)} LMS account. Click the button below to choose a new password.`,
        ),
        button("Reset Password", resetLink),
        para(
          "Or copy and paste this link into your browser:",
          "font-size:13px;color:#6b7280;margin-bottom:6px;",
        ),
        para(
          `<a href="${escapeHtml(resetLink)}" style="color:${BRAND.accent};word-break:break-all;">${escapeHtml(resetLink)}</a>`,
          "font-size:13px;margin-bottom:24px;",
        ),
        callout(
          `<strong>This link expires in ${expiresInMinutes} minutes</strong> and can be used only once.`,
          CALLOUT_AMBER,
        ),
        callout(
          "If you did not request a password reset, you can safely ignore this email — your password will not be changed.",
          CALLOUT_GRAY,
        ),
      ].join(""),
    });

    const text = textEmail([
      `Hello ${userName || "there"},`,
      "",
      `We received a request to reset the password for your ${BRAND.name} LMS account.`,
      "",
      "Reset your password using the link below:",
      resetLink,
      "",
      `This link will expire in ${expiresInMinutes} minutes and can be used only once.`,
      "",
      "If you did not request this, you can safely ignore this email — your password will not be changed.",
    ]);

    await sendMail({
      to,
      subject: `Reset your ${BRAND.name} password`,
      text,
      html,
    });
  },

  sendRegistrationStatusEmail: async (
    to,
    studentName,
    courseName,
    status,
    remarks = "",
  ) => {
    const approved = status === "approved";
    const loginUrl = frontendUrl() ? `${frontendUrl()}/login` : "";

    const badge = `<span style="display:inline-block;padding:3px 12px;border-radius:999px;font-size:12px;font-weight:bold;letter-spacing:.5px;background-color:${approved ? "#dcfce7" : "#fee2e2"};color:${approved ? "#166534" : "#991b1b"};">${approved ? "APPROVED" : "REJECTED"}</span>`;

    const details = [
      ["Course", escapeHtml(courseName)],
      ["Status", badge],
    ];
    if (remarks) details.push(["Remarks", escapeHtml(remarks)]);

    const html = renderEmail({
      preheader: `Your registration for ${courseName} has been ${approved ? "approved" : "rejected"}.`,
      heading: approved ? "Registration approved" : "Registration update",
      bodyHtml: [
        para(`Hello ${escapeHtml(studentName)},`),
        para(
          approved
            ? `Good news — your registration for <strong>${escapeHtml(courseName)}</strong> has been approved. You can now access the LMS.`
            : `We have reviewed your registration for <strong>${escapeHtml(courseName)}</strong>, and unfortunately it has been rejected.`,
        ),
        detailsBox(details),
        approved && loginUrl ? button("Go to LMS", loginUrl) : "",
        approved
          ? ""
          : para(
              "If you believe this is a mistake or would like more information, simply reply to this email and our team will help you.",
            ),
      ].join(""),
    });

    const text = textEmail([
      `Hello ${studentName},`,
      "",
      approved
        ? `Your registration for "${courseName}" has been APPROVED. You can now access the LMS.`
        : `Your registration for "${courseName}" has been REJECTED.`,
      ...(remarks ? [`Remarks: ${remarks}`] : []),
      ...(approved && loginUrl ? ["", `Go to LMS: ${loginUrl}`] : []),
      ...(!approved
        ? [
            "",
            "If you believe this is a mistake or would like more information, simply reply to this email.",
          ]
        : []),
    ]);

    await sendMail({
      to,
      subject: `Registration ${status.toUpperCase()} — ${courseName}`,
      text,
      html,
    });
  },

  sendRegistrationCreatedEmail: async (to, studentName, courseName) => {
    const html = renderEmail({
      preheader: `We have received your registration for ${courseName}.`,
      heading: "Registration submitted",
      bodyHtml: [
        para(`Hello ${escapeHtml(studentName)},`),
        para(
          `Thank you for registering. We have received your registration for <strong>${escapeHtml(courseName)}</strong> and it is now pending approval.`,
        ),
        detailsBox([
          ["Course", escapeHtml(courseName)],
          [
            "Status",
            `<span style="display:inline-block;padding:3px 12px;border-radius:999px;font-size:12px;font-weight:bold;letter-spacing:.5px;background-color:#fef3c7;color:#92400e;">PENDING APPROVAL</span>`,
          ],
        ]),
        para(
          "You will receive another email as soon as your registration has been reviewed.",
        ),
      ].join(""),
    });

    const text = textEmail([
      `Hello ${studentName},`,
      "",
      `Thank you for registering. Your registration for "${courseName}" has been submitted and is pending approval.`,
      "",
      "You will receive another email as soon as it has been reviewed.",
    ]);

    await sendMail({
      to,
      subject: `Registration Submitted — ${courseName}`,
      text,
      html,
    });
  },
};

export default emailService;
