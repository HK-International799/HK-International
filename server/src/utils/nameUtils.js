/**
 * nameUtils
 *
 * The User model's `fullName` virtual only evaluates on real Mongoose
 * documents — most read paths in this codebase use `.lean()` for
 * performance, which returns plain objects and skips virtuals entirely.
 * This plain-function equivalent is used anywhere a lean User/registration
 * object needs a correctly-derived full name (never "John  Smith" or
 * "John null Smith", and falls back to the legacy `name` field for
 * pre-existing records that only ever had a single name field).
 */
export const deriveFullName = (person) => {
  if (!person) return "";
  const parts = [person.firstName, person.middleName, person.lastName]
    .map((p) => (p || "").toString().trim())
    .filter(Boolean);
  return parts.length ? parts.join(" ") : person.name || "";
};

/**
 * Build a single-line postal address string from structured fields,
 * falling back to the legacy free-text `address` field. Used anywhere a
 * human-readable address is needed (emails, dispatch labels, exports)
 * without duplicating this formatting logic across controllers.
 */
export const deriveFullAddress = (person) => {
  if (!person) return "";
  const structured = [
    person.addressLine1,
    person.addressLine2,
    person.city,
    person.state,
    person.postalCode,
    person.country,
  ]
    .map((p) => (p || "").toString().trim())
    .filter(Boolean);
  if (structured.length) return structured.join(", ");
  return person.address || "";
};

export default { deriveFullName, deriveFullAddress };
