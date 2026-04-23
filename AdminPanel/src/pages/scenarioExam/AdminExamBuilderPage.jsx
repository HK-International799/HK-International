import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Save,
  Send,
  Loader2,
  FileText,
  CheckCircle2,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import ScenarioEditor from "../../components/ScenarioExam/ScenarioEditor";
import {
  createScenarioExam,
  updateScenarioExam,
  getAdminExamDetails,
  addScenario,
  updateScenario,
  deleteScenario,
  publishScenarioExam,
} from "../../services/scenarioExamService";

export default function AdminExamBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  /* ── Exam state ─────────────────────────────────────────── */
  const [exam, setExam] = useState({
    title: "",
    description: "",
    duration: 60,
    passingScore: 0,
    allowReattempt: false,
    status: "draft",
  });
  const [scenarios, setScenarios] = useState([]);
  const [examId, setExamId] = useState(id || null);

  /* ── UI state ───────────────────────────────────────────── */
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [addingIdx, setAddingIdx] = useState(null); // which new-scenario is saving
  const [showNewScenario, setShowNewScenario] = useState(false);

  /* ── Load exam for edit ──────────────────────────────────── */
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await getAdminExamDetails(id);
        const d = res.data;
        setExam({
          title: d.exam.title,
          description: d.exam.description,
          duration: d.exam.duration,
          passingScore: d.exam.passingScore,
          allowReattempt: d.exam.allowReattempt,
          status: d.exam.status,
        });
        setScenarios(d.questions || []);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load exam");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  /* ── Save exam metadata ─────────────────────────────────── */
  const handleSaveExam = async () => {
    setErr("");
    if (!exam.title.trim()) return setErr("Title is required");
    if (!exam.duration || exam.duration < 1)
      return setErr("Duration must be at least 1 minute");

    setSaving(true);
    try {
      if (isEdit) {
        await updateScenarioExam(id, exam);
        flash("Exam details saved.");
      } else {
        const res = await createScenarioExam(exam);
        const newId = res.data._id;
        setExamId(newId);
        flash("Exam created! You can now add scenarios.");
        navigate(`/admin/scenario-exams/${newId}/edit`, { replace: true });
      }
    } catch (e) {
      setErr(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ── Add new scenario ───────────────────────────────────── */
  const handleAddScenario = async (data) => {
    if (!examId) {
      setErr("Save the exam first before adding scenarios.");
      return;
    }
    setAddingIdx("new");
    try {
      const res = await addScenario(examId, {
        ...data,
        questionNumber: scenarios.length + 1,
      });
      setScenarios((prev) => [...prev, res.data]);
      setShowNewScenario(false);
      flash("Scenario added.");
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to add scenario");
    } finally {
      setAddingIdx(null);
    }
  };

  /* ── Update existing scenario ───────────────────────────── */
  const handleUpdateScenario = async (qId, data) => {
    setAddingIdx(qId);
    try {
      const res = await updateScenario(qId, data);
      setScenarios((prev) =>
        prev.map((q) => (q._id === qId ? res.data : q))
      );
      flash("Scenario updated.");
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to update scenario");
    } finally {
      setAddingIdx(null);
    }
  };

  /* ── Delete scenario ────────────────────────────────────── */
  const handleDeleteScenario = async (qId) => {
    if (
      !window.confirm(
        "Delete this scenario? The associated PDF will also be removed from Cloudinary."
      )
    )
      return;
    try {
      await deleteScenario(qId);
      setScenarios((prev) => prev.filter((q) => q._id !== qId));
      flash("Scenario deleted.");
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to delete scenario");
    }
  };

  /* ── Publish ────────────────────────────────────────────── */
  const handlePublish = async () => {
    if (!examId) return;
    if (scenarios.length === 0) {
      setErr("Add at least one scenario before publishing.");
      return;
    }
    if (
      !window.confirm(
        "Publish this exam? Students will be able to see and attempt it."
      )
    )
      return;
    setPublishing(true);
    try {
      await publishScenarioExam(examId);
      setExam((prev) => ({ ...prev, status: "published" }));
      flash("Exam published successfully!");
    } catch (e) {
      setErr(e.response?.data?.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  /* ── Loading ────────────────────────────────────────────── */
  if (loading) {
    return (
      <AdminLayout>
        <div className="p-10 flex items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={20} /> Loading exam…
        </div>
      </AdminLayout>
    );
  }

  const isDraft = exam.status === "draft";
  const isPublished = exam.status === "published";

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* ── Nav ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/scenario-exams")}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Back to exams
          </button>

          <div className="flex items-center gap-2">
            {isPublished && (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                <CheckCircle2 size={12} /> Published
              </span>
            )}
            {isDraft && examId && scenarios.length > 0 && (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm rounded-md px-4 py-2 font-medium"
              >
                {publishing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {publishing ? "Publishing…" : "Publish Exam"}
              </button>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900">
          {isEdit ? "Edit Scenario Exam" : "Create Scenario Exam"}
        </h1>

        {/* ── Alerts ── */}
        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
            {err}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <CheckCircle2 size={14} /> {successMsg}
          </div>
        )}

        {/* ── Exam Details ── */}
        <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-gray-800">Exam Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-indigo-400 outline-none"
                placeholder="e.g. Case Study Exam – Q2 2025"
                value={exam.title}
                onChange={(e) => setExam({ ...exam, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-indigo-400 outline-none"
                value={exam.duration}
                onChange={(e) =>
                  setExam({ ...exam, duration: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Passing Score
              </label>
              <input
                type="number"
                min="0"
                className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-indigo-400 outline-none"
                value={exam.passingScore}
                onChange={(e) =>
                  setExam({ ...exam, passingScore: Number(e.target.value) })
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Description (optional)
              </label>
              <textarea
                rows={2}
                className="w-full border rounded-lg p-2.5 text-sm resize-none focus:ring-1 focus:ring-indigo-400 outline-none"
                placeholder="Brief description of the exam (optional)"
                value={exam.description}
                onChange={(e) =>
                  setExam({ ...exam, description: e.target.value })
                }
              />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-indigo-600"
                checked={!!exam.allowReattempt}
                onChange={(e) =>
                  setExam({ ...exam, allowReattempt: e.target.checked })
                }
              />
              Allow reattempt by default
            </label>
          </div>

          <button
            onClick={handleSaveExam}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm rounded-lg px-5 py-2.5 font-medium transition-colors"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Exam"}
          </button>
        </div>

        {/* ── Scenarios Section ── */}
        {examId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText size={16} className="text-indigo-500" />
                Scenario Blocks
                <span className="text-xs text-gray-400 font-normal">
                  ({scenarios.length} scenario{scenarios.length !== 1 ? "s" : ""})
                </span>
              </h2>
            </div>

            <p className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              Each scenario block contains a <strong>PDF file</strong> and one
              or more questions. Students will read the PDF and answer the
              questions below it.
            </p>

            {scenarios.length === 0 && !showNewScenario && (
              <div className="border-2 border-dashed rounded-xl p-8 text-center text-gray-400">
                <FileText size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No scenarios yet.</p>
                <p className="text-xs mt-1">
                  Add your first scenario PDF and questions below.
                </p>
              </div>
            )}

            {/* Existing scenarios */}
            {scenarios.map((sc, idx) => (
              <ScenarioEditor
                key={sc._id}
                examId={examId}
                scenario={sc}
                scenarioIndex={idx}
                onSave={(data) => handleUpdateScenario(sc._id, data)}
                onDelete={() => handleDeleteScenario(sc._id)}
                saving={addingIdx === sc._id}
              />
            ))}

            {/* New scenario form */}
            {showNewScenario ? (
              <div>
                <ScenarioEditor
                  key={`new-${scenarios.length}`}
                  examId={examId}
                  scenario={{}}
                  scenarioIndex={scenarios.length}
                  onSave={handleAddScenario}
                  saving={addingIdx === "new"}
                />
                <button
                  onClick={() => setShowNewScenario(false)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewScenario(true)}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 rounded-xl py-3 text-sm font-medium transition-colors"
              >
                <Plus size={16} /> Add Scenario
              </button>
            )}
          </div>
        )}

        {/* Hint if exam not saved yet */}
        {!examId && (
          <p className="text-xs text-gray-400 text-center">
            Save the exam details above to start adding scenarios.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}





// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { ArrowLeft, Plus, Save } from "lucide-react";
// import AdminLayout from "../../components/layout/AdminLayout";
// import QuestionEditor from "../../components/ScenarioExam/QuestionEditor";
// import {
//   createScenarioExam,
//   updateScenarioExam,
//   getScenarioExamDetails,
//   addScenarioQuestion,
//   updateScenarioQuestion,
//   deleteScenarioQuestion,
// } from "../../services/scenarioExamService";

// export default function AdminExamBuilderPage() {
//   const { id } = useParams(); // undefined when creating
//   const navigate = useNavigate();
//   const isEdit = Boolean(id);

//   const [exam, setExam] = useState({
//     title: "",
//     description: "",
//     duration: 60,
//     passingScore: 0,
//     allowReattempt: false,
//     status: "draft",
//   });
//   const [questions, setQuestions] = useState([]);
//   const [examId, setExamId] = useState(id || null);
//   const [loading, setLoading] = useState(isEdit);
//   const [saving, setSaving] = useState(false);
//   const [err, setErr] = useState("");
//   const [adding, setAdding] = useState(false);

//   useEffect(() => {
//     if (!isEdit) return;
//     (async () => {
//       try {
//         const res = await getScenarioExamDetails(id);
//         const data = res.data;
//         setExam({
//           title: data.exam.title,
//           description: data.exam.description,
//           duration: data.exam.duration,
//           passingScore: data.exam.passingScore,
//           allowReattempt: data.exam.allowReattempt,
//           status: data.exam.status,
//         });
//         setQuestions(data.questions || []);
//       } catch (e) {
//         setErr(e.response?.data?.message || "Failed to load exam");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [id, isEdit]);

//   const handleSaveExam = async () => {
//     setErr("");
//     if (!exam.title.trim()) return setErr("Title is required");
//     if (!exam.duration || exam.duration < 1)
//       return setErr("Duration must be at least 1 minute");

//     setSaving(true);
//     try {
//       if (isEdit) {
//         await updateScenarioExam(id, exam);
//       } else {
//         const res = await createScenarioExam(exam);
//         setExamId(res.data._id);
//         navigate(`/admin/scenario-exams/${res.data._id}/edit`, {
//           replace: true,
//         });
//       }
//     } catch (e) {
//       setErr(e.response?.data?.message || "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleAddQuestion = async (data) => {
//     if (!examId) {
//       alert("Please save the exam first before adding questions.");
//       return;
//     }
//     setAdding(true);
//     try {
//       const res = await addScenarioQuestion(examId, data);
//       setQuestions((prev) => [...prev, res.data]);
//     } catch (e) {
//       alert(e.response?.data?.message || "Failed to add question");
//     } finally {
//       setAdding(false);
//     }
//   };

//   const handleUpdateQuestion = async (qId, data) => {
//     try {
//       const res = await updateScenarioQuestion(qId, data);
//       setQuestions((prev) => prev.map((q) => (q._id === qId ? res.data : q)));
//     } catch (e) {
//       alert(e.response?.data?.message || "Failed to update question");
//     }
//   };

//   const handleDeleteQuestion = async (qId) => {
//     if (!confirm("Delete this question?")) return;
//     try {
//       await deleteScenarioQuestion(qId);
//       setQuestions((prev) => prev.filter((q) => q._id !== qId));
//     } catch (e) {
//       alert(e.response?.data?.message || "Failed to delete");
//     }
//   };

//   if (loading) {
//     return (
//       <AdminLayout>
//         <div className="p-6 text-gray-500">Loading…</div>
//       </AdminLayout>
//     );
//   }

//   return (
//     <AdminLayout>
//       <div className="p-6 space-y-5">
//         <button
//           onClick={() => navigate("/admin/scenario-exams")}
//           className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
//         >
//           <ArrowLeft size={14} /> Back to exams
//         </button>

//         <h1 className="text-2xl font-semibold text-gray-800">
//           {isEdit ? "Edit Scenario Exam" : "Create Scenario Exam"}
//         </h1>

//         {err && (
//           <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md">
//             {err}
//           </div>
//         )}

//         {/* Exam basic info */}
//         <div className="bg-white border rounded-lg p-5 space-y-3">
//           <h2 className="font-medium text-gray-800">Exam Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs text-gray-500">Title</label>
//               <input
//                 className="w-full border rounded-md p-2 text-sm"
//                 value={exam.title}
//                 onChange={(e) => setExam({ ...exam, title: e.target.value })}
//               />
//             </div>
//             <div>
//               <label className="text-xs text-gray-500">
//                 Duration (minutes)
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 className="w-full border rounded-md p-2 text-sm"
//                 value={exam.duration}
//                 onChange={(e) =>
//                   setExam({ ...exam, duration: Number(e.target.value) })
//                 }
//               />
//             </div>
//             <div>
//               <label className="text-xs text-gray-500">Passing Score</label>
//               <input
//                 type="number"
//                 min="0"
//                 className="w-full border rounded-md p-2 text-sm"
//                 value={exam.passingScore}
//                 onChange={(e) =>
//                   setExam({ ...exam, passingScore: Number(e.target.value) })
//                 }
//               />
//             </div>
//             <label className="flex items-center gap-2 mt-6 text-sm">
//               <input
//                 type="checkbox"
//                 checked={!!exam.allowReattempt}
//                 onChange={(e) =>
//                   setExam({ ...exam, allowReattempt: e.target.checked })
//                 }
//               />
//               Allow reattempt by default
//             </label>
//           </div>
//           <div>
//             <label className="text-xs text-gray-500">Description</label>
//             <textarea
//               rows={3}
//               className="w-full border rounded-md p-2 text-sm"
//               value={exam.description}
//               onChange={(e) =>
//                 setExam({ ...exam, description: e.target.value })
//               }
//             />
//           </div>
//           <button
//             onClick={handleSaveExam}
//             disabled={saving}
//             className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md px-4 py-2 disabled:opacity-60"
//           >
//             <Save size={14} /> {saving ? "Saving…" : "Save Exam"}
//           </button>
//         </div>

//         {/* Questions */}
//         {examId && (
//           <div className="bg-white border rounded-lg p-5 space-y-4">
//             <div className="flex items-center justify-between">
//               <h2 className="font-medium text-gray-800">
//                 Questions ({questions.length})
//               </h2>
//             </div>

//             {questions.length === 0 && (
//               <div className="text-sm text-gray-500 border border-dashed rounded-md p-4 text-center">
//                 No questions yet. Add your first question below.
//               </div>
//             )}

//             <div className="space-y-3">
//               {questions.map((q) => (
//                 <QuestionEditor
//                   key={q._id}
//                   question={q}
//                   onSave={(data) => handleUpdateQuestion(q._id, data)}
//                   onDelete={() => handleDeleteQuestion(q._id)}
//                 />
//               ))}
//             </div>

//             <div className="border-t pt-4">
//               <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                 <Plus size={14} /> Add a new question
//               </h3>
//               <QuestionEditor
//                 key={`new-${questions.length}`}
//                 question={{ questionNumber: questions.length + 1 }}
//                 onSave={handleAddQuestion}
//                 saving={adding}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </AdminLayout>
//   );
// }
