


// import { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import AdminLayout from "../../components/layout/AdminLayout";
// import {
//   PageHeader,
//   DataTable,
//   Badge,
//   Button,
//   Modal,
//   Input,
//   Select,
//   Textarea,
//   EmptyState,
// } from "../../components/ui";
// import {
//   getAllAssignments,
//   createAssignment,
//   updateAssignment,
//   deleteAssignment,
//   togglePublish,
// } from "../../services/assignmentService";
// import { getCourses } from "../../services/courseService";
// import {
//   Plus,
//   ClipboardList,
//   Trash2,
//   Edit2,
//   Eye,
//   Search,
//   BookOpen,
//   Upload,
//   X,
//   FilePlus,
//   AlertTriangle,
//   CheckCircle,
//   Clock,
//   Users,
//   ChevronDown,
//   ChevronUp,
//   FileText,
// } from "lucide-react";

// const emptyForm = {
//   title: "",
//   description: "",
//   courseId: "",
//   dueDate: "",
//   totalMarks: "",
//   isPublished: false,
//   // ✅ Module 1 — Assessment Creation fields (additive)
//   assessmentType: "general",
//   instructions: "",
//   passingMarks: "",
//   maxAttempts: 1,
//   allowResubmission: true,
//   maxResubmissions: 3,
//   requireAdminApproval: false,
//   showCorrectAnswers: false,
//   gradingPrompt: "",
//   answerKey: "",
//   useAnswerKeyForGrading: false,
//   aiGradingEnabled: false,
// };

// const emptyQuestion = {
//   type: "short_answer",
//   prompt: "",
//   marks: 5,
//   options: [],
//   correctAnswer: "",
//   correctAnswers: [],
//   rubric: "",
// };

// export default function Assignments() {
//   const navigate = useNavigate();
//   const fileRef = useRef(null);

//   const [assignments, setAssignments] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState("all");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const [showCreate, setShowCreate] = useState(false);
//   const [editTarget, setEditTarget] = useState(null);
//   const [showDetail, setShowDetail] = useState(null);

//   const [form, setForm] = useState(emptyForm);
//   const [questions, setQuestions] = useState([]);
//   const [file, setFile] = useState(null); // File object for upload

//   useEffect(() => {
//     load();
//   }, []);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const [a, c] = await Promise.all([getAllAssignments(), getCourses()]);
//       // FIX: assignmentService returns res.data.data = { assignments, total, ... }
//       setAssignments(a?.assignments || []);
//       // FIX: courseService returns the raw envelope; getCourses controller returns an array directly
//       setCourses(Array.isArray(c) ? c : c?.courses || []);
//     } catch (err) {
//       setError("Failed to load assignments");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── form helpers ───────────────────────────────────────────────────────────

//   const openCreate = () => {
//     setForm(emptyForm);
//     setQuestions([]);
//     setFile(null);
//     setEditTarget(null);
//     setError("");
//     setShowCreate(true);
//   };

//   const openEdit = (a) => {
//     setForm({
//       title: a.title || "",
//       description: a.description || "",
//       courseId: a.courseId?._id || a.courseId || "",
//       dueDate: a.dueDate ? a.dueDate.slice(0, 10) : "",
//       totalMarks: a.totalMarks ?? "",
//       isPublished: a.isPublished || false,
//       assessmentType: a.assessmentType || "general",
//       instructions: a.instructions || "",
//       passingMarks: a.passingMarks ?? "",
//       maxAttempts: a.maxAttempts ?? 1,
//       allowResubmission: a.allowResubmission ?? true,
//       maxResubmissions: a.maxResubmissions ?? 3,
//       requireAdminApproval: a.requireAdminApproval || false,
//       showCorrectAnswers: a.showCorrectAnswers || false,
//       gradingPrompt: a.gradingPrompt || "",
//       answerKey: a.answerKey || "",
//       useAnswerKeyForGrading: a.useAnswerKeyForGrading || false,
//       aiGradingEnabled: a.aiGradingEnabled || false,
//     });
//     setQuestions(
//       (a.questions || []).map((q) => ({
//         type: q.type || "text",
//         prompt: q.prompt || "",
//         marks: q.marks ?? 5,
//         options: q.options || [],
//         correctAnswer: q.correctAnswer || "",
//         correctAnswers: q.correctAnswers || [],
//         rubric: q.rubric || "",
//       })),
//     );
//     setFile(null);
//     setEditTarget(a);
//     setShowCreate(true);
//     setError("");
//   };

//   const closeModal = () => {
//     setShowCreate(false);
//     setEditTarget(null);
//     setFile(null);
//     setQuestions([]);
//     setError("");
//   };

//   // ── Question helpers ───────────────────────────────────────────────────────

//   const addQuestion = () =>
//     setQuestions((prev) => [...prev, { ...emptyQuestion }]);

//   const removeQuestion = (i) =>
//     setQuestions((prev) => prev.filter((_, idx) => idx !== i));

//   const updateQuestion = (i, field, value) =>
//     setQuestions((prev) => {
//       const copy = [...prev];
//       copy[i] = { ...copy[i], [field]: value };
//       return copy;
//     });

//   const addOption = (i) =>
//     setQuestions((prev) => {
//       const copy = [...prev];
//       copy[i] = { ...copy[i], options: [...(copy[i].options || []), ""] };
//       return copy;
//     });

//   const updateOption = (qi, oi, val) =>
//     setQuestions((prev) => {
//       const copy = [...prev];
//       const opts = [...copy[qi].options];
//       opts[oi] = val;
//       copy[qi] = { ...copy[qi], options: opts };
//       return copy;
//     });

//   const removeOption = (qi, oi) =>
//     setQuestions((prev) => {
//       const copy = [...prev];
//       copy[qi] = {
//         ...copy[qi],
//         options: copy[qi].options.filter((_, idx) => idx !== oi),
//       };
//       return copy;
//     });

//   // ── save ───────────────────────────────────────────────────────────────────

//   const handleSave = async () => {
//     setError("");
//     if (!form.title.trim()) return setError("Title is required");
//     if (!form.courseId) return setError("Please select a course");

//     setSaving(true);
//     try {
//       const fd = new FormData();
//       fd.append("title", form.title.trim());
//       fd.append("description", form.description.trim());
//       fd.append("courseId", form.courseId);
//       if (form.dueDate) fd.append("dueDate", form.dueDate);
//       if (form.totalMarks !== "") fd.append("totalMarks", form.totalMarks);
//       fd.append("isPublished", form.isPublished);
//       if (questions.length > 0)
//         fd.append("questions", JSON.stringify(questions));
//       if (file) fd.append("file", file);

//       // ✅ Module 1 — Assessment Creation fields
//       fd.append("assessmentType", form.assessmentType || "general");
//       fd.append("instructions", form.instructions || "");
//       if (form.passingMarks !== "") fd.append("passingMarks", form.passingMarks);
//       fd.append("maxAttempts", form.maxAttempts || 1);
//       fd.append("allowResubmission", form.allowResubmission);
//       fd.append("maxResubmissions", form.maxResubmissions ?? 3);
//       fd.append("requireAdminApproval", form.requireAdminApproval);
//       fd.append("showCorrectAnswers", form.showCorrectAnswers);
//       fd.append("gradingPrompt", form.gradingPrompt || "");
//       fd.append("answerKey", form.answerKey || "");
//       fd.append("useAnswerKeyForGrading", form.useAnswerKeyForGrading);
//       fd.append("aiGradingEnabled", form.aiGradingEnabled);

//       if (editTarget) {
//         await updateAssignment(editTarget._id, fd);
//       } else {
//         await createAssignment(fd);
//       }

