import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  ChevronLeft,
  MessageCircle,
  Users,
  Check,
  CheckCheck,
  Loader2,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getMessages, sendMessage } from "../../services/studentService";
import { getStudentCourses } from "../../services/studentService";

export default function Chat() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  const fetchMessages = useCallback(async (courseId) => {
    try {
      const data = await getMessages(courseId);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchMessages(selectedCourse._id);
      const interval = setInterval(() => fetchMessages(selectedCourse._id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedCourse, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedCourse) return;
    setSending(true);
    try {
      await sendMessage({
        courseId: selectedCourse._id,
        content: newMessage.trim(),
      });
      setNewMessage("");
      await fetchMessages(selectedCourse._id);
      inputRef.current?.focus();
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-80px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex">
        {/* Course List Sidebar */}
        <div
          className={`w-80 border-r border-gray-100 flex flex-col bg-gray-50/50 ${
            showMobileList ? "flex" : "hidden md:flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5 text-orange-500" />
              Messages
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
              />
            </div>
          </div>

          {/* Course List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">No courses found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Enroll in courses to start messaging
                </p>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <button
                  key={course._id}
                  onClick={() => {
                    setSelectedCourse(course);
                    setShowMobileList(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-white ${
                    selectedCourse?._id === course._id
                      ? "bg-white border-l-2 border-orange-500"
                      : "border-l-2 border-transparent"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {course.title?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {course.assignedTutor?.name || "Course chat"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!showMobileList ? "flex" : "hidden md:flex"}`}>
          {selectedCourse ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => setShowMobileList(true)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-orange-400 flex items-center justify-center text-white font-bold text-xs">
                  {selectedCourse.title?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {selectedCourse.title}
                  </p>
                  <p className="text-xs text-green-500 font-medium">
                    {selectedCourse.assignedTutor?.name || "Group chat"}
                  </p>
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/30">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-orange-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">
                      No messages yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">
                      Start the conversation! Ask questions about the course or discuss with your peers.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMine = msg.senderId?._id === user?.id || msg.senderId === user?.id;
                    return (
                      <motion.div
                        key={msg._id || i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMine
                              ? "bg-orange-500 text-white rounded-br-md"
                              : "bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm"
                          }`}
                        >
                          {!isMine && (
                            <p className="text-xs font-semibold text-indigo-600 mb-1">
                              {msg.senderId?.name || "User"}
                            </p>
                          )}
                          <p className="leading-relaxed">{msg.content}</p>
                          <div
                            className={`flex items-center gap-1 mt-1 ${
                              isMine ? "justify-end" : ""
                            }`}
                          >
                            <span
                              className={`text-[10px] ${
                                isMine ? "text-white/70" : "text-gray-400"
                              }`}
                            >
                              {formatTime(msg.timestamp || msg.createdAt)}
                            </span>
                            {isMine && (
                              <CheckCheck
                                className={`w-3 h-3 ${
                                  msg.isRead ? "text-blue-200" : "text-white/50"
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-100 bg-white">
                <div className="flex items-end gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
                      style={{ maxHeight: "120px" }}
                    />
                  </div>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400">
                    <Smile className="w-5 h-5" />
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className={`p-2.5 rounded-xl transition-all ${
                      newMessage.trim()
                        ? "bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-100 to-indigo-100 flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Your messages</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-sm">
                Select a course from the sidebar to view or start a conversation with your tutors and peers.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
