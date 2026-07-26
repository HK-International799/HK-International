// ── Certificate Dispatch & Courier Management: static configuration ────────
// Sender details are fixed company-wide. They are seeded here as a fallback
// and persisted through the existing Settings model (key: "dispatchSender")
// so a Super Admin can update them without a code change, per requirements.

export const DEFAULT_SENDER = {
  name: "1A HK International",
  careOf: "Anurag Pandey",
  addressLine1: "Premashree House",
  addressLine2: "New Colony",
  area: "Kakarmatta",
  landmark: "BLW",
  city: "Varanasi",
  state: "Uttar Pradesh",
  pinCode: "221004",
  country: "India",
  mobile: "",
  email: "",
  website: "hkinternational.uk",
};

export const COURIER_COMPANY = "India Post - Speed Post";

export const DISPATCH_SETTINGS_KEY = "dispatchSender";
