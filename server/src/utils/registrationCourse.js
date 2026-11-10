/**
 * registrationCourse
 *
 * Single place that knows how to describe "the course" of a Registration.
 *
 * A Registration normally points at a real catalogue Course (`course`).
 * Since the OTHERS option was added it may instead carry a learner-typed
 * course that is NOT in the catalogue:
 *
 *   isOtherCourse      true
 *   course             null (until an admin links a catalogue course)
 *   otherCourseName    "NEBOSH IGC"           (required when isOtherCourse)
 *   otherCourseDetails "Weekend batch, ..."   (optional)
 *
 * The OTHERS fields are never cleared, so the learner's original request is
 * preserved even after an admin links the registration to a real course.
 *
 * Every display path (admin list, exports, emails, notifications, labels…)
 * should go through `getRegistrationCourseLabel` so a registration never
 * renders as blank / "undefined" / "null" — including legacy records whose
 * course has since been deleted.
 */

export const OTHER_COURSE_LABEL = "OTHERS";
export const OTHER_COURSE_FILTER = "others"; // ?course=others
export const NO_COURSE_FILTER = "none"; // ?course=none  (missing / deleted)

export const OTHER_COURSE_NAME_MAX = 150;
export const OTHER_COURSE_NAME_MIN = 2;
export const OTHER_COURSE_DETAILS_MAX = 1000;

export const COURSE_UNAVAILABLE_LABEL = "Course unavailable";

const titleOf = (course) =>
  course && typeof course === "object" && typeof course.title === "string"
    ? course.title.trim()
    : "";

/**
 * Human-readable course label for a (lean or hydrated) Registration whose
 * `course` may or may not be populated.
 *
 * @param {object}  reg
 * @param {object}  [opts]
 * @param {boolean} [opts.withOthersPrefix=true]  "OTHERS — Name" vs "Name"
 */
export const getRegistrationCourseLabel = (reg, { withOthersPrefix = true } = {}) => {
  if (!reg) return COURSE_UNAVAILABLE_LABEL;
  const title = titleOf(reg.course);
  if (title) return title;

  if (reg.isOtherCourse && reg.otherCourseName) {
    return withOthersPrefix
      ? `${OTHER_COURSE_LABEL} — ${reg.otherCourseName}`
      : reg.otherCourseName;
  }
  return COURSE_UNAVAILABLE_LABEL;
};

/** True when the registration has a usable, populated catalogue course. */
export const hasCatalogueCourse = (reg) => Boolean(reg?.course && (reg.course._id || reg.course));

export default {
  OTHER_COURSE_LABEL,
  OTHER_COURSE_FILTER,
  NO_COURSE_FILTER,
  OTHER_COURSE_NAME_MAX,
  OTHER_COURSE_NAME_MIN,
  OTHER_COURSE_DETAILS_MAX,
  COURSE_UNAVAILABLE_LABEL,
  getRegistrationCourseLabel,
  hasCatalogueCourse,
};
