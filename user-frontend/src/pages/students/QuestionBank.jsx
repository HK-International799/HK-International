import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import { getQuestionBanks, getQuestionBankById } from "../../services/studentService";

export default function QuestionBank() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankDetail, setBankDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showAnswers, setShowAnswers] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const data = await getQuestionBanks();
        setBanks(Array.isArray(data) ? data : []);
      } catch {
        setBanks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  const handleSelectBank = async (bank) => {
    if (selectedBank?._id === bank._id) {
      setSelectedBank(null);
      setBankDetail(null);
      return;
    }
    setSelectedBank(bank);
    setDetailLoading(true);
    setShowAnswers({});
    setSelectedAnswers({});
    try {
      const data = await getQuestionBankById(bank._id);
      setBankDetail(data);
    } catch {
      setBankDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleAnswer = (qId) => {
    setShowAnswers((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const selectOption = (qId, opt) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: opt }));
  };

  const filtered = banks.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.courseId?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-orange-500" />
            Question bank
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Practice questions to prepare for your assessments
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search question banks..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700">No question banks available</h3>
            <p className="text-sm text-gray-400 mt-1">
              Question banks will appear here when your tutors create them.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((bank, i) => (
              <motion.div
                key={bank._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {/* Bank Header */}
                <button
                  onClick={() => handleSelectBank(bank)}
                  className={`w-full bg-white rounded-2xl shadow-sm border text-left transition-all hover:shadow-md ${
                    selectedBank?._id === bank._id
                      ? "border-orange-300 ring-1 ring-orange-100"
                      : "border-gray-100 hover:border-orange-100"
                  }`}
                >
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-orange-400 flex items-center justify-center text-white flex-shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">{bank.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        {bank.courseId?.title && <span>{bank.courseId.title}</span>}
                        {bank.questions?.length > 0 && (
                          <span>{bank.questions.length} questions</span>
                        )}
                        {bank.createdBy?.name && <span>by {bank.createdBy.name}</span>}
                      </div>
                    </div>
                    <div className={`p-1.5 rounded-lg transition ${selectedBank?._id === bank._id ? "bg-orange-100" : "bg-gray-100"}`}>
                      {selectedBank?._id === bank._id ? (
                        <ChevronUp className="w-4 h-4 text-orange-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Questions */}
                <AnimatePresence>
                  {selectedBank?._id === bank._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                        {detailLoading ? (
                          <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                          </div>
                        ) : bankDetail?.questions?.length > 0 ? (
                          bankDetail.questions.map((q, qi) => (
                            <div key={q._id || qi} className="p-5">
                              <div className="flex items-start gap-3">
                                <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                  {qi + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                    {q.questionText || q.text || "Question"}
                                  </p>
                                  {q.marks && (
                                    <span className="text-xs text-gray-400 mt-1 inline-block">
                                      {q.marks} marks
                                    </span>
                                  )}

                                  {/* MCQ Options */}
                                  {q.options?.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      {q.options.map((opt, oi) => {
                                        const isSelected = selectedAnswers[q._id] === opt;
                                        const isCorrect = showAnswers[q._id] && opt === q.correctAnswer;
                                        const isWrong = showAnswers[q._id] && isSelected && opt !== q.correctAnswer;

                                        return (
                                          <button
                                            key={oi}
                                            onClick={() => !showAnswers[q._id] && selectOption(q._id, opt)}
                                            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm transition ${
                                              isCorrect
                                                ? "border-green-300 bg-green-50 text-green-700"
                                                : isWrong
                                                ? "border-red-300 bg-red-50 text-red-700"
                                                : isSelected
                                                ? "border-orange-300 bg-orange-50 text-orange-700"
                                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                                            }`}
                                          >
                                            <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                              ${isCorrect ? 'border-green-500' : isWrong ? 'border-red-500' : isSelected ? 'border-orange-500' : 'border-gray-300'}
                                            ">
                                              {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                              {isWrong && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                                              {isSelected && !showAnswers[q._id] && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                              )}
                                            </span>
                                            {opt}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Toggle Answer */}
                                  <button
                                    onClick={() => toggleAnswer(q._id)}
                                    className="mt-3 flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
                                  >
                                    {showAnswers[q._id] ? (
                                      <>
                                        <EyeOff className="w-3.5 h-3.5" /> Hide answer
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-3.5 h-3.5" /> Show answer
                                      </>
                                    )}
                                  </button>

                                  {showAnswers[q._id] && q.correctAnswer && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="mt-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200"
                                    >
                                      <p className="text-xs font-semibold text-green-700">
                                        Correct answer: {q.correctAnswer}
                                      </p>
                                      {q.explanation && (
                                        <p className="text-xs text-green-600 mt-1">{q.explanation}</p>
                                      )}
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-sm text-gray-400">No questions in this bank yet</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
