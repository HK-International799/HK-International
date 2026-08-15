// ── Certificate branding defaults ─────────────────────────────────────────
// The data model has no place today to store an "authorized signatory"
// name/title or an org wordmark image reference (Course/AwardingOrganisation
// only carry a `logo` for the accrediting body, not for 1A HK itself).
// Rather than inventing a new model/collection for a single settings row,
// these are small, overridable constants — same pattern as hardcoding
// "1A HK International" already used in the original certificateGenerator.js.
//
// Ops can override the signatory without a code change via env vars,
// following the existing CLIENT_URL_*/FRONTEND_URL convention.
export const BRAND = {
  orgName: "1A HK International",
  orgTagline: "UK-Accredited Health & Safety Training Provider",
  signatoryName: process.env.CERT_SIGNATORY_NAME || "Dr. Ashish M. Ved",
  signatoryTitle: process.env.CERT_SIGNATORY_TITLE || "Founder & Director",
  primaryColor: "#1a237e",
  accentColor: "#ffc107",
};

export default BRAND;
