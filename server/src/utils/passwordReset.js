import crypto from "crypto";

/**
 * passwordReset.js
 * Helpers for the Forgot / Reset Password flow.
 *
 * Security model:
 *   - The raw token (256 bits from crypto.randomBytes) exists ONLY in the
 *     emailed link. The database stores its SHA-256 hash, so a DB leak
 *     cannot be turned into working reset links.
 *   - Tokens expire after RESET_TOKEN_TTL_MINUTES and are single-use.
 */

export const RESET_TOKEN_TTL_MINUTES = 15;
export const RESET_TOKEN_TTL_MS = RESET_TOKEN_TTL_MINUTES * 60 * 1000;

// Minimum gap between two reset emails for the same account (email-bombing guard).
export const RESET_REQUEST_COOLDOWN_MS = 60 * 1000;

// Every /forgot-password call returns exactly this, whether or not the
// account exists (prevents user enumeration).
export const FORGOT_PASSWORD_MESSAGE =
  "If an account exists, a password reset link has been sent.";

export const INVALID_TOKEN_MESSAGE =
  "Invalid or expired password reset link. Please request a new one.";

// bcrypt only uses the first 72 bytes of a password.
export const PASSWORD_MAX_BYTES = 72;

const MIN_FORGOT_RESPONSE_MS = 1200;

/** SHA-256 hex digest of a raw reset token. */
export const hashResetToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

/**
 * Generates a new reset token.
 * @returns {{ token: string, hashedToken: string, expiresAt: Date }}
 *   `token` goes in the email only; `hashedToken` + `expiresAt` go in the DB.
 */
export const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex"); // 64 hex chars
  return {
    token,
    hashedToken: hashResetToken(token),
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  };
};

/** Cheap shape check so junk input never reaches the database. */
export const isValidTokenFormat = (token) =>
  typeof token === "string" && /^[a-f0-9]{64}$/.test(token);

/**
 * Builds the frontend reset URL.
 * The base comes from env ONLY — never from the request Host/Origin
 * headers (that would allow password-reset poisoning). In production the
 * base must be https.
 */
export const buildResetUrl = (token) => {
  const base = (
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL_STUDENT ||
    (process.env.NODE_ENV !== "production" ? "http://localhost:5173" : "")
  ).replace(/\/+$/, "");

  if (!base) {
    throw new Error(
      "FRONTEND_URL (or CLIENT_URL_STUDENT) is not configured — cannot build password reset link",
    );
  }
  if (process.env.NODE_ENV === "production" && !/^https:\/\//i.test(base)) {
    throw new Error(
      "FRONTEND_URL must use https in production — refusing to send an insecure reset link",
    );
  }

  return `${base}/reset-password/${token}`;
};

/**
 * Password strength policy for reset.
 * @returns {string|null} error message, or null when the password is acceptable.
 */
export const validatePasswordStrength = (password) => {
  if (typeof password !== "string" || password.length === 0) {
    return "Password is required";
  }
  if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
    return `Password must not exceed ${PASSWORD_MAX_BYTES} characters`;
  }
  if (
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a special character";
  }
  return null;
};

/**
 * Pads a response so "account exists" (which waits on SMTP) and
 * "account does not exist" take a similar time — best-effort protection
 * against timing-based enumeration.
 */
export const enforceMinDuration = async (
  startedAt,
  minMs = MIN_FORGOT_RESPONSE_MS,
) => {
  const remaining = minMs - (Date.now() - startedAt);
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
};
