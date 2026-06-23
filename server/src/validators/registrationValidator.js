/**
 * registrationValidator
 *
 * Pure validation helpers for the public self-registration flow.
 * Additive module — does not touch any existing validator.
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
    country,
  } = body;

  if (!firstName || !firstName.trim()) errors.push("First name is required");
  if (!lastName || !lastName.trim()) errors.push("Last name is required");
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    errors.push("A valid email is required");
  }
  if (!countryCode || !countryCode.trim()) errors.push("Country code is required");
  if (!mobile || !MOBILE_RE.test(String(mobile).trim())) {
    errors.push("A valid mobile number is required");
  }
  if (!address || !address.trim()) errors.push("Address is required");
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

export const validateCourseSelection = (body) => {
  const errors = [];
  if (!body.courseId) errors.push("Course is required");
  // batchId is optional per spec
  return errors;
};

export default { validatePersonalInfo, validateCourseSelection };