//       closeModal();
//       load();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to save assignment");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete this assignment and all its submissions?")) return;
//     try {
//       await deleteAssignment(id);
//       load();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to delete");
//     }
//   };

//   const handleTogglePublish = async (a) => {
//     try {
//       await togglePublish(a._id);
//       load();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to update status");
//     }
//   };

//   // ── filter ─────────────────────────────────────────────────────────────────

//   const filtered = assignments.filter((a) => {
//     const matchSearch = a.title?.toLowerCase().includes(search.toLowerCase());
//     const matchCourse =
//       selectedCourse === "all" ||
//       (a.courseId?._id || a.courseId) === selectedCourse;
//     return matchSearch && matchCourse;
//   });

//   const isOverdue = (a) => a.dueDate && new Date() > new Date(a.dueDate);

//   // ── table columns ──────────────────────────────────────────────────────────

//   const columns = [
//     {
//       key: "title",
//       label: "Assignment",
//       render: (r) => (
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
//             <ClipboardList size={18} className="text-indigo-600" />
//           </div>
//           <div>
//             <p className="font-medium text-gray-800">{r.title}</p>
//             <p className="text-xs text-gray-400">
//               {r.courseId?.title || "No course"}
//             </p>
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: "marks",
//       label: "Marks",
//       render: (r) => <span className="font-medium">{r.totalMarks ?? "—"}</span>,
//     },
//     {
//       key: "questions",
//       label: "Questions",
//       render: (r) => r.questions?.length || 0,
//     },
//     {
//       key: "dueDate",
//       label: "Due Date",
//       render: (r) => {
//         if (!r.dueDate) return "—";
//         return (
//           <span
//             className={
//               isOverdue(r)
//                 ? "text-red-500 font-medium flex items-center gap-1"
//                 : ""
//             }
//           >
//             {isOverdue(r) && <AlertTriangle size={12} />}
//             {new Date(r.dueDate).toLocaleDateString()}
//           </span>
//         );
//       },
//     },
//     {
//       key: "status",
//       label: "Status",
//       render: (r) => (
//         <div className="flex items-center gap-2">
//           <Badge variant={r.isPublished ? "success" : "warning"}>
//             {r.isPublished ? "Published" : "Draft"}
//           </Badge>
//           {isOverdue(r) && <Badge variant="danger">Overdue</Badge>}
//           {r.file?.url && (
//             <FileText size={14} className="text-gray-400" title="Has file" />
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "actions",
//       label: "",
//       render: (r) => (
//         <div className="flex gap-1">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setShowDetail(r);
//             }}
//             className="p-2 rounded-lg hover:bg-indigo-50"
//             title="View"
//           >
//             <Eye size={15} className="text-indigo-600" />
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               navigate(`/admin/assignments/${r._id}/submissions`);
//             }}
//             className="p-2 rounded-lg hover:bg-blue-50"
//             title="Submissions"
//           >
//             <Users size={15} className="text-blue-500" />
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               handleTogglePublish(r);
//             }}
//             className="p-2 rounded-lg hover:bg-emerald-50"
//             title={r.isPublished ? "Unpublish" : "Publish"}
//           >
//             {r.isPublished ? (
//               <Clock size={15} className="text-orange-500" />
//             ) : (
//               <CheckCircle size={15} className="text-emerald-500" />
//             )}
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               openEdit(r);
//             }}
//             className="p-2 rounded-lg hover:bg-orange-50"
//             title="Edit"
//           >
//             <Edit2 size={15} className="text-orange-500" />
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               handleDelete(r._id);
//             }}
//             className="p-2 rounded-lg hover:bg-red-50"
//             title="Delete"
//           >
//             <Trash2 size={15} className="text-red-500" />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   // ── render ─────────────────────────────────────────────────────────────────

//   return (
//     <AdminLayout>
//       <div className="animate-fadeIn">
//         <PageHeader
//           title="Assignments"
//           subtitle={`${assignments.length} total assignments`}
//           actions={
//             <Button onClick={openCreate}>
//               <Plus size={16} />
//               Create Assignment
//             </Button>
//           }
//         />

//         {error && !showCreate && (
//           <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
//             <AlertTriangle size={16} />
//             {error}
//             <button className="ml-auto" onClick={() => setError("")}>
//               <X size={14} />
//             </button>
//           </div>
//         )}

//         {/* Course filter cards */}
//         <div className="grid md:grid-cols-5 gap-3 mb-6 overflow-x-auto">
//           <div
//             onClick={() => setSelectedCourse("all")}
//             className={`p-4 rounded-2xl border cursor-pointer transition flex-shrink-0 ${
//               selectedCourse === "all"
//                 ? "border-indigo-500 bg-indigo-50"
//                 : "border-gray-100 bg-white"
//             }`}
//           >
//             <p className="font-medium text-sm">All Courses</p>
//             <p className="text-xs text-gray-400">
//               {assignments.length} assignments
//             </p>
//           </div>
//           {courses.slice(0, 8).map((c) => (
//             <div
//               key={c._id}
//               onClick={() => setSelectedCourse(c._id)}
//               className={`p-4 rounded-2xl border cursor-pointer transition flex-shrink-0 ${
//                 selectedCourse === c._id
//                   ? "border-orange-500 bg-orange-50"
//                   : "border-gray-100 bg-white"
//               }`}
//             >
//               <div className="flex items-center gap-2">
//                 <BookOpen size={14} className="text-orange-500 flex-shrink-0" />
//                 <p className="font-medium text-sm truncate">{c.title}</p>
//               </div>
//               <p className="text-xs text-gray-400">
//                 {
//                   assignments.filter(
//                     (a) => (a.courseId?._id || a.courseId) === c._id,
//                   ).length
//                 }{" "}
//                 assignments
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* Search */}
//         <div className="mb-4 relative max-w-sm">
//           <Search
//             size={16}
//             className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//           />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search assignments..."
//             className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
//           />
//         </div>

//         {loading ? (
//           <EmptyState title="Loading assignments..." />
//         ) : (
//           <DataTable
//             columns={columns}
//             data={filtered}
//             emptyMessage="No assignments found"
//           />
//         )}

//         {/* ── Create / Edit Modal ───────────────────────────────────────── */}
//         <Modal
//           open={showCreate}
//           onClose={closeModal}
//           title={editTarget ? "Edit Assignment" : "Create Assignment"}
//           size="xl"
//         >
//           <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
//             {error && (
//               <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2.5 rounded-xl text-sm border border-red-200">
//                 <AlertTriangle size={14} />
//                 {error}
//               </div>
//             )}

//             {/* Basic info */}
//             <div className="grid md:grid-cols-2 gap-4">
//               <Input
//                 label="Title *"
//                 value={form.title}
//                 onChange={(e) => setForm({ ...form, title: e.target.value })}
//                 className="md:col-span-2"
//                 placeholder="e.g. Week 3 Assignment"
//               />
//               <Select
//                 label="Course *"
//                 value={form.courseId}
//                 onChange={(e) => setForm({ ...form, courseId: e.target.value })}
//                 options={[
//                   { value: "", label: "Select course" },
//                   ...courses.map((c) => ({ value: c._id, label: c.title })),
//                 ]}
//               />
//               <Input
//                 label="Total Marks"
//                 type="number"
//                 min={0}
//                 value={form.totalMarks}
//                 onChange={(e) =>
//                   setForm({ ...form, totalMarks: e.target.value })
//                 }
//                 placeholder="Auto-calculated from questions"
//               />
//               <Input
//                 label="Due Date"
//                 type="datetime-local"
//                 value={form.dueDate}
//                 onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
//               />
//               <Select
//                 label="Status"
//                 value={String(form.isPublished)}
//                 onChange={(e) =>
//                   setForm({ ...form, isPublished: e.target.value === "true" })
//                 }
//                 options={[
//                   { value: "false", label: "Draft" },
//                   { value: "true", label: "Published" },
//                 ]}
//               />
//               <Textarea
//                 label="Description"
//                 value={form.description}
//                 onChange={(e) =>
//                   setForm({ ...form, description: e.target.value })
//                 }
//                 className="md:col-span-2"
//                 rows={3}
//               />
//             </div>

