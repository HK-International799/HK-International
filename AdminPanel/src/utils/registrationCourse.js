/**
 * Display helpers for a Registration's course.
 *
 * A registration may point at a catalogue course, carry an OTHERS course
 * the learner typed in (not in the catalogue), or reference a course that
 * has since been deleted. These helpers make sure every screen shows a
 * meaningful label instead of a blank, "undefined" or "null".
 * Mirrors server/src/utils/registrationCourse.js.
 */
export const OTHER_COURSE_FILTER = "others";
export const NO_COURSE_FILTER = "none";
export const COURSE_UNAVAILABLE_LABEL = "Course unavailable";

export const getRegistrationCourseLabel = (reg, { withOthersPrefix = true } = {}) => {
  if (!reg) return COURSE_UNAVAILABLE_LABEL;
  if (reg.course && typeof reg.course === "object" && reg.course.title) {
    return reg.course.title;
  }
  if (reg.isOtherCourse && reg.otherCourseName) {
    return withOthersPrefix ? `OTHERS — ${reg.otherCourseName}` : reg.otherCourseName;
  }
  return reg.courseLabel || COURSE_UNAVAILABLE_LABEL;
};

/** "catalogue" | "others" | "unavailable" */
export const getRegistrationCourseType = (reg) => {
  if (reg?.course && typeof reg.course === "object" && reg.course.title) return "catalogue";
  if (reg?.isOtherCourse) return "others";
  return "unavailable";
};
