import { createContext, useContext, useState } from "react";

const CourseProgressContext = createContext();

export const CourseProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState({});

  const markLessonComplete = (courseId, lessonId) => {
    setProgress((prev) => {
      const courseProgress = prev[courseId] || { completed: [], percent: 0, totalLessons: 0 };
      const updatedCompleted = [...new Set([...courseProgress.completed, lessonId])];
      const percent = Math.round((updatedCompleted.length / courseProgress.totalLessons) * 100);
      return {
        ...prev,
        [courseId]: { ...courseProgress, completed: updatedCompleted, percent },
      };
    });
  };

  return (
    <CourseProgressContext.Provider value={{ progress, markLessonComplete }}>
      {children}
    </CourseProgressContext.Provider>
  );
};

export const useCourseProgress = () => useContext(CourseProgressContext);