//             {/* ✅ Module 1 — Assessment configuration */}
//             <div className="border-t border-gray-100 pt-4">
//               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
//                 Assessment Settings
//               </p>
//               <div className="grid md:grid-cols-2 gap-4">
//                 <Select
//                   label="Assessment Type"
//                   value={form.assessmentType}
//                   onChange={(e) => setForm({ ...form, assessmentType: e.target.value })}
//                   options={[
//                     { value: "general", label: "General" },
//                     { value: "mcq_exam", label: "MCQ Exam (auto-graded)" },
//                     { value: "written_assessment", label: "Written Assessment" },
//                     { value: "project_submission", label: "Project Submission" },
//                   ]}
//                 />
//                 <Input
//                   label="Passing Marks"
//                   type="number"
//                   min={0}
//                   value={form.passingMarks}
//                   onChange={(e) => setForm({ ...form, passingMarks: e.target.value })}
//                   placeholder="e.g. 40"
//                 />
//                 <Input
//                   label="Max Attempts"
//                   type="number"
//                   min={1}
//                   value={form.maxAttempts}
//                   onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })}
//                 />
//                 <Input
//                   label="Max Resubmissions"
//                   type="number"
//                   min={0}
//                   value={form.maxResubmissions}
//                   onChange={(e) => setForm({ ...form, maxResubmissions: e.target.value })}
//                 />
//                 <Textarea
//                   label="Instructions for Students"
//                   value={form.instructions}
//                   onChange={(e) => setForm({ ...form, instructions: e.target.value })}
//                   className="md:col-span-2"
//                   rows={2}
//                 />
//               </div>

//               <div className="flex flex-wrap gap-5 mt-4">
//                 <label className="flex items-center gap-2 text-sm text-gray-700">
//                   <input
//                     type="checkbox"
//                     checked={form.allowResubmission}
//                     onChange={(e) => setForm({ ...form, allowResubmission: e.target.checked })}
//                   />
//                   Allow resubmission
//                 </label>
//                 <label className="flex items-center gap-2 text-sm text-gray-700">
//                   <input
//                     type="checkbox"
//                     checked={form.requireAdminApproval}
//                     onChange={(e) => setForm({ ...form, requireAdminApproval: e.target.checked })}
//                   />
//                   Require admin approval before completion
//                 </label>
//                 <label className="flex items-center gap-2 text-sm text-gray-700">
//                   <input
//                     type="checkbox"
//                     checked={form.showCorrectAnswers}
//                     onChange={(e) => setForm({ ...form, showCorrectAnswers: e.target.checked })}
//                   />
//                   Show correct answers after grading
//                 </label>
//               </div>
//             </div>

//             {/* ✅ Module 5 — AI grading configuration (written_assessment / project_submission) */}
//             {["written_assessment", "project_submission"].includes(form.assessmentType) && (
//               <div className="border-t border-gray-100 pt-4">
//                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
//                   AI Grading
//                 </p>
//                 <label className="flex items-center gap-2 text-sm text-gray-700 mb-3">
//                   <input
//                     type="checkbox"
//                     checked={form.aiGradingEnabled}
//                     onChange={(e) => setForm({ ...form, aiGradingEnabled: e.target.checked })}
//                   />
//                   Enable AI grading for this assessment
//                 </label>
//                 {form.aiGradingEnabled && (
//                   <div className="space-y-3">
//                     <Textarea
//                       label="Grading Prompt (instructions for the AI grader)"
//                       value={form.gradingPrompt}
//                       onChange={(e) => setForm({ ...form, gradingPrompt: e.target.value })}
//                       rows={2}
//                     />
//                     <label className="flex items-center gap-2 text-sm text-gray-700">
//                       <input
//                         type="checkbox"
//                         checked={form.useAnswerKeyForGrading}
//                         onChange={(e) =>
//                           setForm({ ...form, useAnswerKeyForGrading: e.target.checked })
//                         }
//                       />
//                       Use the answer key below as the authoritative reference
//                     </label>
//                     <Textarea
//                       label="Answer Key / Model Solution"
//                       value={form.answerKey}
//                       onChange={(e) => setForm({ ...form, answerKey: e.target.value })}
//                       rows={3}
//                     />
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* File upload */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                 Assignment File (.docx / .pdf)
//               </label>
//               <div
//                 className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition"
//                 onClick={() => fileRef.current?.click()}
//               >
//                 <div className="p-3 bg-indigo-50 rounded-xl">
//                   <Upload size={20} className="text-indigo-600" />
//                 </div>
//                 {file ? (
//                   <div className="flex-1 flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-800">
//                         {file.name}
//                       </p>
//                       <p className="text-xs text-gray-400">
//                         {(file.size / 1024 / 1024).toFixed(2)} MB
//                       </p>
//                     </div>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setFile(null);
//                       }}
//                       className="p-1.5 hover:bg-red-50 rounded-lg"
//                     >
//                       <X size={14} className="text-red-400" />
//                     </button>
//                   </div>
//                 ) : editTarget?.file?.url ? (
//                   <div className="flex-1 flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600">
//                         Current:{" "}
//                         {editTarget.file.originalName || "Uploaded file"}
//                       </p>
//                       <p className="text-xs text-gray-400">Click to replace</p>
//                     </div>
//                     <a
//                       href={editTarget.file.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       onClick={(e) => e.stopPropagation()}
//                       className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
//                     >
//                       <Eye size={12} /> View
//                     </a>
//                   </div>
//                 ) : (
//                   <p className="text-sm text-gray-400">
//                     Click to upload .docx or .pdf (max 100 MB)
//                   </p>
//                 )}
//                 <input
//                   ref={fileRef}
//                   type="file"
//                   accept=".docx,.doc,.pdf"
//                   className="hidden"
//                   onChange={(e) => setFile(e.target.files[0] || null)}
//                 />
//               </div>
//             </div>

//             {/* Questions */}
//             <div>
//               <div className="flex items-center justify-between mb-3">
//                 <h4 className="text-sm font-semibold text-gray-800">
//                   Questions ({questions.length})
//                 </h4>
//                 <button
//                   onClick={addQuestion}
//                   className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
//                 >
//                   <FilePlus size={13} /> Add Question
//                 </button>
//               </div>

//               {questions.length === 0 && (
//                 <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
//                   No questions added. You can also upload a .docx file with
//                   questions instead.
//                 </p>
//               )}

//               <div className="space-y-4">
//                 {questions.map((q, i) => (
//                   <div
//                     key={i}
//                     className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3"
//                   >
//                     <div className="flex items-center gap-2">
//                       <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
//                         {i + 1}
//                       </span>
//                       <Select
//                         value={q.type}
//                         onChange={(e) =>
//                           updateQuestion(i, "type", e.target.value)
//                         }
//                         options={[
//                           { value: "short_answer", label: "Short answer" },
//                           { value: "long_answer", label: "Long answer" },
//                           { value: "single_choice", label: "Single choice (MCQ)" },
//                           { value: "multiple_choice", label: "Multiple choice" },
//                           { value: "true_false", label: "True / False" },
//                           { value: "file_upload", label: "File upload" },
//                           // legacy values kept selectable so existing
//                           // assignments edited in-place still render correctly
//                           { value: "text", label: "Text answer (legacy)" },
//                           { value: "mcq", label: "Multiple choice (legacy)" },
//                           { value: "file", label: "File upload (legacy)" },
//                         ]}
//                         className="flex-shrink-0 w-48"
//                       />
//                       <Input
//                         type="number"
//                         min={0}
//                         value={q.marks}
//                         onChange={(e) =>
//                           updateQuestion(i, "marks", Number(e.target.value))
//                         }
//                         placeholder="Marks"
//                         className="w-24 flex-shrink-0"
//                       />
//                       <button
//                         onClick={() => removeQuestion(i)}
//                         className="ml-auto p-1.5 hover:bg-red-50 rounded-lg"
//                       >
//                         <X size={14} className="text-red-400" />
//                       </button>
//                     </div>

