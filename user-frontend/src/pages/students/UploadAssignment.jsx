import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  File,
  Image,
  ChevronDown,
  Send,
  Paperclip,
  Eye,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import {
  getStudentAssignments,
  submitAssignment,
  getMySubmissionForAssignment,
  uploadDocument,
} from "../../services/studentService";

export default function UploadAssignment() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [checkingSubmission, setCheckingSubmission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("assignment");

  // Assignment form
  const [answers, setAnswers] = useState([]);

  // Document upload form
  const [docForm, setDocForm] = useState({
    title: "",
    type: "assignment",
    courseId: "",
    file: null,
  });

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await getStudentAssignments();
        setAssignments(Array.isArray(data) ? data : []);
      } catch {
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (!selectedAssignment) {
      setExistingSubmission(null);
      setAnswers([]);
      return;
    }
    const checkSubmission = async () => {
      setCheckingSubmission(true);
      try {
        const sub = await getMySubmissionForAssignment(selectedAssignment._id);
        setExistingSubmission(sub);
      } catch {
        setExistingSubmission(null);
      } finally {
        setCheckingSubmission(false);
      }
    };
    checkSubmission();

    // Init answers from questions
    if (selectedAssignment.questions?.length > 0) {
      setAnswers(
        selectedAssignment.questions.map((q) => ({
          questionId: q._id,
          textAnswer: "",
          selectedOption: "",
        }))
      );
    } else {
      setAnswers([]);
    }
  }, [selectedAssignment]);

  const handleAnswerChange = (idx, field, value) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;
    setError("");
    setSubmitting(true);
    try {
      await submitAssignment({
        assignmentId: selectedAssignment._id,
        answers,
      });
      setSuccess(true);
      setSelectedAssignment(null);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocUpload = async () => {
    if (!docForm.title.trim()) return setError("Please enter a document title");
    setError("");
    setSubmitting(true);
    try {
      await uploadDocument({
        title: docForm.title.trim(),
        type: docForm.type,
        courseId: docForm.courseId || undefined,
        fileUrl: docForm.file?.name || "",
      });
      setSuccess(true);
      setDocForm({ title: "", type: "assignment", courseId: "", file: null });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload document");
    } finally {
      setSubmitting(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setDocForm((prev) => ({ ...prev, file: acceptedFiles[0] }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  const pendingAssignments = assignments.filter(
    (a) => a.submissionStatus === "not_submitted"
  );
  const submittedAssignments = assignments.filter(
    (a) => a.submissionStatus !== "not_submitted"
  );

  return (
    <MainLayout>
      <div className="pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Upload className="w-6 h-6 text-orange-500" />
            Submit work
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Submit assignments and upload documents
          </p>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm"
            >
              <CheckCircle2 className="w-5 h-5" />
              <p className="font-semibold">Submitted successfully!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 max-w-sm">
          {[
            { key: "assignment", label: "Assignments", icon: FileText },
            { key: "document", label: "Upload document", icon: Upload },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === "assignment" && (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Assignment List */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Pending ({pendingAssignments.length})
                </h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                  </div>
                ) : pendingAssignments.length === 0 ? (
                  <p className="text-xs text-gray-400 bg-white rounded-xl p-4 border border-gray-100">
                    All assignments submitted. Great work!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingAssignments.map((a) => (
                      <button
                        key={a._id}
                        onClick={() => setSelectedAssignment(a)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          selectedAssignment?._id === a._id
                            ? "border-orange-300 bg-orange-50 ring-1 ring-orange-100"
                            : "border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"
                        }`}
                      >
                        <p className="font-semibold text-sm text-gray-900 truncate">{a.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                          <span>{a.courseId?.title || "—"}</span>
                          {a.totalMarks && <span>{a.totalMarks} marks</span>}
                          {a.dueDate && (
                            <span className={
                              new Date(a.dueDate) < new Date()
                                ? "text-red-500 font-medium"
                                : ""
                            }>
                              Due {new Date(a.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {submittedAssignments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Submitted ({submittedAssignments.length})
                  </h3>
                  <div className="space-y-2">
                    {submittedAssignments.slice(0, 5).map((a) => (
                      <div
                        key={a._id}
                        className="p-4 rounded-xl border border-gray-100 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm text-gray-700 truncate">{a.title}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            a.submissionStatus === "graded"
                              ? "bg-green-50 text-green-600"
                              : "bg-blue-50 text-blue-600"
                          }`}>
                            {a.submissionStatus === "graded" ? `${a.totalScore ?? "—"} pts` : "Pending"}
                          </span>
                        </div>
                        {a.feedback && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{a.feedback}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submission Form */}
            <div className="lg:col-span-3">
              {selectedAssignment ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">{selectedAssignment.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{selectedAssignment.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span>{selectedAssignment.courseId?.title}</span>
                      {selectedAssignment.totalMarks && (
                        <span>Total: {selectedAssignment.totalMarks} marks</span>
                      )}
                    </div>
                  </div>

                  {checkingSubmission ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                    </div>
                  ) : existingSubmission ? (
                    <div className="p-5 text-center">
                      <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                      <p className="font-semibold text-gray-800">Already submitted</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Status: <span className="font-medium capitalize">{existingSubmission.status}</span>
                        {existingSubmission.totalScore != null && ` • Score: ${existingSubmission.totalScore}`}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Questions */}
                      {selectedAssignment.questions?.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                          {selectedAssignment.questions.map((q, qi) => (
                            <div key={q._id || qi} className="p-5">
                              <div className="flex items-start gap-3 mb-3">
                                <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {qi + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {q.questionText || q.text}
                                  </p>
                                  {q.marks && (
                                    <span className="text-xs text-gray-400">{q.marks} marks</span>
                                  )}
                                </div>
                              </div>

                              {q.type === "mcq" && q.options?.length > 0 ? (
                                <div className="ml-10 space-y-2">
                                  {q.options.map((opt, oi) => (
                                    <label
                                      key={oi}
                                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition ${
                                        answers[qi]?.selectedOption === opt
                                          ? "border-orange-300 bg-orange-50"
                                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`q-${qi}`}
                                        checked={answers[qi]?.selectedOption === opt}
                                        onChange={() => handleAnswerChange(qi, "selectedOption", opt)}
                                        className="sr-only"
                                      />
                                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        answers[qi]?.selectedOption === opt
                                          ? "border-orange-500"
                                          : "border-gray-300"
                                      }`}>
                                        {answers[qi]?.selectedOption === opt && (
                                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                                        )}
                                      </span>
                                      <span className="text-sm text-gray-700">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <div className="ml-10">
                                  <textarea
                                    value={answers[qi]?.textAnswer || ""}
                                    onChange={(e) => handleAnswerChange(qi, "textAnswer", e.target.value)}
                                    placeholder="Type your answer..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-5 text-center text-sm text-gray-400">
                          This assignment has no questions. Submit to confirm completion.
                        </div>
                      )}

                      {error && (
                        <div className="px-5">
                          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                        </div>
                      )}

                      <div className="p-5 border-t border-gray-100">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={handleSubmitAssignment}
                          disabled={submitting}
                          className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60 shadow-sm"
                        >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          {submitting ? "Submitting..." : "Submit assignment"}
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Select an assignment</h3>
                  <p className="text-sm text-gray-400 mt-1 max-w-xs">
                    Choose a pending assignment from the left to view questions and submit your answers.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document Upload Tab */}
        {activeTab === "document" && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Upload a document</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Upload assignment files, project reports, or any documents for review
                </p>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Title</label>
                  <input
                    type="text"
                    value={docForm.title}
                    onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                    placeholder="e.g. Assignment 1 - Python Basics"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Type</label>
                  <select
                    value={docForm.type}
                    onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition appearance-none"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="project">Project report</option>
                    <option value="certificate">Certificate</option>
                    <option value="identity">Identity document</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Dropzone */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">File</label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                      isDragActive
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/30"
                    }`}
                  >
                    <input {...getInputProps()} />
                    {docForm.file ? (
                      <div className="flex items-center justify-center gap-3">
                        <File className="w-8 h-8 text-orange-500" />
                        <div className="text-left">
                          <p className="text-sm font-semibold text-gray-800">{docForm.file.name}</p>
                          <p className="text-xs text-gray-400">
                            {(docForm.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDocForm({ ...docForm, file: null }); }}
                          className="p-1 rounded-lg hover:bg-red-50 text-red-400 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">
                          {isDragActive ? "Drop your file here" : "Drag & drop or click to browse"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, PNG, JPG (max 10MB)</p>
                      </>
                    )}
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDocUpload}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60 shadow-sm"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {submitting ? "Uploading..." : "Upload document"}
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
