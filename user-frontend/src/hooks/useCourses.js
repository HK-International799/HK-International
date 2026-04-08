import { useState, useEffect, useCallback } from "react";
import { getEnrolledCourses, getCourseProgress } from "../services/studentService";

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEnrolledCourses();
      setCourses(data || []);
      setError(null);
    } catch (err) {
      setError(err?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
}
