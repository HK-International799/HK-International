// /**
//  * registrationValidator
//  *
//  * Pure validation helpers for the public self-registration flow.
//  * Additive module — does not touch any existing validator.
//  */

// const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const MOBILE_RE = /^[0-9]{6,15}$/;

// export const validatePersonalInfo = (body) => {
//   const errors = [];
//   const {
//     firstName,
//     lastName,
//     dob,
//     email,
//     countryCode,
//     mobile,
//     address,
//     country,
//   } = body;

//   if (!firstName || !firstName.trim()) errors.push("First name is required");
//   if (!lastName || !lastName.trim()) errors.push("Last name is required");
//   if (!email || !EMAIL_RE.test(String(email).trim())) {
//     errors.push("A valid email is required");
//   }
//   if (!countryCode || !countryCode.trim()) errors.push("Country code is required");
//   if (!mobile || !MOBILE_RE.test(String(mobile).trim())) {
//     errors.push("A valid mobile number is required");
//   }
//   if (!address || !address.trim()) errors.push("Address is required");
//   if (!country || !country.trim()) errors.push("Country is required");

//   if (!dob) {
//     errors.push("Date of birth is required");
//   } else {
//     const dobDate = new Date(dob);
//     if (Number.isNaN(dobDate.getTime())) {
//       errors.push("Date of birth is invalid");
//     } else {
//       const age = (Date.now() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
//       if (age < 13) errors.push("Learner must be at least 13 years old");
//       if (age > 120) errors.push("Date of birth is invalid");
//     }
//   }

//   return errors;
// };

// export const validateCourseSelection = (body) => {
//   const errors = [];
//   if (!body.courseId) errors.push("Course is required");
//   // batchId is optional per spec
//   return errors;
// };

// export default { validatePersonalInfo, validateCourseSelection };





/**
 * registrationValidator
 *
 * Pure validation helpers for the public self-registration flow.
 * Additive module -- does not touch any existing validator.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[0-9]{6,15}$/;

export const validatePersonalInfo = (body) => {
  const errors = [];
  const {
    firstName,
    lastName,
    dob,
    email,
    countryCode,
    mobile,
    address,
    addressLine1,
    city,
    country,
  } = body;

  if (!firstName || !firstName.trim()) errors.push("First name is required");
  if (!lastName || !lastName.trim()) errors.push("Last name is required");
  // middleName is intentionally optional -- Registration Requirement 1.
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    errors.push("A valid email is required");
  }
  if (!countryCode || !countryCode.trim()) errors.push("Country code is required");
  if (!mobile || !MOBILE_RE.test(String(mobile).trim())) {
    errors.push("A valid mobile number is required");
  }

  // ── Registration Requirement 2: Full Postal Address ─────────────────────
  // Accept either the new structured fields (preferred) or the legacy
  // single `address` string, so existing/older clients that only send
  // `address` are not broken. At least one form is required.
  const hasStructuredAddress =
    (addressLine1 && addressLine1.trim()) && (city && city.trim());
  const hasLegacyAddress = address && address.trim();
  if (!hasStructuredAddress && !hasLegacyAddress) {
    errors.push(
      "A complete postal address is required (address line 1 and city, or a full address)",
    );
  }
  if (!country || !country.trim()) errors.push("Country is required");

  if (!dob) {
    errors.push("Date of birth is required");
  } else {
    const dobDate = new Date(dob);
    if (Number.isNaN(dobDate.getTime())) {
      errors.push("Date of birth is invalid");
    } else {
      const age = (Date.now() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 13) errors.push("Learner must be at least 13 years old");
      if (age > 120) errors.push("Date of birth is invalid");
    }
  }

  return errors;
};

// ── Registration Requirement 3: Multiple Course Selection ─────────────────
// Accepts either a single `courseId` (legacy/backward-compatible — existing
// callers of createRegistration that only ever sent one course keep
// working unchanged) or a `courseIds` array (new multi-select flow).
export const validateCourseSelection = (body) => {
  const errors = [];
  const ids = getRequestedCourseIds(body);

  if (ids.length === 0) {
    errors.push("At least one course is required");
    return errors;
  }

  const unique = new Set(ids.map(String));
  if (unique.size !== ids.length) {
    errors.push("Duplicate courses are not allowed in your selection");
  }

  return errors;
};

// Normalizes courseId / courseIds into a single de-duplicated array,
// preserving selection order (first item becomes the primary course).
export const getRequestedCourseIds = (body) => {
  if (Array.isArray(body.courseIds) && body.courseIds.length) {
    return [...new Set(body.courseIds.filter(Boolean).map(String))];
  }
  if (body.courseId) return [String(body.courseId)];
  return [];
};

// ── Registration Requirement 5: Review & Submit confirmation ──────────────
// Backend validation is mandatory -- the frontend checkbox alone is not
// trusted. A submission without explicit confirmation is rejected.
export const validateConfirmation = (body) => {
  const errors = [];
  const confirmed = body.confirmed === true || body.confirmed === "true";
  if (!confirmed) {
    errors.push(
      "You must confirm that the information provided is accurate and complete",
    );
  }
  return errors;
};

export default {
  validatePersonalInfo,
  validateCourseSelection,
  getRequestedCourseIds,
  validateConfirmation,
};
