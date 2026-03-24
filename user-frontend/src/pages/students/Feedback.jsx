import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Star,
  Send,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import { createFeedback } from "../../services/studentService";
import { getStudentCourses } from "../../services/studentService";

export default function Feedback() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    type: "course",
    courseId: "",
    rating: 0,
    subject: "",
    message: "",
  });

  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getStudentCourses();
        setCourses(Array.isArray(data) ? data : []);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.subject.trim()) return setError("Please enter a subject");
    if (!form.message.trim()) return setError("Please enter your feedback");
    if (form.type === "course" && !form.courseId) return setError("Please select a course");

    setSubmitting(true);
    try {
      await createFeedback({
        type: form.type,
        courseId: form.courseId || undefined,
        rating: form.rating || undefined,
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSuccess(true);
      setForm({ type: "course", courseId: "", rating: 0, subject: "", message: "" });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const feedbackTypes = [
    { value: "course", label: "Course feedback", desc: "Rate and review a course" },
    { value: "tutor", label: "Tutor feedback", desc: "Share experience with a tutor" },
    { value: "platform", label: "Platform feedback", desc: "Suggest improvements" },
    { value: "bug", label: "Report a bug", desc: "Report technical issues" },
    { value: "other", label: "Other", desc: "General feedback" },
  ];

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-orange-500" />
            Feedback
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Your feedback helps us improve the learning experience
          </p>
        </div>

        {/* Success Banner */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Feedback submitted successfully!</p>
                <p className="text-xs text-green-600 mt-0.5">Thank you for helping us improve.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Type Selection */}
            <div className="p-5 border-b border-gray-100">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                Feedback type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {feedbackTypes.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm({ ...form, type: t.value })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.type === t.value
                        ? "border-orange-400 bg-orange-50 ring-1 ring-orange-200"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${form.type === t.value ? "text-orange-700" : "text-gray-800"}`}>
                      {t.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Course Selector */}
            {(form.type === "course" || form.type === "tutor") && (
              <div className="p-5 border-b border-gray-100">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Select course
                </label>
                <div className="relative">
                  <select
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    className="w-full appearance-none px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
                  >
                    <option value="">Choose a course...</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="p-5 border-b border-gray-100">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Rating <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setForm({ ...form, rating: star === form.rating ? 0 : star })}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (hoveredStar || form.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }`}
                    />
                  </button>
                ))}
                {form.rating > 0 && (
                  <span className="text-sm text-gray-500 ml-2">
                    {["", "Poor", "Fair", "Good", "Very good", "Excellent"][form.rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="p-5 border-b border-gray-100">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Subject
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief summary of your feedback..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
                maxLength={120}
              />
            </div>

            {/* Message */}
            <div className="p-5 border-b border-gray-100">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Your feedback
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Share your detailed thoughts, suggestions, or concerns..."
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition leading-relaxed"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {form.message.length}/1000
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="px-5 pt-3">
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="p-5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? "Submitting..." : "Submit feedback"}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
