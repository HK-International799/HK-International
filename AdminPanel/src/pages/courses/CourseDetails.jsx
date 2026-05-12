// import { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import {
//   ChevronDown,
//   ChevronRight,
//   Plus,
//   Trash2,
//   Upload,
//   BookOpen,
//   FileText,
//   HelpCircle,
//   CheckCircle,
//   Edit3,
//   X,
//   Save,
//   UserPlus,
//   Search,
//   User,
// } from "lucide-react";

// import AdminLayout from "../../components/layout/AdminLayout";
// import {
//   getCourseById,
//   getChaptersByCourse,
//   createChapter,
//   updateChapterById,
//   deleteChapterById,
//   uploadChapterDocument,
//   createChapterQuiz,
//   addChapterQuizQuestion,
//   getChapterQuiz,
//   publishCourse,
//   enrollStudent,
// } from "../../services/courseService";
// import { getAllUsers } from "../../services/adminService"; // adjust path as needed

// /* ──────────────────────────────────────────────────────────
//    Inline helper — simple card wrapper
// ────────────────────────────────────────────────────────── */
// const Card = ({ children, className = "" }) => (
//   <div className={`bg-white border rounded-2xl p-5 ${className}`}>
//     {children}
//   </div>
// );

// /* ──────────────────────────────────────────────────────────
//    EnrollStudentModal
//    Fetches all users, lets admin search + select one,
//    then calls enrollStudent API.
// ────────────────────────────────────────────────────────── */
// const EnrollStudentModal = ({ courseId, onClose, onSuccess }) => {
//   const [users, setUsers] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(true);
//   const [search, setSearch] = useState("");
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [enrolling, setEnrolling] = useState(false);
//   const dropdownRef = useRef(null);

//   // Fetch users on mount
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         setLoadingUsers(true);
//         const data = await getAllUsers({ role: "student" });
//         // support both array and paginated { users: [] } shapes
//         setUsers(Array.isArray(data) ? data : data.users || []);
//       } catch (err) {
//         console.error(err);
//         setUsers([]);
//       } finally {
//         setLoadingUsers(false);
//       }
//     };
//     fetchUsers();
//   }, []);

//   // Close dropdown on outside click
//   useEffect(() => {
//     const handler = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const filtered = users.filter((u) => {
//     const q = search.toLowerCase();
//     return (
//       u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
//     );
//   });

//   const handleSelect = (user) => {
//     setSelectedUser(user);
//     setDropdownOpen(false);
//     setSearch("");
//   };

//   const handleEnroll = async () => {
//     if (!selectedUser) return alert("Please select a student");
//     try {
//       setEnrolling(true);
//       await enrollStudent(courseId, selectedUser._id);
//       alert(`${selectedUser.name || "Student"} enrolled successfully!`);
//       onSuccess();
//       onClose();
//     } catch (err) {
//       alert(err.response?.data?.message || "Enrollment failed");
//     } finally {
//       setEnrolling(false);
//     }
//   };

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-5">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//             <UserPlus size={16} className="text-purple-600" />
//             Enroll a Student
//           </h3>
//           <button
//             onClick={onClose}
//             className="p-1.5 rounded-lg hover:bg-gray-100"
//           >
//             <X size={16} className="text-gray-400" />
//           </button>
//         </div>

//         {/* Student selector */}
//         <div className="space-y-1.5">
//           <label className="text-xs font-medium text-gray-500">
//             Select Student
//           </label>

//           <div className="relative" ref={dropdownRef}>
//             {/* Trigger */}
//             <button
//               type="button"
//               onClick={() => setDropdownOpen((v) => !v)}
//               className="w-full flex items-center justify-between border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 outline-none bg-white hover:bg-gray-50 transition-colors"
//             >
//               {selectedUser ? (
//                 <div className="flex items-center gap-2 min-w-0">
//                   <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
//                     {(selectedUser.name || "S")[0].toUpperCase()}
//                   </div>
//                   <div className="min-w-0 text-left">
//                     <p className="font-medium text-gray-800 truncate">
//                       {selectedUser.name}
//                     </p>
//                     <p className="text-xs text-gray-400 truncate">
//                       {selectedUser.email}
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <span className="text-gray-400">
//                   {loadingUsers
//                     ? "Loading students…"
//                     : "Search and select a student"}
//                 </span>
//               )}
//               <ChevronDown
//                 size={15}
//                 className={`text-gray-400 flex-shrink-0 ml-2 transition-transform ${
//                   dropdownOpen ? "rotate-180" : ""
//                 }`}
//               />
//             </button>