//                     <Input
//                       value={q.prompt}
//                       onChange={(e) =>
//                         updateQuestion(i, "prompt", e.target.value)
//                       }
//                       placeholder="Question prompt..."
//                     />

//                     {["mcq", "single_choice", "multiple_choice", "true_false"].includes(q.type) && (
//                       <div className="space-y-2 ml-2">
//                         {/* True/False — fixed options, no editing needed */}
//                         {q.type === "true_false" ? (
//                           <div className="flex gap-4">
//                             {["True", "False"].map((opt) => (
//                               <label key={opt} className="flex items-center gap-1.5 text-sm text-gray-700">
//                                 <input
//                                   type="radio"
//                                   name={`correct-${i}`}
//                                   checked={q.correctAnswer === opt}
//                                   onChange={() => updateQuestion(i, "correctAnswer", opt)}
//                                 />
//                                 {opt}
//                               </label>
//                             ))}
//                           </div>
//                         ) : (
//                           <>
//                             {(q.options || []).map((opt, oi) => (
//                               <div key={oi} className="flex items-center gap-2">
//                                 {q.type === "multiple_choice" ? (
//                                   <input
//                                     type="checkbox"
//                                     checked={(q.correctAnswers || []).includes(opt)}
//                                     onChange={(e) => {
//                                       const current = q.correctAnswers || [];
//                                       const next = e.target.checked
//                                         ? [...current, opt]
//                                         : current.filter((c) => c !== opt);
//                                       updateQuestion(i, "correctAnswers", next);
//                                     }}
//                                   />
//                                 ) : (
//                                   <input
//                                     type="radio"
//                                     name={`correct-${i}`}
//                                     checked={q.correctAnswer === opt}
//                                     onChange={() => updateQuestion(i, "correctAnswer", opt)}
//                                   />
//                                 )}
//                                 <input
//                                   value={opt}
//                                   onChange={(e) =>
//                                     updateOption(i, oi, e.target.value)
//                                   }
//                                   placeholder={`Option ${oi + 1}`}
//                                   className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
//                                 />
//                                 <button onClick={() => removeOption(i, oi)}>
//                                   <X
//                                     size={13}
//                                     className="text-gray-400 hover:text-red-400"
//                                   />
//                                 </button>
//                               </div>
//                             ))}
//                             <button
//                               onClick={() => addOption(i)}
//                               className="text-xs text-indigo-600 hover:underline mt-1"
//                             >
//                               + Add option
//                             </button>
//                             <p className="text-[11px] text-gray-400">
//                               {q.type === "multiple_choice"
//                                 ? "Tick every option that should count as correct."
//                                 : "Select the radio button next to the correct option."}
//                             </p>
//                           </>
//                         )}
//                       </div>
//                     )}

//                     {["short_answer", "long_answer", "text"].includes(q.type) && (
//                       <Textarea
//                         value={q.rubric || ""}
//                         onChange={(e) => updateQuestion(i, "rubric", e.target.value)}
//                         placeholder="Optional rubric / grading guidance for this question (used by AI grading and manual reviewers)"
//                         rows={2}
//                       />
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
//               <Button variant="secondary" onClick={closeModal}>
//                 Cancel
//               </Button>
//               <Button onClick={handleSave} disabled={saving}>
//                 {saving
//                   ? "Saving…"
//                   : editTarget
//                     ? "Save Changes"
//                     : "Create Assignment"}
//               </Button>
//             </div>
//           </div>
//         </Modal>

//         {/* ── Detail Modal ───────────────────────────────────────────────── */}
//         <Modal
//           open={!!showDetail}
//           onClose={() => setShowDetail(null)}
//           title={showDetail?.title}
//           size="lg"
//         >
//           {showDetail && (
//             <div className="space-y-5">
//               {showDetail.description && (
//                 <div>
//                   <p className="text-xs text-gray-400 mb-1">Description</p>
//                   <p className="text-gray-700 text-sm">
//                     {showDetail.description}
//                   </p>
//                 </div>
//               )}

//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 {[
//                   { label: "Course", value: showDetail.courseId?.title },
//                   { label: "Total Marks", value: showDetail.totalMarks },
//                   {
//                     label: "Questions",
//                     value: showDetail.questions?.length ?? 0,
//                   },
//                   {
//                     label: "Due Date",
//                     value: showDetail.dueDate
//                       ? new Date(showDetail.dueDate).toLocaleString()
//                       : "—",
//                   },
//                   {
//                     label: "Status",
//                     value: (
//                       <Badge
//                         variant={showDetail.isPublished ? "success" : "warning"}
//                       >
//                         {showDetail.isPublished ? "Published" : "Draft"}
//                       </Badge>
//                     ),
//                   },
//                   {
//                     label: "Overdue",
//                     value: isOverdue(showDetail) ? (
//                       <Badge variant="danger">Yes</Badge>
//                     ) : (
//                       <span className="text-gray-500 text-sm">No</span>
//                     ),
//                   },
//                 ].map(({ label, value }) => (
//                   <div key={label}>
//                     <p className="text-xs text-gray-400">{label}</p>
//                     <div className="font-medium text-sm mt-0.5">
//                       {value ?? "—"}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {showDetail.file?.url && (
//                 <div>
//                   <p className="text-xs text-gray-400 mb-1.5">
//                     Assignment File
//                   </p>
//                   <a
//                     href={showDetail.file.url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm hover:bg-indigo-100 transition"
//                   >
//                     <FileText size={15} />
//                     {showDetail.file.originalName || "Download File"}
//                   </a>
//                 </div>
//               )}

//               {showDetail.questions?.length > 0 && (
//                 <div>
//                   <p className="text-xs text-gray-400 mb-2">Questions</p>
//                   <div className="space-y-2">
//                     {showDetail.questions.map((q, i) => (
//                       <div
//                         key={q._id || i}
//                         className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100"
//                       >
//                         <div className="flex items-start justify-between">
//                           <p className="text-sm text-gray-700">
//                             <span className="font-medium text-gray-500 mr-2">
//                               Q{i + 1}.
//                             </span>
//                             {q.prompt}
//                           </p>
//                           <span className="text-xs text-gray-400 ml-4 flex-shrink-0">
//                             {q.marks} marks
//                           </span>
//                         </div>
//                         {q.type === "mcq" && q.options?.length > 0 && (
//                           <div className="flex flex-wrap gap-1.5 mt-2">
//                             {q.options.map((o, oi) => (
//                               <span
//                                 key={oi}
//                                 className="px-2.5 py-0.5 text-xs bg-white rounded-lg border border-gray-200 text-gray-600"
//                               >
//                                 {o}
//                               </span>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="flex justify-end gap-2 pt-2">
//                 <Button
//                   variant="secondary"
//                   onClick={() => {
//                     setShowDetail(null);
//                     navigate(
//                       `/admin/assignments/${showDetail._id}/submissions`,
//                     );
//                   }}
//                 >
//                   <Users size={15} /> View Submissions
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     setShowDetail(null);
//                     openEdit(showDetail);
//                   }}
//                 >
//                   <Edit2 size={15} /> Edit
//                 </Button>
//               </div>
//             </div>
//           )}
//         </Modal>
//       </div>
//     </AdminLayout>
//   );
// }








