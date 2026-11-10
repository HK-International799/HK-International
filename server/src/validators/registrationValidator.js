


// /**
//  * registrationValidator
//  *
//  * Pure validation helpers for the public self-registration flow.
//  * Additive module -- does not touch any existing validator.
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
//     addressLine1,
//     city,
//     country,
//   } = body;

//   if (!firstName || !firstName.trim()) errors.push("First name is required");
//   if (!lastName || !lastName.trim()) errors.push("Last name is required");
//   // middleName is intentionally optional -- Registration Requirement 1.
//   if (!email || !EMAIL_RE.test(String(email).trim())) {
//     errors.push("A valid email is required");
//   }
//   if (!countryCode || !countryCode.trim()) errors.push("Country code is required");
//   if (!mobile || !MOBILE_RE.test(String(mobile).trim())) {
//     errors.push("A valid mobile number is required");
//   }

//   // ── Registration Requirement 2: Full Postal Address ─────────────────────
//   // Accept either the new structured fields (preferred) or the legacy
//   // single `address` string, so existing/older clients that only send
//   // `address` are not broken. At least one form is required.
//   const hasStructuredAddress =
//     (addressLine1 && addressLine1.trim()) && (city && city.trim());
//   const hasLegacyAddress = address && address.trim();
//   if (!hasStructuredAddress && !hasLegacyAddress) {
//     errors.push(
//       "A complete postal address is required (address line 1 and city, or a full address)",
//     );
//   }
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

// // ── Registration Requirement 3: Multiple Course Selection ─────────────────
// // Accepts either a single `courseId` (legacy/backward-compatible — existing
// // callers of createRegistration that only ever sent one course keep
// // working unchanged) or a `courseIds` array (new multi-select flow).
// export const validateCourseSelection = (body) => {
//   const errors = [];
//   const ids = getRequestedCourseIds(body);

//   if (ids.length === 0) {
//     errors.push("At least one course is required");
//     return errors;
//   }

//   const unique = new Set(ids.map(String));
//   if (unique.size !== ids.length) {
//     errors.push("Duplicate courses are not allowed in your selection");
//   }

//   return errors;
// };

// // Normalizes courseId / courseIds into a single de-duplicated array,
// // preserving selection order (first item becomes the primary course).
// export const getRequestedCourseIds = (body) => {
//   if (Array.isArray(body.courseIds) && body.courseIds.length) {
//     return [...new Set(body.courseIds.filter(Boolean).map(String))];
//   }
//   if (body.courseId) return [String(body.courseId)];
//   return [];
// };

// // ── Registration Requirement 5: Review & Submit confirmation ──────────────
// // Backend validation is mandatory -- the frontend checkbox alone is not
// // trusted. A submission without explicit confirmation is rejected.
// export const validateConfirmation = (body) => {
//   const errors = [];
//   const confirmed = body.confirmed === true || body.confirmed === "true";
//   if (!confirmed) {
//     errors.push(
//       "You must confirm that the information provided is accurate and complete",
//     );
//   }
//   return errors;
// };

// export default {
//   validatePersonalInfo,
//   validateCourseSelection,
//   getRequestedCourseIds,
//   validateConfirmation,
// };






/**
 * registrationValidator
 *
 * Pure validation helpers for the public self-registration flow.
 * Additive module -- does not touch any existing validator.
 */

import { sanitizePlainText } from "../utils/textSanitize.js";
import {
  OTHER_COURSE_NAME_MAX,
  OTHER_COURSE_NAME_MIN,
  OTHER_COURSE_DETAILS_MAX,
} from "../utils/registrationCourse.js";

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

  // ── OTHERS course ──────────────────────────────────────────────────────
  // OTHERS is mutually exclusive with catalogue courses: a request that
  // claims both is an invalid combination and is rejected, never "fixed up".
  if (isOtherCourseRequested(body)) {
    if (ids.length > 0) {
      errors.push(
        "OTHERS cannot be combined with a listed course. Please select either listed course(s) or OTHERS",
      );
    }
    errors.push(...validateOtherCourse(body));
    return errors;
  }

  if (hasOtherCourseText(body)) {
    errors.push(
      "Course name/details can only be provided when OTHERS is selected",
    );
  }

  if (ids.length === 0) {
    errors.push("At least one course is required");
    return errors;
  }

  if (!ids.every(isObjectIdLike)) {
    errors.push("One or more selected courses are invalid");
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
  if (body.courseId && typeof body.courseId !== "object") {
    return [String(body.courseId)];
  }
  return [];
};

const isObjectIdLike = (id) => /^[a-f0-9]{24}$/i.test(String(id));

// ── OTHERS course helpers ─────────────────────────────────────────────────
// Accepts `isOtherCourse: true` (preferred) or "true" from form posts.
export const isOtherCourseRequested = (body) =>
  body?.isOtherCourse === true || body?.isOtherCourse === "true";

const hasOtherCourseText = (body) =>
  (typeof body?.otherCourseName === "string" && body.otherCourseName.trim()) ||
  (typeof body?.otherCourseDetails === "string" && body.otherCourseDetails.trim());

/**
 * Returns the cleaned OTHERS values (plain text, trimmed, length-capped).
 * Non-string input is treated as empty, never coerced from objects.
 */
export const getOtherCourseInput = (body) => ({
  otherCourseName: sanitizePlainText(
    typeof body?.otherCourseName === "string" ? body.otherCourseName : "",
    { maxLength: OTHER_COURSE_NAME_MAX + 1 },
  ),
  otherCourseDetails: sanitizePlainText(
    typeof body?.otherCourseDetails === "string" ? body.otherCourseDetails : "",
    { maxLength: OTHER_COURSE_DETAILS_MAX + 1, multiline: true },
  ),
});

export const validateOtherCourse = (body) => {
  const errors = [];
  const { otherCourseName, otherCourseDetails } = getOtherCourseInput(body);

  if (!otherCourseName) {
    errors.push("Course Name is required when OTHERS is selected");
  } else if (otherCourseName.length < OTHER_COURSE_NAME_MIN) {
    errors.push(
      `Course Name must be at least ${OTHER_COURSE_NAME_MIN} characters`,
    );
  } else if (otherCourseName.length > OTHER_COURSE_NAME_MAX) {
    errors.push(
      `Course Name must be ${OTHER_COURSE_NAME_MAX} characters or fewer`,
    );
  }

  if (otherCourseDetails.length > OTHER_COURSE_DETAILS_MAX) {
    errors.push(
      `Course Details must be ${OTHER_COURSE_DETAILS_MAX} characters or fewer`,
    );
  }
  return errors;
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
  isOtherCourseRequested,
  getOtherCourseInput,
  validateOtherCourse,
};