//             {/* Dropdown panel */}
//             {dropdownOpen && (
//               <div className="absolute z-10 mt-1.5 w-full bg-white border rounded-2xl shadow-lg overflow-hidden">
//                 {/* Search inside dropdown */}
//                 <div className="p-2 border-b">
//                   <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
//                     <Search size={13} className="text-gray-400 flex-shrink-0" />
//                     <input
//                       autoFocus
//                       type="text"
//                       placeholder="Search by name or email…"
//                       className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
//                       value={search}
//                       onChange={(e) => setSearch(e.target.value)}
//                     />
//                     {search && (
//                       <button onClick={() => setSearch("")}>
//                         <X
//                           size={12}
//                           className="text-gray-400 hover:text-gray-600"
//                         />
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 {/* Options list */}
//                 <div className="max-h-56 overflow-y-auto">
//                   {loadingUsers ? (
//                     <div className="flex items-center justify-center py-8 gap-2">
//                       <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
//                       <span className="text-sm text-gray-400">Loading…</span>
//                     </div>
//                   ) : filtered.length === 0 ? (
//                     <div className="text-center py-8">
//                       <User size={24} className="mx-auto text-gray-200 mb-2" />
//                       <p className="text-sm text-gray-400">
//                         {search
//                           ? "No students match your search"
//                           : "No students found"}
//                       </p>
//                     </div>
//                   ) : (
//                     filtered.map((user) => (
//                       <button
//                         key={user._id}
//                         type="button"
//                         onClick={() => handleSelect(user)}
//                         className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left ${
//                           selectedUser?._id === user._id ? "bg-purple-50" : ""
//                         }`}
//                       >
//                         {/* Avatar */}
//                         <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
//                           {(user.name || "S")[0].toUpperCase()}
//                         </div>
//                         <div className="min-w-0 flex-1">
//                           <p className="text-sm font-medium text-gray-800 truncate">
//                             {user.name || "Unnamed"}
//                           </p>
//                           <p className="text-xs text-gray-400 truncate">
//                             {user.email}
//                           </p>
//                         </div>
//                         {selectedUser?._id === user._id && (
//                           <CheckCircle
//                             size={14}
//                             className="text-purple-500 flex-shrink-0"
//                           />
//                         )}
//                       </button>
//                     ))
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Selected student preview */}
//         {selectedUser && (
//           <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
//             <div className="w-9 h-9 rounded-full bg-purple-200 text-purple-800 text-sm font-bold flex items-center justify-center flex-shrink-0">
//               {(selectedUser.name || "S")[0].toUpperCase()}
//             </div>
//             <div className="min-w-0">
//               <p className="text-sm font-semibold text-gray-800 truncate">
//                 {selectedUser.name}
//               </p>
//               <p className="text-xs text-purple-500 truncate">
//                 {selectedUser.email}
//               </p>
//             </div>
//             <button
//               onClick={() => setSelectedUser(null)}
//               className="ml-auto p-1 rounded-lg hover:bg-purple-100"
//             >
//               <X size={13} className="text-purple-400" />
//             </button>
//           </div>
//         )}

//         {/* Actions */}
//         <div className="flex gap-3 pt-1">
//           <button
//             onClick={onClose}
//             className="flex-1 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl border"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleEnroll}
//             disabled={!selectedUser || enrolling}
//             className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           >
//             <UserPlus size={14} />
//             {enrolling ? "Enrolling…" : "Enroll Student"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ──────────────────────────────────────────────────────────
//    QuizBuilder
// ────────────────────────────────────────────────────────── */
// const QuizBuilder = ({ chapter, onDone }) => {
//   const [quiz, setQuiz] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [form, setForm] = useState({
//     prompt: "",
//     options: ["", "", "", ""],
//     correctAnswer: "",
//     marks: 1,
//   });

//   useEffect(() => {
//     loadQuiz();
//   }, [chapter._id]);

//   const loadQuiz = async () => {
//     setLoading(true);
//     try {
//       const { quiz: q } = await getChapterQuiz(chapter._id);
//       setQuiz(q);
//     } catch {
//       setQuiz(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateQuiz = async () => {
//     try {
//       setSaving(true);
//       const { quiz: q } = await createChapterQuiz(chapter._id, {
//         title: `${chapter.title} – Quiz`,
//       });
//       setQuiz(q);
//     } catch (err) {
//       alert(err.response?.data?.message || "Error creating quiz");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleAddQuestion = async () => {
//     if (!form.prompt || !form.correctAnswer) {
//       return alert("Question prompt and correct answer are required");
//     }
//     const nonEmptyOptions = form.options.filter((o) => o.trim() !== "");
//     if (nonEmptyOptions.length < 2) {
//       return alert("Provide at least 2 options");
//     }
//     try {
//       setSaving(true);
//       await addChapterQuizQuestion(chapter._id, {
//         prompt: form.prompt,
//         options: nonEmptyOptions,
//         correctAnswer: form.correctAnswer,
//         marks: form.marks,
//       });
//       setForm({
//         prompt: "",
//         options: ["", "", "", ""],
//         correctAnswer: "",
//         marks: 1,
//       });
//       await loadQuiz();
//       // alert("Question added successfully");
//     } catch (err) {
//       alert(err.response?.data?.message || "Error adding question");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-8">
//         <div className="w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-5">
//       <div className="flex items-center justify-between">
//         <h4 className="font-semibold text-gray-700 flex items-center gap-2">
//           <HelpCircle size={16} className="text-orange-500" />
//           Quiz for: {chapter.title}
//         </h4>
//         <button onClick={onDone} className="p-1.5 rounded-lg hover:bg-gray-100">
//           <X size={16} className="text-gray-400" />
//         </button>
//       </div>