import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  PageHeader,
  DataTable,
  Badge,
  Button,
  Modal,
  Input,
  Select,
  Textarea,
  EmptyState,
} from "../../components/ui";
import {
  getAllAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  togglePublish,
} from "../../services/assignmentService";
import { getCourses } from "../../services/courseService";
import {
  Plus,
  ClipboardList,
  Trash2,
  Edit2,
  Eye,
  Search,
  BookOpen,
  Upload,
  X,
  FilePlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Info,
} from "lucide-react";

// ── constants ──────────────────────────────────────────────────────────────
// Centralizing "which question types behave like what" here means every part
// of the component (form, detail view, validation) agrees on the rules —
// previously the create form and the read-only detail view had drifted apart
// (detail view only ever recognised the legacy "mcq" type).

const OPTION_TYPES = ["mcq", "single_choice", "multiple_choice", "true_false"];
const TEXT_TYPES = ["short_answer", "long_answer", "text"];
const isOptionType = (t) => OPTION_TYPES.includes(t);
const isTextType = (t) => TEXT_TYPES.includes(t);

const QUESTION_TYPE_OPTIONS = [
  { value: "short_answer", label: "Short answer" },
  { value: "long_answer", label: "Long answer" },
  { value: "single_choice", label: "Single choice (MCQ)" },
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "true_false", label: "True / False" },
  { value: "file_upload", label: "File upload" },
  { value: "text", label: "Text answer (legacy)" },
  { value: "mcq", label: "Multiple choice (legacy)" },
  { value: "file", label: "File upload (legacy)" },
];

const ASSESSMENT_TYPE_OPTIONS = [
  { value: "general", label: "General" },
  { value: "mcq_exam", label: "MCQ Exam (auto-graded)" },
  { value: "written_assessment", label: "Written Assessment" },
  { value: "project_submission", label: "Project Submission" },
];

const ASSESSMENT_TYPE_LABEL = ASSESSMENT_TYPE_OPTIONS.reduce((acc, o) => {
  acc[o.value] = o.label;
  return acc;
}, {});

const emptyForm = {
  title: "",
  description: "",
  courseId: "",
  dueDate: "",
  totalMarks: "",
  isPublished: false,
  // Assessment configuration
  assessmentType: "general",
  instructions: "",
  passingMarks: "",
  maxAttempts: 1,
  allowResubmission: true,
  maxResubmissions: 3,
  requireAdminApproval: false,
  showCorrectAnswers: false,
  // AI grading
  gradingPrompt: "",
  answerKey: "",
  useAnswerKeyForGrading: false,
  aiGradingEnabled: false,
  // Submission integrity — new: closes the "blank submission" gap
  preventBlankSubmission: true,
  unlimitedRetriesForBlank: true,
};

const emptyQuestion = {
  type: "short_answer",
  prompt: "",
  marks: 5,
  options: [],
  correctAnswer: "",
  correctAnswers: [],
  rubric: "",
};

