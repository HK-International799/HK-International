/**
 * textSanitize
 *
 * Small, dependency-free helpers for cleaning free text that users type
 * into the LMS (e.g. the OTHERS course name/details on the public
 * registration form, admin notes on submissions).
 *
 * The goal is plain text only:
 *   - HTML tags / script blocks are removed entirely (never stored),
 *   - stray angle brackets are dropped so nothing can be re-assembled
 *     into markup later,
 *   - control characters are removed,
 *   - whitespace is collapsed and trimmed,
 *   - the result is capped at a sensible maximum length.
 *
 * React escapes output and the email templates escape interpolations, so
 * this is defence-in-depth: the stored value itself is always safe.
 */

const SCRIPT_STYLE_BLOCK_RE = /<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const TAG_RE = /<\/?[a-z!][^>]*>/gi;
const ANGLE_RE = /[<>]/g;
// C0 controls except \t \n \r, plus DEL and C1 controls.
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const JS_URL_RE = /\b(?:javascript|vbscript|data)\s*:/gi;

/**
 * @param {unknown} value
 * @param {object}  [opts]
 * @param {number}  [opts.maxLength=255]
 * @param {boolean} [opts.multiline=false] keep single line breaks
 * @returns {string}
 */
export const sanitizePlainText = (value, { maxLength = 255, multiline = false } = {}) => {
  if (value === null || value === undefined) return "";
  let s = String(value);

  s = s
    .replace(SCRIPT_STYLE_BLOCK_RE, " ")
    .replace(TAG_RE, " ")
    .replace(ANGLE_RE, "")
    .replace(JS_URL_RE, "")
    .replace(CONTROL_RE, "");

  if (multiline) {
    s = s
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
  } else {
    s = s.replace(/\s+/g, " ");
  }

  s = s.trim();
  if (s.length > maxLength) s = s.slice(0, maxLength).trim();
  return s;
};

/** True when the raw input contained markup that sanitizing removed. */
export const containsMarkup = (value) =>
  typeof value === "string" &&
  (/[<>]/.test(value) || /\b(?:javascript|vbscript|data)\s*:/i.test(value));

/**
 * Makes an uploaded filename safe to store / show / use as a download
 * name: strips any path, control characters and characters that are
 * unsafe in Content-Disposition headers, collapses whitespace, caps the
 * length while keeping the extension.
 */
export const sanitizeFilename = (name, { maxLength = 150, fallback = "file" } = {}) => {
  let s = String(name || "")
    .split(/[\\/]/)
    .pop()
    .replace(CONTROL_RE, "")
    .replace(/["<>:|?*;`$]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+/, "");

  if (!s) s = fallback;

  if (s.length > maxLength) {
    const dot = s.lastIndexOf(".");
    const ext = dot > 0 && s.length - dot <= 10 ? s.slice(dot) : "";
    s = s.slice(0, maxLength - ext.length).trim() + ext;
  }
  return s;
};

/**
 * Neutralises spreadsheet formula injection in CSV / Excel cells
 * (values starting with = + - @ TAB CR are prefixed with a quote).
 */
export const neutraliseFormula = (value) => {
  const s = value === null || value === undefined ? "" : String(value);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
};

export default { sanitizePlainText, containsMarkup, sanitizeFilename, neutraliseFormula };