//       {!quiz && (
//         <div className="text-center py-6 border-2 border-dashed rounded-xl">
//           <HelpCircle size={32} className="mx-auto text-gray-300 mb-3" />
//           <p className="text-sm text-gray-500 mb-4">
//             No quiz created yet for this chapter
//           </p>
//           <button
//             onClick={handleCreateQuiz}
//             disabled={saving}
//             className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
//           >
//             {saving ? "Creating..." : "Create Quiz"}
//           </button>
//         </div>
//       )}

//       {quiz && (
//         <div className="space-y-4">
//           {quiz.questions?.length > 0 && (
//             <div className="space-y-2">
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
//                 {quiz.questions.length} question(s) · {quiz.totalMarks} marks
//               </p>
//               {quiz.questions.map((q, idx) => (
//                 <div key={q._id} className="bg-gray-50 rounded-xl p-3 border">
//                   <p className="text-sm font-medium text-gray-700">
//                     {idx + 1}. {q.prompt}
//                   </p>
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {q.options?.map((opt, i) => (
//                       <span
//                         key={i}
//                         className={`text-xs px-3 py-1 rounded-full border ${
//                           opt === q.correctAnswer
//                             ? "bg-green-100 border-green-300 text-green-700 font-medium"
//                             : "bg-white text-gray-500"
//                         }`}
//                       >
//                         {opt}
//                         {opt === q.correctAnswer && " ✓"}
//                       </span>
//                     ))}
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1">Marks: {q.marks}</p>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="border rounded-xl p-4 space-y-3 bg-orange-50/30">
//             <p className="text-sm font-semibold text-gray-700">Add Question</p>
//             <textarea
//               rows={2}
//               placeholder="Question prompt *"
//               className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-orange-200 outline-none resize-none"
//               value={form.prompt}
//               onChange={(e) => setForm({ ...form, prompt: e.target.value })}
//             />
//             <div className="grid grid-cols-2 gap-2">
//               {form.options.map((opt, i) => (
//                 <input
//                   key={i}
//                   placeholder={`Option ${i + 1}`}
//                   className="border rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-200 outline-none"
//                   value={opt}
//                   onChange={(e) => {
//                     const next = [...form.options];
//                     next[i] = e.target.value;
//                     setForm({ ...form, options: next });
//                   }}
//                 />
//               ))}
//             </div>
//             <div className="flex gap-3">
//               <input
//                 placeholder="Correct answer (must match an option) *"
//                 className="flex-1 border rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-200 outline-none"
//                 value={form.correctAnswer}
//                 onChange={(e) =>
//                   setForm({ ...form, correctAnswer: e.target.value })
//                 }
//               />
//               <input
//                 type="number"
//                 min={1}
//                 placeholder="Marks"
//                 className="w-20 border rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-200 outline-none"
//                 value={form.marks}
//                 onChange={(e) =>
//                   setForm({ ...form, marks: Number(e.target.value) })
//                 }
//               />
//             </div>
//             <button
//               onClick={handleAddQuestion}
//               disabled={saving}
//               className="w-full bg-orange-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
//             >
//               {saving ? "Saving..." : "+ Add Question"}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// /* ──────────────────────────────────────────────────────────
//    ChapterRow
// ────────────────────────────────────────────────────────── */
// const ChapterRow = ({ chapter, index, onDelete, onRefresh }) => {
//   const [expanded, setExpanded] = useState(false);
//   const [showQuiz, setShowQuiz] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [editTitle, setEditTitle] = useState(false);
//   const [titleVal, setTitleVal] = useState(chapter.title);

//   const handleDocUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     try {
//       setUploading(true);
//       const fd = new FormData();
//       fd.append("document", file);
//       await uploadChapterDocument(chapter._id, fd);
//       onRefresh();
//     } catch (err) {
//       alert(err.response?.data?.message || "Upload failed");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleSaveTitle = async () => {
//     if (!titleVal.trim()) return;
//     try {
//       await updateChapterById(chapter._id, { title: titleVal });
//       setEditTitle(false);
//       onRefresh();
//     } catch {
//       alert("Could not update title");
//     }
//   };

//   return (
//     <div className="border rounded-2xl overflow-hidden">
//       <div
//         className="flex items-center gap-3 px-5 py-4 bg-white cursor-pointer hover:bg-gray-50"
//         onClick={() => setExpanded((v) => !v)}
//       >
//         <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
//           {index + 1}
//         </span>

//         {editTitle ? (
//           <div
//             className="flex items-center gap-2 flex-1"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <input
//               autoFocus
//               value={titleVal}
//               onChange={(e) => setTitleVal(e.target.value)}
//               className="flex-1 border rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
//             />
//             <button
//               onClick={handleSaveTitle}
//               className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"
//             >
//               <Save size={15} />
//             </button>
//             <button
//               onClick={() => {
//                 setEditTitle(false);
//                 setTitleVal(chapter.title);
//               }}
//               className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
//             >
//               <X size={15} />
//             </button>
//           </div>
//         ) : (
//           <div className="flex items-center gap-2 flex-1 min-w-0">
//             <p className="font-medium text-gray-800 truncate">
//               {chapter.title}
//             </p>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setEditTitle(true);
//               }}
//               className="p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100"
//             >
//               <Edit3 size={13} />
//             </button>
//           </div>
//         )}

//         <div className="flex items-center gap-2 ml-auto flex-shrink-0">
//           {chapter.documentUrl && (
//             <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
//               Doc ✓
//             </span>
//           )}
//           {chapter.quizId && (
//             <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
//               Quiz ✓
//             </span>
//           )}
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               if (confirm("Delete this chapter and its quiz?"))
//                 onDelete(chapter._id);
//             }}
//             className="p-1.5 rounded-lg hover:bg-red-50"
//           >
//             <Trash2 size={14} className="text-red-400" />
//           </button>
//           {expanded ? (
//             <ChevronDown size={16} className="text-gray-400" />
//           ) : (
//             <ChevronRight size={16} className="text-gray-400" />
//           )}
//         </div>
//       </div>

//       {expanded && (
//         <div className="border-t bg-gray-50 p-5 space-y-5">
//           {chapter.description && (
//             <p className="text-sm text-gray-600">{chapter.description}</p>
//           )}

//           <div className="bg-white rounded-xl border p-4 space-y-3">
//             <div className="flex items-center gap-2">
//               <FileText size={15} className="text-blue-500" />
//               <p className="text-sm font-semibold text-gray-700">
//                 Chapter Document
//               </p>
//             </div>
//             {chapter.documentUrl ? (
//               <a
//                 href={chapter.documentUrl}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="text-sm text-blue-600 hover:underline truncate block"
//               >
//                 📄 {chapter.documentName || "View Document"}
//               </a>
//             ) : (
//               <p className="text-xs text-gray-400">No document uploaded yet</p>
//             )}
//             <label className="flex items-center gap-2 cursor-pointer">
//               <span className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 font-medium flex items-center gap-1.5">
//                 <Upload size={12} />
//                 {uploading
//                   ? "Uploading..."
//                   : chapter.documentUrl
//                     ? "Replace Document"
//                     : "Upload Document"}
//               </span>
//               <input
//                 type="file"
//                 className="hidden"
//                 accept=".pdf,.doc,.docx,.ppt,.pptx"
//                 disabled={uploading}
//                 onChange={handleDocUpload}
//               />
//             </label>
//           </div>

//           <div className="bg-white rounded-xl border p-4 space-y-3">
//             {showQuiz ? (
//               <QuizBuilder
//                 chapter={chapter}
//                 onDone={() => {
//                   setShowQuiz(false);
//                   onRefresh();
//                 }}
//               />
//             ) : (
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <HelpCircle size={15} className="text-orange-500" />
//                   <p className="text-sm font-semibold text-gray-700">
//                     Chapter Quiz
//                     {chapter.quizId && (
//                       <span className="ml-2 text-xs text-green-600 font-normal">
//                         (quiz attached)
//                       </span>
//                     )}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setShowQuiz(true)}
//                   className="text-xs px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg border border-orange-200 hover:bg-orange-100 font-medium"
//                 >
//                   {chapter.quizId ? "Manage Quiz" : "Create Quiz"}
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// /* ──────────────────────────────────────────────────────────
//    Main Component: CourseDetails
// ────────────────────────────────────────────────────────── */
// export default function CourseDetails() {
//   const { id } = useParams();

//   const [course, setCourse] = useState(null);
//   const [chapters, setChapters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [publishing, setPublishing] = useState(false);
//   const [showEnrollModal, setShowEnrollModal] = useState(false);

//   const [showAddChapter, setShowAddChapter] = useState(false);
//   const [chapterForm, setChapterForm] = useState({
//     title: "",
//     description: "",
//   });
//   const [addingChapter, setAddingChapter] = useState(false);

//   const fetchAll = async () => {
//     try {
//       const [courseData, chapterData] = await Promise.all([
//         getCourseById(id),
//         getChaptersByCourse(id),
//       ]);
//       console.log(courseData);
//       setCourse(courseData);
//       setChapters(chapterData.chapters || []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAll();
//   }, [id]);

//   const handleAddChapter = async () => {
//     if (!chapterForm.title.trim()) return alert("Chapter title is required");
//     try {
//       setAddingChapter(true);
//       await createChapter({ courseId: id, ...chapterForm });
//       setChapterForm({ title: "", description: "" });
//       setShowAddChapter(false);
//       fetchAll();
//     } catch (err) {
//       alert(err.response?.data?.message || "Error creating chapter");
//     } finally {
//       setAddingChapter(false);
//     }
//   };

//   const handleDeleteChapter = async (chapterId) => {
//     try {
//       await deleteChapterById(chapterId);
//       fetchAll();
//     } catch (err) {
//       alert(err.response?.data?.message || "Error deleting chapter");
//     }
//   };

//   const handlePublish = async () => {
//     try {
//       setPublishing(true);
//       await publishCourse(id);
//       fetchAll();
//     } catch {
//       alert("Error publishing course");
//     } finally {
//       setPublishing(false);
//     }
//   };

//   if (loading) {
//     return (
//       <AdminLayout>
//         <div className="flex items-center justify-center h-60">
//           <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       </AdminLayout>
//     );
//   }

//   if (!course) {
//     return (
//       <AdminLayout>
//         <p className="text-center text-gray-500 py-20">Course not found.</p>
//       </AdminLayout>
//     );
//   }

//   const completedCount = chapters.filter((c) => c.quizId).length;

//   return (
//     <AdminLayout>
//       {/* Enroll Modal */}
//       {showEnrollModal && (
//         <EnrollStudentModal
//           courseId={id}
//           onClose={() => setShowEnrollModal(false)}
//           onSuccess={fetchAll}
//         />
//       )}

//       <div className="space-y-6 max-w-4xl mx-auto">
//         {/* ── Header ── */}
//         <div className="flex items-start justify-between gap-4">
//           <div>
//             <div className="flex items-center gap-3 mb-1">
//               <BookOpen size={22} className="text-purple-600" />
//               <h1 className="text-2xl font-bold text-gray-900">
//                 {course.title}
//               </h1>
//               <span
//                 className={`text-xs px-2.5 py-1 rounded-full font-medium ${
//                   course.status === "published"
//                     ? "bg-green-100 text-green-700"
//                     : "bg-yellow-100 text-yellow-700"
//                 }`}
//               >
//                 {course.status}
//               </span>
//             </div>
//             {course.description && (
//               <p className="text-sm text-gray-500 ml-9">{course.description}</p>
//             )}
//           </div>

//           <div className="flex items-center gap-2 flex-shrink-0">
//             {/* Enroll Student button — always visible */}
//             <button
//               onClick={() => setShowEnrollModal(true)}
//               className="flex items-center gap-2 border border-purple-300 text-purple-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-50 transition-colors"
//             >
//               <UserPlus size={15} />
//               Enroll Student
//             </button>

//             {/* Publish — only when draft */}
//             {course.status !== "published" && (
//               <button
//                 onClick={handlePublish}
//                 disabled={publishing}
//                 className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
//               >
//                 <CheckCircle size={15} />
//                 {publishing ? "Publishing..." : "Publish Course"}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* ── Stats ── */}
//         <div className="grid grid-cols-3 gap-4">
//           <Card className="text-center">
//             <p className="text-3xl font-bold text-purple-600">
//               {chapters.length}
//             </p>
//             <p className="text-xs text-gray-500 mt-1">Chapters</p>
//           </Card>
//           <Card className="text-center">
//             <p className="text-3xl font-bold text-orange-500">
//               {completedCount}
//             </p>
//             <p className="text-xs text-gray-500 mt-1">With Quiz</p>
//           </Card>
//           <Card className="text-center">
//             <p className="text-3xl font-bold text-blue-500">
//               {course.enrolledStudents?.length || 0}
//             </p>
//             <p className="text-xs text-gray-500 mt-1">Enrolled Students</p>
//           </Card>
//         </div>

//         {/* ── Chapters Section ── */}
//         <Card>
//           <div className="flex items-center justify-between mb-5">
//             <h2 className="font-semibold text-gray-800 flex items-center gap-2">
//               <BookOpen size={16} className="text-purple-500" />
//               Course Chapters
//             </h2>
//             <button
//               onClick={() => setShowAddChapter((v) => !v)}
//               className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700"
//             >
//               <Plus size={15} />
//               Add Chapter
//             </button>
//           </div>

//           {showAddChapter && (
//             <div className="mb-5 border-2 border-dashed border-purple-200 rounded-2xl p-5 bg-purple-50/30 space-y-3">
//               <p className="text-sm font-semibold text-gray-700">New Chapter</p>
//               <input
//                 placeholder="Chapter title *"
//                 className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
//                 value={chapterForm.title}
//                 onChange={(e) =>
//                   setChapterForm({ ...chapterForm, title: e.target.value })
//                 }
//               />
//               <textarea
//                 rows={2}
//                 placeholder="Description (optional)"
//                 className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 outline-none resize-none"
//                 value={chapterForm.description}
//                 onChange={(e) =>
//                   setChapterForm({
//                     ...chapterForm,
//                     description: e.target.value,
//                   })
//                 }
//               />
//               <div className="flex gap-3 justify-end">
//                 <button
//                   onClick={() => setShowAddChapter(false)}
//                   className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAddChapter}
//                   disabled={addingChapter}
//                   className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
//                 >
//                   {addingChapter ? "Adding..." : "Add Chapter"}
//                 </button>
//               </div>
//             </div>
//           )}

//           {chapters.length === 0 ? (
//             <div className="text-center py-12 border-2 border-dashed rounded-2xl">
//               <BookOpen size={36} className="mx-auto text-gray-200 mb-3" />
//               <p className="text-sm text-gray-500">No chapters yet.</p>
//               <p className="text-xs text-gray-400 mt-1">
//                 Click "Add Chapter" to create the first chapter.
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {chapters.map((chapter, idx) => (
//                 <ChapterRow
//                   key={chapter._id}
//                   chapter={chapter}
//                   index={idx}
//                   onDelete={handleDeleteChapter}
//                   onRefresh={fetchAll}
//                 />
//               ))}
//             </div>
//           )}
//         </Card>

//         {/* ── Student Flow Info ── */}
//         <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
//           <p className="font-semibold mb-1">💡 Student Flow</p>
//           <p>
//             Students see chapters in order. They must complete each chapter's
//             quiz before the next chapter unlocks. Chapters without a quiz are
//             freely accessible.
//           </p>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// }




import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  BookOpen,
  FileText,
  HelpCircle,
  CheckCircle,
  Edit3,
  X,
  Save,
  UserPlus,
  Search,
  User,
  BarChart2,
} from "lucide-react";

import AdminLayout from "../../components/layout/AdminLayout";
import {
  getCourseById,
  getChaptersByCourse,
  createChapter,
  updateChapterById,
  deleteChapterById,
  uploadChapterDocument,
  createChapterQuiz,
  addChapterQuizQuestion,
  getChapterQuiz,
  publishCourse,
  enrollStudent,
} from "../../services/courseService";
import { getAllUsers } from "../../services/adminService"; // adjust path as needed

/* ──────────────────────────────────────────────────────────
   Inline helper — simple card wrapper
────────────────────────────────────────────────────────── */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white border rounded-2xl p-5 ${className}`}>
    {children}
  </div>
);

/* ──────────────────────────────────────────────────────────
   EnrollStudentModal
   Fetches all users, lets admin search + select one,
   then calls enrollStudent API.
────────────────────────────────────────────────────────── */
const EnrollStudentModal = ({ courseId, onClose, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await getAllUsers({ role: "student" });
        // support both array and paginated { users: [] } shapes
        setUsers(Array.isArray(data) ? data : data.users || []);
      } catch (err) {
        console.error(err);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  });

  const handleSelect = (user) => {
    setSelectedUser(user);
    setDropdownOpen(false);
    setSearch("");
  };

  const handleEnroll = async () => {
    if (!selectedUser) return alert("Please select a student");
    try {
      setEnrolling(true);
      await enrollStudent(courseId, selectedUser._id);
      alert(`${selectedUser.name || "Student"} enrolled successfully!`);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <UserPlus size={16} className="text-purple-600" />
            Enroll a Student
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Student selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">
            Select Student
          </label>

          <div className="relative" ref={dropdownRef}>
            {/* Trigger */}
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="w-full flex items-center justify-between border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 outline-none bg-white hover:bg-gray-50 transition-colors"
            >
              {selectedUser ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {(selectedUser.name || "S")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="font-medium text-gray-800 truncate">
                      {selectedUser.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">
                  {loadingUsers
                    ? "Loading students…"
                    : "Search and select a student"}
                </span>
              )}
              <ChevronDown
                size={15}
                className={`text-gray-400 flex-shrink-0 ml-2 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown panel */}
            {dropdownOpen && (
              <div className="absolute z-10 mt-1.5 w-full bg-white border rounded-2xl shadow-lg overflow-hidden">
                {/* Search inside dropdown */}
                <div className="p-2 border-b">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <Search size={13} className="text-gray-400 flex-shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search by name or email…"
                      className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button onClick={() => setSearch("")}>
                        <X
                          size={12}
                          className="text-gray-400 hover:text-gray-600"
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Options list */}
                <div className="max-h-56 overflow-y-auto">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-8 gap-2">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-400">Loading…</span>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-8">
                      <User size={24} className="mx-auto text-gray-200 mb-2" />
                      <p className="text-sm text-gray-400">
                        {search
                          ? "No students match your search"
                          : "No students found"}
                      </p>
                    </div>
                  ) : (
                    filtered.map((user) => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => handleSelect(user)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left ${
                          selectedUser?._id === user._id ? "bg-purple-50" : ""
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {(user.name || "S")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {user.name || "Unnamed"}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        {selectedUser?._id === user._id && (
                          <CheckCircle
                            size={14}
                            className="text-purple-500 flex-shrink-0"
                          />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected student preview */}
        {selectedUser && (
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-purple-200 text-purple-800 text-sm font-bold flex items-center justify-center flex-shrink-0">
              {(selectedUser.name || "S")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {selectedUser.name}
              </p>
              <p className="text-xs text-purple-500 truncate">
                {selectedUser.email}
              </p>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="ml-auto p-1 rounded-lg hover:bg-purple-100"
            >
              <X size={13} className="text-purple-400" />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl border"
          >
            Cancel
          </button>
          <button
            onClick={handleEnroll}
            disabled={!selectedUser || enrolling}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <UserPlus size={14} />
            {enrolling ? "Enrolling…" : "Enroll Student"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   QuizBuilder
────────────────────────────────────────────────────────── */
const QuizBuilder = ({ chapter, onDone }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    prompt: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
  });

  useEffect(() => {
    loadQuiz();
  }, [chapter._id]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const { quiz: q } = await getChapterQuiz(chapter._id);
      setQuiz(q);
    } catch {
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async () => {
    try {
      setSaving(true);
      const { quiz: q } = await createChapterQuiz(chapter._id, {
        title: `${chapter.title} – Quiz`,
      });
      setQuiz(q);
    } catch (err) {
      alert(err.response?.data?.message || "Error creating quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!form.prompt || !form.correctAnswer) {
      return alert("Question prompt and correct answer are required");
    }
    const nonEmptyOptions = form.options.filter((o) => o.trim() !== "");
    if (nonEmptyOptions.length < 2) {
      return alert("Provide at least 2 options");
    }
    try {
      setSaving(true);
      await addChapterQuizQuestion(chapter._id, {
        prompt: form.prompt,
        options: nonEmptyOptions,
        correctAnswer: form.correctAnswer,
        marks: form.marks,
      });
      setForm({
        prompt: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        marks: 1,
      });
      await loadQuiz();
      // alert("Question added successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Error adding question");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
          <HelpCircle size={16} className="text-orange-500" />
          Quiz for: {chapter.title}
        </h4>
        <button onClick={onDone} className="p-1.5 rounded-lg hover:bg-gray-100">
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      {!quiz && (
        <div className="text-center py-6 border-2 border-dashed rounded-xl">
          <HelpCircle size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500 mb-4">
            No quiz created yet for this chapter
          </p>
          <button
            onClick={handleCreateQuiz}
            disabled={saving}
            className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Quiz"}
          </button>
        </div>
      )}

      {quiz && (
        <div className="space-y-4">
          {quiz.questions?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {quiz.questions.length} question(s) · {quiz.totalMarks} marks
              </p>
              {quiz.questions.map((q, idx) => (
                <div key={q._id} className="bg-gray-50 rounded-xl p-3 border">
                  <p className="text-sm font-medium text-gray-700">
                    {idx + 1}. {q.prompt}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {q.options?.map((opt, i) => (
                      <span
                        key={i}
                        className={`text-xs px-3 py-1 rounded-full border ${
                          opt === q.correctAnswer
                            ? "bg-green-100 border-green-300 text-green-700 font-medium"
                            : "bg-white text-gray-500"
                        }`}
                      >
                        {opt}
                        {opt === q.correctAnswer && " ✓"}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Marks: {q.marks}</p>
                </div>
              ))}
            </div>
          )}

          <div className="border rounded-xl p-4 space-y-3 bg-orange-50/30">
            <p className="text-sm font-semibold text-gray-700">Add Question</p>
            <textarea
              rows={2}
              placeholder="Question prompt *"
              className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-orange-200 outline-none resize-none"
              value={form.prompt}
              onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              {form.options.map((opt, i) => (
                <input
                  key={i}
                  placeholder={`Option ${i + 1}`}
                  className="border rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                  value={opt}
                  onChange={(e) => {
                    const next = [...form.options];
                    next[i] = e.target.value;
                    setForm({ ...form, options: next });
                  }}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <input
                placeholder="Correct answer (must match an option) *"
                className="flex-1 border rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                value={form.correctAnswer}
                onChange={(e) =>
                  setForm({ ...form, correctAnswer: e.target.value })
                }
              />
              <input
                type="number"
                min={1}
                placeholder="Marks"
                className="w-20 border rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                value={form.marks}
                onChange={(e) =>
                  setForm({ ...form, marks: Number(e.target.value) })
                }
              />
            </div>
            <button
              onClick={handleAddQuestion}
              disabled={saving}
              className="w-full bg-orange-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {saving ? "Saving..." : "+ Add Question"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   ChapterRow
────────────────────────────────────────────────────────── */
const ChapterRow = ({ chapter, index, onDelete, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(chapter.title);

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("document", file);
      await uploadChapterDocument(chapter._id, fd);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!titleVal.trim()) return;
    try {
      await updateChapterById(chapter._id, { title: titleVal });
      setEditTitle(false);
      onRefresh();
    } catch {
      alert("Could not update title");
    }
  };

  return (
    <div className="border rounded-2xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-5 py-4 bg-white cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>

        {editTitle ? (
          <div
            className="flex items-center gap-2 flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={titleVal}
              onChange={(e) => setTitleVal(e.target.value)}
              className="flex-1 border rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
            />
            <button
              onClick={handleSaveTitle}
              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"
            >
              <Save size={15} />
            </button>
            <button
              onClick={() => {
                setEditTitle(false);
                setTitleVal(chapter.title);
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <p className="font-medium text-gray-800 truncate">
              {chapter.title}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditTitle(true);
              }}
              className="p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100"
            >
              <Edit3 size={13} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {chapter.documentUrl && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
              Doc ✓
            </span>
          )}
          {chapter.quizId && (
            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
              Quiz ✓
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this chapter and its quiz?"))
                onDelete(chapter._id);
            }}
            className="p-1.5 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={14} className="text-red-400" />
          </button>
          {expanded ? (
            <ChevronDown size={16} className="text-gray-400" />
          ) : (
            <ChevronRight size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t bg-gray-50 p-5 space-y-5">
          {chapter.description && (
            <p className="text-sm text-gray-600">{chapter.description}</p>
          )}

          <div className="bg-white rounded-xl border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-blue-500" />
              <p className="text-sm font-semibold text-gray-700">
                Chapter Document
              </p>
            </div>
            {chapter.documentUrl ? (
              <a
                href={chapter.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline truncate block"
              >
                📄 {chapter.documentName || "View Document"}
              </a>
            ) : (
              <p className="text-xs text-gray-400">No document uploaded yet</p>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 font-medium flex items-center gap-1.5">
                <Upload size={12} />
                {uploading
                  ? "Uploading..."
                  : chapter.documentUrl
                    ? "Replace Document"
                    : "Upload Document"}
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                disabled={uploading}
                onChange={handleDocUpload}
              />
            </label>
          </div>

          <div className="bg-white rounded-xl border p-4 space-y-3">
            {showQuiz ? (
              <QuizBuilder
                chapter={chapter}
                onDone={() => {
                  setShowQuiz(false);
                  onRefresh();
                }}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle size={15} className="text-orange-500" />
                  <p className="text-sm font-semibold text-gray-700">
                    Chapter Quiz
                    {chapter.quizId && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        (quiz attached)
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="text-xs px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg border border-orange-200 hover:bg-orange-100 font-medium"
                >
                  {chapter.quizId ? "Manage Quiz" : "Create Quiz"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   Main Component: CourseDetails
────────────────────────────────────────────────────────── */
export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const [showAddChapter, setShowAddChapter] = useState(false);
  const [chapterForm, setChapterForm] = useState({
    title: "",
    description: "",
  });
  const [addingChapter, setAddingChapter] = useState(false);

  const fetchAll = async () => {
    try {
      const [courseData, chapterData] = await Promise.all([
        getCourseById(id),
        getChaptersByCourse(id),
      ]);
      console.log(courseData);
      setCourse(courseData);
      setChapters(chapterData.chapters || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const handleAddChapter = async () => {
    if (!chapterForm.title.trim()) return alert("Chapter title is required");
    try {
      setAddingChapter(true);
      await createChapter({ courseId: id, ...chapterForm });
      setChapterForm({ title: "", description: "" });
      setShowAddChapter(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating chapter");
    } finally {
      setAddingChapter(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      await deleteChapterById(chapterId);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting chapter");
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await publishCourse(id);
      fetchAll();
    } catch {
      alert("Error publishing course");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-60">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!course) {
    return (
      <AdminLayout>
        <p className="text-center text-gray-500 py-20">Course not found.</p>
      </AdminLayout>
    );
  }

  const completedCount = chapters.filter((c) => c.quizId).length;

  return (
    <AdminLayout>
      {/* Enroll Modal */}
      {showEnrollModal && (
        <EnrollStudentModal
          courseId={id}
          onClose={() => setShowEnrollModal(false)}
          onSuccess={fetchAll}
        />
      )}

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <BookOpen size={22} className="text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {course.title}
              </h1>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  course.status === "published"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {course.status}
              </span>
            </div>
            {course.description && (
              <p className="text-sm text-gray-500 ml-9">{course.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Enrollments & Progress button */}
            <button
              onClick={() => navigate(`/admin/courses/${id}/enrollments`)}
              className="flex items-center gap-2 border border-blue-300 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              <BarChart2 size={15} />
              Enrollments &amp; Progress
            </button>

            {/* Enroll Student button — always visible */}
            <button
              onClick={() => setShowEnrollModal(true)}
              className="flex items-center gap-2 border border-purple-300 text-purple-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-50 transition-colors"
            >
              <UserPlus size={15} />
              Enroll Student
            </button>

            {/* Publish — only when draft */}
            {course.status !== "published" && (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                <CheckCircle size={15} />
                {publishing ? "Publishing..." : "Publish Course"}
              </button>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {chapters.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Chapters</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-orange-500">
              {completedCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">With Quiz</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-blue-500">
              {course.enrolledStudents?.length || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Enrolled Students</p>
          </Card>
        </div>

        {/* ── Chapters Section ── */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen size={16} className="text-purple-500" />
              Course Chapters
            </h2>
            <button
              onClick={() => setShowAddChapter((v) => !v)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700"
            >
              <Plus size={15} />
              Add Chapter
            </button>
          </div>

          {showAddChapter && (
            <div className="mb-5 border-2 border-dashed border-purple-200 rounded-2xl p-5 bg-purple-50/30 space-y-3">
              <p className="text-sm font-semibold text-gray-700">New Chapter</p>
              <input
                placeholder="Chapter title *"
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                value={chapterForm.title}
                onChange={(e) =>
                  setChapterForm({ ...chapterForm, title: e.target.value })
                }
              />
              <textarea
                rows={2}
                placeholder="Description (optional)"
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                value={chapterForm.description}
                onChange={(e) =>
                  setChapterForm({
                    ...chapterForm,
                    description: e.target.value,
                  })
                }
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowAddChapter(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddChapter}
                  disabled={addingChapter}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                >
                  {addingChapter ? "Adding..." : "Add Chapter"}
                </button>
              </div>
            </div>
          )}

          {chapters.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-2xl">
              <BookOpen size={36} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">No chapters yet.</p>
              <p className="text-xs text-gray-400 mt-1">
                Click "Add Chapter" to create the first chapter.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter, idx) => (
                <ChapterRow
                  key={chapter._id}
                  chapter={chapter}
                  index={idx}
                  onDelete={handleDeleteChapter}
                  onRefresh={fetchAll}
                />
              ))}
            </div>
          )}
        </Card>

        {/* ── Student Flow Info ── */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">💡 Student Flow</p>
          <p>
            Students see chapters in order. They must complete each chapter's
            quiz before the next chapter unlocks. Chapters without a quiz are
            freely accessible.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
