import crypto from "crypto";

export const generateHash = (key, txnid, amount, productinfo, name, email, udf1, udf2, udf3, udf4, udf5, salt) => {
  const str = `${key}|${txnid}|${amount}|${productinfo}|${name}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  return crypto.createHash("sha512").update(str).digest("hex");
};

export const verifyHash = (data, key, salt) => {
  const str = `${salt}|${data.status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${key}`;
  return crypto.createHash("sha512").update(str).digest("hex");
};