export default function Assignments() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showDetail, setShowDetail] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [questions, setQuestions] = useState([]);
  const [file, setFile] = useState(null); // File object for upload

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [a, c] = await Promise.all([getAllAssignments(), getCourses()]);
      setAssignments(a?.assignments || []);
      setCourses(Array.isArray(c) ? c : c?.courses || []);
    } catch (err) {
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  // ── form helpers ───────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(emptyForm);
    setQuestions([]);
    setFile(null);
    setEditTarget(null);
    setError("");
    setShowCreate(true);
  };

  const openEdit = (a) => {
    setForm({
      title: a.title || "",
      description: a.description || "",
      courseId: a.courseId?._id || a.courseId || "",
      dueDate: a.dueDate ? a.dueDate.slice(0, 10) : "",
      totalMarks: a.totalMarks ?? "",
      isPublished: a.isPublished || false,
      assessmentType: a.assessmentType || "general",
      instructions: a.instructions || "",
      passingMarks: a.passingMarks ?? "",
      maxAttempts: a.maxAttempts ?? 1,
      allowResubmission: a.allowResubmission ?? true,
      maxResubmissions: a.maxResubmissions ?? 3,
      requireAdminApproval: a.requireAdminApproval || false,
      showCorrectAnswers: a.showCorrectAnswers || false,
      gradingPrompt: a.gradingPrompt || "",
      answerKey: a.answerKey || "",
      useAnswerKeyForGrading: a.useAnswerKeyForGrading || false,
      aiGradingEnabled: a.aiGradingEnabled || false,
      preventBlankSubmission: a.preventBlankSubmission ?? true,
      unlimitedRetriesForBlank: a.unlimitedRetriesForBlank ?? true,
    });
    setQuestions(
      (a.questions || []).map((q) => ({
        type: q.type || "short_answer",
        prompt: q.prompt || "",
        marks: q.marks ?? 5,
        options: q.options || [],
        correctAnswer: q.correctAnswer || "",
        correctAnswers: q.correctAnswers || [],
        rubric: q.rubric || "",
      })),
    );
    setFile(null);
    setEditTarget(a);
    setShowCreate(true);
    setError("");
  };

  const closeModal = () => {
    setShowCreate(false);
    setEditTarget(null);
    setFile(null);
    setQuestions([]);
    setError("");
  };

  // ── Question helpers ───────────────────────────────────────────────────────

  const addQuestion = () =>
    setQuestions((prev) => [...prev, { ...emptyQuestion }]);

  const removeQuestion = (i) =>
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));

  const updateQuestion = (i, field, value) =>
    setQuestions((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });

  // Switching a question's type used to leave stale options / correct-answer
  // data behind (e.g. going multiple_choice -> short_answer kept the old
  // options array around, and going true_false -> single_choice kept
  // correctAnswer set to "True"/"False"). That stale data silently failed
  // validation or, worse, saved as a "correct answer" that didn't match any
  // visible option. Clear whatever no longer applies to the new type.
  const updateQuestionType = (i, newType) =>
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[i], type: newType };
      if (!isOptionType(newType)) {
        q.options = [];
        q.correctAnswer = "";
        q.correctAnswers = [];
      } else if (newType === "true_false") {
        q.options = [];
        q.correctAnswers = [];
        if (!["True", "False"].includes(q.correctAnswer)) q.correctAnswer = "";
      } else if (newType === "multiple_choice") {
        q.correctAnswer = "";
      } else {
        q.correctAnswers = [];
      }
      copy[i] = q;
      return copy;
    });

  const addOption = (i) =>
    setQuestions((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], options: [...(copy[i].options || []), ""] };
      return copy;
    });

  const updateOption = (qi, oi, val) =>
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = [...copy[qi].options];
      const oldVal = opts[oi];
      opts[oi] = val;
      const q = { ...copy[qi], options: opts };
      // Keep the marked correct answer(s) pointing at the edited option text
      // rather than silently losing the "correct" flag when someone fixes a typo.
      if (q.correctAnswer === oldVal) q.correctAnswer = val;
      if (Array.isArray(q.correctAnswers) && q.correctAnswers.includes(oldVal)) {
        q.correctAnswers = q.correctAnswers.map((c) => (c === oldVal ? val : c));
      }
      copy[qi] = q;
      return copy;
    });

  const removeOption = (qi, oi) =>
    setQuestions((prev) => {
      const copy = [...prev];
      const removed = copy[qi].options[oi];
      copy[qi] = {
        ...copy[qi],
        options: copy[qi].options.filter((_, idx) => idx !== oi),
        correctAnswer: copy[qi].correctAnswer === removed ? "" : copy[qi].correctAnswer,
        correctAnswers: (copy[qi].correctAnswers || []).filter((c) => c !== removed),
      };
      return copy;
    });

  // ── derived values ─────────────────────────────────────────────────────────

  const computedMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  // ── validation ─────────────────────────────────────────────────────────────
  // The old version only checked title + course. Adding a whole assessment
  // configuration block (marks, attempts, AI grading, MCQ correctness) without
  // matching validation is exactly the kind of gap that produces broken,
  // half-configured assessments in production — this closes that gap.

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.courseId) return "Please select a course";

    if (
      form.passingMarks !== "" &&
      form.totalMarks !== "" &&
      Number(form.passingMarks) > Number(form.totalMarks)
    ) {
      return "Passing marks can't be higher than total marks";
    }
    if (Number(form.maxAttempts) < 1) return "Max attempts must be at least 1";

    if (form.assessmentType === "mcq_exam" && questions.length === 0) {
      return "An MCQ exam needs at least one question";
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) return `Question ${i + 1} needs a prompt`;

      if (q.type === "true_false") {
        if (!q.correctAnswer) return `Question ${i + 1}: mark True or False as correct`;
      } else if (isOptionType(q.type)) {
        const opts = (q.options || []).map((o) => o.trim()).filter(Boolean);
        if (opts.length < 2) return `Question ${i + 1} needs at least 2 options`;
        if (q.type === "multiple_choice") {
          if (!(q.correctAnswers || []).length)
            return `Question ${i + 1}: mark at least one option as correct`;
        } else if (!q.correctAnswer) {
          return `Question ${i + 1}: select the correct option`;
        }
      }
    }

    if (form.aiGradingEnabled && !form.gradingPrompt.trim()) {
      return "Add grading instructions for the AI grader, or turn AI grading off";
    }

    return "";
  };

  // ── save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setError("");
    const validationError = validate();
    if (validationError) return setError(validationError);

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("courseId", form.courseId);
      if (form.dueDate) fd.append("dueDate", form.dueDate);
      if (form.totalMarks !== "") fd.append("totalMarks", form.totalMarks);
      fd.append("isPublished", form.isPublished);
      if (questions.length > 0)
        fd.append("questions", JSON.stringify(questions));
      if (file) fd.append("file", file);

      // Assessment configuration
      fd.append("assessmentType", form.assessmentType || "general");
      fd.append("instructions", form.instructions || "");
      if (form.passingMarks !== "") fd.append("passingMarks", form.passingMarks);
      fd.append("maxAttempts", form.maxAttempts || 1);
      fd.append("allowResubmission", form.allowResubmission);
      fd.append("maxResubmissions", form.maxResubmissions ?? 3);
      fd.append("requireAdminApproval", form.requireAdminApproval);
      fd.append("showCorrectAnswers", form.showCorrectAnswers);
      fd.append("gradingPrompt", form.gradingPrompt || "");
      fd.append("answerKey", form.answerKey || "");
      fd.append("useAnswerKeyForGrading", form.useAnswerKeyForGrading);
      fd.append("aiGradingEnabled", form.aiGradingEnabled);

      // Submission integrity
      fd.append("preventBlankSubmission", form.preventBlankSubmission);
      fd.append("unlimitedRetriesForBlank", form.unlimitedRetriesForBlank);

      if (editTarget) {
        await updateAssignment(editTarget._id, fd);
      } else {
        await createAssignment(fd);
      }

      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this assignment and all its submissions?")) return;
    try {
      await deleteAssignment(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleTogglePublish = async (a) => {
    try {
      await togglePublish(a._id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  // ── filter ─────────────────────────────────────────────────────────────────

  const filtered = assignments.filter((a) => {
    const matchSearch = a.title?.toLowerCase().includes(search.toLowerCase());
    const matchCourse =
      selectedCourse === "all" ||
      (a.courseId?._id || a.courseId) === selectedCourse;
    return matchSearch && matchCourse;
  });

  const isOverdue = (a) => a.dueDate && new Date() > new Date(a.dueDate);

  // ── table columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      key: "title",
      label: "Assignment",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <ClipboardList size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{r.title}</p>
            <p className="text-xs text-gray-400">
              {r.courseId?.title || "No course"}
              {r.assessmentType && r.assessmentType !== "general" && (
                <span className="ml-1.5 text-indigo-400">
                  · {ASSESSMENT_TYPE_LABEL[r.assessmentType] || r.assessmentType}
                </span>
              )}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "marks",
      label: "Marks",
      render: (r) => (
        <span className="font-medium">
          {r.totalMarks ?? "—"}
          {r.passingMarks != null && (
            <span className="text-xs text-gray-400 font-normal"> / pass {r.passingMarks}</span>
          )}
        </span>
      ),
    },
    {
      key: "questions",
      label: "Questions",
      render: (r) => r.questions?.length || 0,
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (r) => {
        if (!r.dueDate) return "—";
        return (
          <span
            className={
              isOverdue(r)
                ? "text-red-500 font-medium flex items-center gap-1"
                : ""
            }
          >
            {isOverdue(r) && <AlertTriangle size={12} />}
            {new Date(r.dueDate).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={r.isPublished ? "success" : "warning"}>
            {r.isPublished ? "Published" : "Draft"}
          </Badge>
          {isOverdue(r) && <Badge variant="danger">Overdue</Badge>}
          {r.file?.url && (
            <FileText size={14} className="text-gray-400" title="Has file" />
          )}
          {r.aiGradingEnabled && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-violet-50 text-violet-600 border border-violet-100"
              title="AI grading enabled"
            >
              <Sparkles size={10} /> AI graded
            </span>
          )}
          {r.preventBlankSubmission !== false && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100"
              title="Blank submissions are blocked for this assignment"
            >
              <ShieldCheck size={10} /> Guarded
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetail(r);
            }}
            className="p-2 rounded-lg hover:bg-indigo-50"
            title="View"
          >
            <Eye size={15} className="text-indigo-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/assignments/${r._id}/submissions`);
            }}
            className="p-2 rounded-lg hover:bg-blue-50"
            title="Submissions"
          >
            <Users size={15} className="text-blue-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePublish(r);
            }}
            className="p-2 rounded-lg hover:bg-emerald-50"
            title={r.isPublished ? "Unpublish" : "Publish"}
          >
            {r.isPublished ? (
              <Clock size={15} className="text-orange-500" />
            ) : (
              <CheckCircle size={15} className="text-emerald-500" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(r);
            }}
            className="p-2 rounded-lg hover:bg-orange-50"
            title="Edit"
          >
            <Edit2 size={15} className="text-orange-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r._id);
            }}
            className="p-2 rounded-lg hover:bg-red-50"
            title="Delete"
          >
            <Trash2 size={15} className="text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader
          title="Assignments"
          subtitle={`${assignments.length} total assignments`}
          actions={
            <Button onClick={openCreate}>
              <Plus size={16} />
              Create Assignment
            </Button>
          }
        />

        {error && !showCreate && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
            <AlertTriangle size={16} />
            {error}
            <button className="ml-auto" onClick={() => setError("")}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Course filter cards */}
        <div className="grid md:grid-cols-5 gap-3 mb-6 overflow-x-auto">
          <div
            onClick={() => setSelectedCourse("all")}
            className={`p-4 rounded-2xl border cursor-pointer transition flex-shrink-0 ${
              selectedCourse === "all"
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-100 bg-white"
            }`}
          >
            <p className="font-medium text-sm">All Courses</p>
            <p className="text-xs text-gray-400">
              {assignments.length} assignments
            </p>
          </div>
          {courses.slice(0, 8).map((c) => (
            <div
              key={c._id}
              onClick={() => setSelectedCourse(c._id)}
              className={`p-4 rounded-2xl border cursor-pointer transition flex-shrink-0 ${
                selectedCourse === c._id
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-orange-500 flex-shrink-0" />
                <p className="font-medium text-sm truncate">{c.title}</p>
              </div>
              <p className="text-xs text-gray-400">
                {
                  assignments.filter(
                    (a) => (a.courseId?._id || a.courseId) === c._id,
                  ).length
                }{" "}
                assignments
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4 relative max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {loading ? (
          <EmptyState title="Loading assignments..." />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            emptyMessage="No assignments found"
          />
        )}

        {/* ── Create / Edit Modal ───────────────────────────────────────── */}
        <Modal
          open={showCreate}
          onClose={closeModal}
          title={editTarget ? "Edit Assignment" : "Create Assignment"}
          size="xl"
        >
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2.5 rounded-xl text-sm border border-red-200">
                <AlertTriangle size={14} />
                {error}
              </div>
            )}

            {/* Basic info */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="md:col-span-2"
                placeholder="e.g. Week 3 Assignment"
              />
              <Select
                label="Course *"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                options={[
                  { value: "", label: "Select course" },
                  ...courses.map((c) => ({ value: c._id, label: c.title })),
                ]}
              />
              <div>
                <Input
                  label="Total Marks"
                  type="number"
                  min={0}
                  value={form.totalMarks}
                  onChange={(e) =>
                    setForm({ ...form, totalMarks: e.target.value })
                  }
                  placeholder="Auto-calculated from questions"
                />
                {questions.length > 0 && Number(form.totalMarks) !== computedMarks && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, totalMarks: String(computedMarks) })}
                    className="mt-1 text-xs text-indigo-600 hover:underline"
                  >
                    Questions add up to {computedMarks} — use this total
                  </button>
                )}
              </div>
              <Input
                label="Due Date"
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
              <Select
                label="Status"
                value={String(form.isPublished)}
                onChange={(e) =>
                  setForm({ ...form, isPublished: e.target.value === "true" })
                }
                options={[
                  { value: "false", label: "Draft" },
                  { value: "true", label: "Published" },
                ]}
              />
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="md:col-span-2"
                rows={3}
              />
            </div>

            {/* Assessment configuration */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Assessment Settings
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Select
                  label="Assessment Type"
                  value={form.assessmentType}
                  onChange={(e) => setForm({ ...form, assessmentType: e.target.value })}
                  options={ASSESSMENT_TYPE_OPTIONS}
                />
                <Input
                  label="Passing Marks"
                  type="number"
                  min={0}
                  value={form.passingMarks}
                  onChange={(e) => setForm({ ...form, passingMarks: e.target.value })}
                  placeholder="e.g. 40"
                />
                <Input
                  label="Max Attempts"
                  type="number"
                  min={1}
                  value={form.maxAttempts}
                  onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })}
                />
                <Input
                  label="Max Resubmissions"
                  type="number"
                  min={0}
                  value={form.maxResubmissions}
                  onChange={(e) => setForm({ ...form, maxResubmissions: e.target.value })}
                  disabled={!form.allowResubmission}
                />
                <Textarea
                  label="Instructions for Students"
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  className="md:col-span-2"
                  rows={2}
                />
              </div>

              <div className="flex flex-wrap gap-5 mt-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.allowResubmission}
                    onChange={(e) => setForm({ ...form, allowResubmission: e.target.checked })}
                  />
                  Allow resubmission
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.requireAdminApproval}
                    onChange={(e) => setForm({ ...form, requireAdminApproval: e.target.checked })}
                  />
                  Require admin approval before completion
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.showCorrectAnswers}
                    onChange={(e) => setForm({ ...form, showCorrectAnswers: e.target.checked })}
                  />
                  Show correct answers after grading
                </label>
              </div>
            </div>

            {/* Submission integrity — new section that directly targets the
                "learner submits blank work and is then stuck" problem. These
                flags need matching enforcement in the learner submission form
                and the submission API (see note below the form). */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Submission Integrity
              </p>
              <div className="space-y-3">
                <label className="flex items-start gap-2.5 text-sm text-gray-700 bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={form.preventBlankSubmission}
                    onChange={(e) =>
                      setForm({ ...form, preventBlankSubmission: e.target.checked })
                    }
                  />
                  <span>
                    <span className="font-medium text-gray-800 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      Block empty submissions
                    </span>
                    <span className="text-gray-500 text-xs">
                      Learners can't submit until at least one question is answered or a file is attached.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-2.5 text-sm text-gray-700 bg-indigo-50/60 border border-indigo-100 rounded-xl p-3">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={form.unlimitedRetriesForBlank}
                    onChange={(e) =>
                      setForm({ ...form, unlimitedRetriesForBlank: e.target.checked })
                    }
                  />
                  <span>
                    <span className="font-medium text-gray-800 flex items-center gap-1.5">
                      <RefreshCw size={14} className="text-indigo-600" />
                      Never lock out on a blank attempt
                    </span>
                    <span className="text-gray-500 text-xs">
                      If a blank submission ever slips through, it won't count against "Max Resubmissions" above — the learner keeps a real attempt.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* AI grading configuration */}
            {["written_assessment", "project_submission"].includes(form.assessmentType) && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  AI Grading
                </p>
                <label className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                  <input
                    type="checkbox"
                    checked={form.aiGradingEnabled}
                    onChange={(e) => setForm({ ...form, aiGradingEnabled: e.target.checked })}
                  />
                  Enable AI grading for this assessment
                </label>
                {form.aiGradingEnabled && (
                  <div className="space-y-3">
                    <Textarea
                      label="Grading Prompt (instructions for the AI grader)"
                      value={form.gradingPrompt}
                      onChange={(e) => setForm({ ...form, gradingPrompt: e.target.value })}
                      rows={2}
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.useAnswerKeyForGrading}
                        onChange={(e) =>
                          setForm({ ...form, useAnswerKeyForGrading: e.target.checked })
                        }
                      />
                      Use the answer key below as the authoritative reference
                    </label>
                    <Textarea
                      label="Answer Key / Model Solution"
                      value={form.answerKey}
                      onChange={(e) => setForm({ ...form, answerKey: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            )}

            {/* File upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Assignment File (.docx / .pdf)
              </label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition"
                onClick={() => fileRef.current?.click()}
              >
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Upload size={20} className="text-indigo-600" />
                </div>
                {file ? (
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="p-1.5 hover:bg-red-50 rounded-lg"
                    >
                      <X size={14} className="text-red-400" />
                    </button>
                  </div>
                ) : editTarget?.file?.url ? (
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Current:{" "}
                        {editTarget.file.originalName || "Uploaded file"}
                      </p>
                      <p className="text-xs text-gray-400">Click to replace</p>
                    </div>
                    <a
                      href={editTarget.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <Eye size={12} /> View
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Click to upload .docx or .pdf (max 100 MB)
                  </p>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".docx,.doc,.pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                />
              </div>
            </div>

            {/* Questions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-800">
                  Questions ({questions.length})
                  {questions.length > 0 && (
                    <span className="text-gray-400 font-normal"> · {computedMarks} marks</span>
                  )}
                </h4>
                <button
                  onClick={addQuestion}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                >
                  <FilePlus size={13} /> Add Question
                </button>
              </div>

              {questions.length === 0 && (
                <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  No questions added. You can also upload a .docx file with
                  questions instead.
                </p>
              )}

              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <Select
                        value={q.type}
                        onChange={(e) => updateQuestionType(i, e.target.value)}
                        options={QUESTION_TYPE_OPTIONS}
                        className="flex-shrink-0 w-48"
                      />
                      <Input
                        type="number"
                        min={0}
                        value={q.marks}
                        onChange={(e) =>
                          updateQuestion(i, "marks", Number(e.target.value))
                        }
                        placeholder="Marks"
                        className="w-24 flex-shrink-0"
                      />
                      <button
                        onClick={() => removeQuestion(i)}
                        className="ml-auto p-1.5 hover:bg-red-50 rounded-lg"
                      >
                        <X size={14} className="text-red-400" />
                      </button>
                    </div>

                    <Input
                      value={q.prompt}
                      onChange={(e) =>
                        updateQuestion(i, "prompt", e.target.value)
                      }
                      placeholder="Question prompt..."
                    />

                    {isOptionType(q.type) && (
                      <div className="space-y-2 ml-2">
                        {q.type === "true_false" ? (
                          <div className="flex gap-4">
                            {["True", "False"].map((opt) => (
                              <label key={opt} className="flex items-center gap-1.5 text-sm text-gray-700">
                                <input
                                  type="radio"
                                  name={`correct-${i}`}
                                  checked={q.correctAnswer === opt}
                                  onChange={() => updateQuestion(i, "correctAnswer", opt)}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <>
                            {(q.options || []).map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                {q.type === "multiple_choice" ? (
                                  <input
                                    type="checkbox"
                                    checked={(q.correctAnswers || []).includes(opt)}
                                    onChange={(e) => {
                                      const current = q.correctAnswers || [];
                                      const next = e.target.checked
                                        ? [...current, opt]
                                        : current.filter((c) => c !== opt);
                                      updateQuestion(i, "correctAnswers", next);
                                    }}
                                  />
                                ) : (
                                  <input
                                    type="radio"
                                    name={`correct-${i}`}
                                    checked={q.correctAnswer === opt}
                                    onChange={() => updateQuestion(i, "correctAnswer", opt)}
                                  />
                                )}
                                <input
                                  value={opt}
                                  onChange={(e) =>
                                    updateOption(i, oi, e.target.value)
                                  }
                                  placeholder={`Option ${oi + 1}`}
                                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                />
                                <button onClick={() => removeOption(i, oi)}>
                                  <X
                                    size={13}
                                    className="text-gray-400 hover:text-red-400"
                                  />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addOption(i)}
                              className="text-xs text-indigo-600 hover:underline mt-1"
                            >
                              + Add option
                            </button>
                            <p className="text-[11px] text-gray-400">
                              {q.type === "multiple_choice"
                                ? "Tick every option that should count as correct."
                                : "Select the radio button next to the correct option."}
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {isTextType(q.type) && (
                      <Textarea
                        value={q.rubric || ""}
                        onChange={(e) => updateQuestion(i, "rubric", e.target.value)}
                        placeholder="Optional rubric / grading guidance for this question (used by AI grading and manual reviewers)"
                        rows={2}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving
                  ? "Saving…"
                  : editTarget
                    ? "Save Changes"
                    : "Create Assignment"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* ── Detail Modal ───────────────────────────────────────────────── */}
        <Modal
          open={!!showDetail}
          onClose={() => setShowDetail(null)}
          title={showDetail?.title}
          size="lg"
        >
          {showDetail && (
            <div className="space-y-5">
              {showDetail.description && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-gray-700 text-sm">
                    {showDetail.description}
                  </p>
                </div>
              )}

              {showDetail.instructions && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Instructions for Students</p>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {showDetail.instructions}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Course", value: showDetail.courseId?.title },
                  {
                    label: "Type",
                    value: ASSESSMENT_TYPE_LABEL[showDetail.assessmentType] || "General",
                  },
                  { label: "Total Marks", value: showDetail.totalMarks },
                  { label: "Passing Marks", value: showDetail.passingMarks ?? "—" },
                  {
                    label: "Questions",
                    value: showDetail.questions?.length ?? 0,
                  },
                  {
                    label: "Due Date",
                    value: showDetail.dueDate
                      ? new Date(showDetail.dueDate).toLocaleString()
                      : "—",
                  },
                  {
                    label: "Status",
                    value: (
                      <Badge
                        variant={showDetail.isPublished ? "success" : "warning"}
                      >
                        {showDetail.isPublished ? "Published" : "Draft"}
                      </Badge>
                    ),
                  },
                  {
                    label: "Overdue",
                    value: isOverdue(showDetail) ? (
                      <Badge variant="danger">Yes</Badge>
                    ) : (
                      <span className="text-gray-500 text-sm">No</span>
                    ),
                  },
                  { label: "Max Attempts", value: showDetail.maxAttempts ?? 1 },
                  {
                    label: "Resubmissions",
                    value: showDetail.allowResubmission
                      ? `Allowed (up to ${showDetail.maxResubmissions ?? 3})`
                      : "Not allowed",
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <div className="font-medium text-sm mt-0.5">
                      {value ?? "—"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submission integrity summary */}
              <div className="flex flex-wrap gap-2">
                {showDetail.preventBlankSubmission !== false && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <ShieldCheck size={13} /> Blank submissions blocked
                  </span>
                )}
                {showDetail.unlimitedRetriesForBlank !== false && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <RefreshCw size={13} /> Blank attempts don't cost a resubmission
                  </span>
                )}
                {showDetail.requireAdminApproval && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                    <Info size={13} /> Needs admin approval to complete
                  </span>
                )}
                {showDetail.aiGradingEnabled && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-violet-50 text-violet-700 border border-violet-100">
                    <Sparkles size={13} /> AI grading enabled
                  </span>
                )}
              </div>

              {showDetail.aiGradingEnabled && showDetail.gradingPrompt && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Grading Prompt</p>
                  <p className="text-gray-700 text-sm bg-violet-50/50 border border-violet-100 rounded-xl px-3 py-2">
                    {showDetail.gradingPrompt}
                  </p>
                </div>
              )}

              {showDetail.file?.url && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">
                    Assignment File
                  </p>
                  <a
                    href={showDetail.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm hover:bg-indigo-100 transition"
                  >
                    <FileText size={15} />
                    {showDetail.file.originalName || "Download File"}
                  </a>
                </div>
              )}

              {showDetail.questions?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Questions</p>
                  <div className="space-y-2">
                    {showDetail.questions.map((q, i) => (
                      <div
                        key={q._id || i}
                        className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium text-gray-500 mr-2">
                              Q{i + 1}.
                            </span>
                            {q.prompt}
                          </p>
                          <span className="text-xs text-gray-400 ml-4 flex-shrink-0">
                            {q.marks} marks
                          </span>
                        </div>

                        {isOptionType(q.type) && q.type !== "true_false" && q.options?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {q.options.map((o, oi) => {
                              const isCorrect =
                                q.type === "multiple_choice"
                                  ? (q.correctAnswers || []).includes(o)
                                  : q.correctAnswer === o;
                              return (
                                <span
                                  key={oi}
                                  className={`px-2.5 py-0.5 text-xs rounded-lg border ${
                                    isCorrect
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-medium"
                                      : "bg-white border-gray-200 text-gray-600"
                                  }`}
                                >
                                  {isCorrect && "✓ "}
                                  {o}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {q.type === "true_false" && (
                          <p className="text-xs text-gray-500 mt-2">
                            Correct answer:{" "}
                            <span className="font-medium text-emerald-600">
                              {q.correctAnswer || "Not set"}
                            </span>
                          </p>
                        )}

                        {isTextType(q.type) && q.rubric && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                            Rubric: {q.rubric}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDetail(null);
                    navigate(
                      `/admin/assignments/${showDetail._id}/submissions`,
                    );
                  }}
                >
                  <Users size={15} /> View Submissions
                </Button>
                <Button
                  onClick={() => {
                    setShowDetail(null);
                    openEdit(showDetail);
                  }}
                >
                  <Edit2 size={15} /> Edit
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}