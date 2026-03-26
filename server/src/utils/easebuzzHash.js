// import crypto from "crypto";

// export const generateHash = (
//   key,
//   txnid,
//   amount,
//   productinfo,
//   name,
//   email,
//   salt
// ) => {
//   const str = `${key}|${txnid}|${amount}|${productinfo}|${name}|${email}|||||||||||${salt}`;

//   return crypto.createHash("sha512").update(str).digest("hex");
// };

// export const verifyHash = (data, key, salt) => {
//   const str = `${salt}|${data.status}|||||||||||${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${key}`;

//   return crypto.createHash("sha512").update(str).digest("hex");
// };


import crypto from "crypto";

/**
 * Generate hash for initiating payment
 * Format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
 */
export const generateHash = (
  key,
  txnid,
  amount,
  productinfo,
  name,
  email,
  udf1,
  udf2,
  udf3,
  udf4,
  udf5,
  salt
) => {
  const str = `${key}|${txnid}|${amount}|${productinfo}|${name}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  return crypto.createHash("sha512").update(str).digest("hex");
};

/**
 * Verify hash from Easebuzz response (reverse hash)
 * Format: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
 */
export const verifyHash = (data, key, salt) => {
  const str = `${salt}|${data.status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${key}`;
  return crypto.createHash("sha512").update(str).digest("hex");
};
