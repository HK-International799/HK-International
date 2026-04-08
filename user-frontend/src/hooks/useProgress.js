import { useState, useEffect, useCallback } from "react";
import { getCourseProgress, getAllProgress, completeLesson } from "../services/studentService";

export function useCourseProgress(courseId) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const data = await getCourseProgress(courseId);
      setProgress(data);
      setError(null);
    } catch (err) {
      setError(err?.message || "Failed to load progress");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const markComplete = async (lessonId) => {
    try {
      const updated = await completeLesson(courseId, lessonId);
      setProgress(updated);
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return { progress, loading, error, markComplete, refetch: fetchProgress };
}

export function useAllProgress() {
  const [allProgress, setAllProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProgress()
      .then((data) => setAllProgress(data || []))
      .catch(() => setAllProgress([]))
      .finally(() => setLoading(false));
  }, []);

  return { allProgress, loading };
}
