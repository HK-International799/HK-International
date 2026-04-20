import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import {
  Send,
  MessageSquare,
  BookOpen,
  ChevronRight,
  Search,
} from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getMessages, sendMessage } from "../../services/messageService";
import { getStudentCourses } from "../../services/studentService";

/* ─── Helpers ─── */
const formatTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  return isToday
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" }) +
        " " +
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const ROLE_COLORS = {
  admin: "bg-red-50 text-red-500 ring-red-200",
  tutor: "bg-violet-50 text-violet-600 ring-violet-200",
  student: "bg-blue-50 text-blue-600 ring-blue-200",
};

/* ─── Avatar ─── */
function Avatar({ name = "", role, size = 34 }) {
  const colorClass =
    ROLE_COLORS[role] || "bg-gray-100 text-gray-500 ring-gray-200";
  const sizeStyle = { width: size, height: size, fontSize: size * 0.35 };
  return (
    <div
      style={sizeStyle}
      className={`rounded-full ring-2 flex items-center justify-center font-bold flex-shrink-0 select-none ${colorClass}`}
    >
      {getInitials(name)}
    </div>
  );
}

/* ─── Typing Indicator ─── */
function TypingIndicator({ typers }) {
  if (!typers.length) return null;
  const label =
    typers.length === 1
      ? `${typers[0]} is typing`
      : `${typers.join(", ")} are typing`;
  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{ animationDelay: `${i * 0.12}s` }}
            className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block animate-bounce"
          />
        ))}
      </div>
      <span className="text-xs text-gray-400 italic">{label}...</span>
    </div>
  );
}

/* ─── Date divider ─── */
function DateDivider({ date }) {
  const label = (() => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isToday) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  })();
  return (
    <div className="flex items-center justify-center my-4">
      <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
        {label}
      </span>
    </div>
  );
}

/* ─── Group messages by date ─── */
const groupByDate = (messages) => {
  const groups = [];
  let lastDate = null;
  for (const msg of messages) {
    const dateStr = new Date(msg.createdAt).toDateString();
    if (dateStr !== lastDate) {
      groups.push({ type: "date", date: msg.createdAt, id: `date-${dateStr}` });
      lastDate = dateStr;
    }
    groups.push({ type: "message", ...msg });
  }
  return groups;
};

/* ─── MAIN COMPONENT ─── */
export default function Chat() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [courses, setCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typers, setTypers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const socketRef = useRef(null);
  const msgEndRef = useRef(null);
  const inputRef = useRef(null);
  const currentRoom = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* ─── Load courses ─── */
  useEffect(() => {
    getStudentCourses().then((res) =>
      setCourses(Array.isArray(res) ? res : []),
    );
  }, []);

  /* ─── Socket init ─── */
  useEffect(() => {
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    socketRef.current = io(baseURL.replace("/api", ""), {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);

      if (userId) {
        socketRef.current.emit("user:online", {
          userId,
          role: user?.role, // ✅ FIXED
        });
      }
    });

    socketRef.current.on("disconnect", () => setIsConnected(false));

    socketRef.current.on("notification", (data) => {
      console.log("🔔 Notification:", data);
      setNotifications((prev) => [data, ...prev]);
      if (document.hidden && Notification.permission === "granted") {
        new Notification(data.title || "New Notification", {
          body: data.message,
        });
      }
    });

    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  /* ─── Fetch messages ─── */
  const fetchMessages = useCallback(async (courseId) => {
    setLoading(true);
    setIsBlocked(false);
    try {
      const data = await getMessages({ courseId });
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.response?.status === 403) setIsBlocked(true);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ─── Join / leave room ─── */
  useEffect(() => {
    if (!selectedCourse || !socketRef.current) return;
    const courseId = selectedCourse._id;

    if (currentRoom.current && currentRoom.current !== courseId) {
      socketRef.current.emit("course:leave", {
        courseId: currentRoom.current,
        userId,
      });
    }

    currentRoom.current = courseId;
    setTypers([]);
    fetchMessages(courseId);
    socketRef.current.emit("course:join", { courseId, userId });

    const handleMessage = (msg) => {
      if (String(msg.courseId) === String(courseId)) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        if (msg.senderId?._id !== userId) {
          setTypers((prev) => prev.filter((n) => n !== msg.senderId?.name));
        }
      }
    };

    const handleTyping = (typer) => {
      if (typer?._id !== userId) {
        setTypers((prev) =>
          prev.includes(typer.name) ? prev : [...prev, typer.name],
        );
      }
    };

    const handleStopTyping = (user) => {
      if (!user) return;
      setTypers((prev) => prev.filter((n) => n !== user.name));
    };
    const handleDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    const handleCleared = ({ courseId: cid }) => {
      if (String(cid) === String(courseId)) setMessages([]);
    };

    socketRef.current.on("course:message", handleMessage);
    socketRef.current.on("course:typing", handleTyping);
    socketRef.current.on("course:stopTyping", handleStopTyping);
    socketRef.current.on("course:messageDeleted", handleDeleted);
    socketRef.current.on("course:messagesCleared", handleCleared);

    return () => {
      socketRef.current.off("course:message", handleMessage);
      socketRef.current.off("course:typing", handleTyping);
      socketRef.current.off("course:stopTyping", handleStopTyping);
      socketRef.current.off("course:messageDeleted", handleDeleted);
      socketRef.current.off("course:messagesCleared", handleCleared);
    };
  }, [selectedCourse, userId, fetchMessages]);

  /* ─── Auto scroll ─── */
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typers]);

  /* ─── Send message ─── */
  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || !selectedCourse || isBlocked || !isConnected) return;

    socketRef.current.emit("course:message", {
      senderId: userId,
      courseId: selectedCourse._id,
      content,
    });

    socketRef.current.emit("course:stopTyping", {
      courseId: selectedCourse._id,
    });

    setNewMessage("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ─── Typing events ─── */
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!selectedCourse) return;

    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit("course:typing", {
        courseId: selectedCourse._id,
        user: { _id: userId, name: user?.name },
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketRef.current.emit("course:stopTyping", {
        courseId: selectedCourse._id,
      });
    }, 2000);
  };

  const filtered = courses.filter((c) =>
    c.title?.toLowerCase().includes(courseSearch.toLowerCase()),
  );

  const grouped = groupByDate(messages);

  return (
    <MainLayout>
      {/* ─── Notification toasts ─── */}
      {/* <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
        {notifications.slice(0, 3).map((n, i) => (
          <div
            key={i}
            className="bg-gray-900 text-white px-4 py-3 rounded-xl text-xs shadow-2xl border border-gray-700 min-w-[220px]"
          >
            <p className="font-semibold text-sm mb-0.5">{n.title}</p>
            <p className="text-gray-300">{n.message}</p>
          </div>
        ))}
      </div> */}

      {/* ─── Chat shell ─── */}
      <div
        className="flex rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-lg"
        style={{ height: "calc(100vh - 120px)" }}
      >
        {/* ══════ SIDEBAR ══════ */}
        <aside className="w-64 flex-shrink-0 flex flex-col border-r border-gray-100 bg-gray-50">
          {/* Sidebar header */}
          <div className="px-4 pt-5 pb-3 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              My Courses
            </p>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
              <Search size={13} className="text-gray-400 flex-shrink-0" />
              <input
                className="flex-1 text-xs text-gray-700 bg-transparent border-none outline-none placeholder:text-gray-400"
                placeholder="Search courses..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Course list */}
          <div
            className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-thumb]:bg-gray-200
            [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400">
                No courses found
              </div>
            ) : (
              filtered.map((c) => {
                const active = selectedCourse?._id === c._id;
                return (
                  <button
                    key={c._id}
                    onClick={() => setSelectedCourse(c)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group
                      ${active ? "bg-blue-50 shadow-sm" : "hover:bg-gray-100"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                      ${
                        active
                          ? "bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-200"
                          : "bg-gradient-to-br from-blue-300 to-blue-500 group-hover:from-blue-400 group-hover:to-blue-600"
                      }`}
                    >
                      <BookOpen size={14} className="text-white" />
                    </div>
                    <span
                      className={`flex-1 text-xs font-medium truncate
                      ${active ? "text-blue-700 font-semibold" : "text-gray-600"}`}
                    >
                      {c.title}
                    </span>
                    {active && (
                      <ChevronRight
                        size={13}
                        className="text-blue-500 flex-shrink-0"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ══════ CHAT AREA ══════ */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {selectedCourse ? (
            <>
              {/* ── Chat header ── */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-white flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0">
                  <BookOpen size={17} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {selectedCourse.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                      ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-gray-300"}`}
                    />
                    <span className="text-[11px] text-gray-400">
                      {isConnected
                        ? "Connected · Live chat"
                        : "Reconnecting..."}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Messages ── */}
              {loading ? (
                <div className="flex-1 flex items-center justify-center gap-2.5 text-gray-400 text-sm bg-gray-50">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
                  Loading messages...
                </div>
              ) : (
                <div
                  className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50 flex flex-col
                  [&::-webkit-scrollbar]:w-1.5
                  [&::-webkit-scrollbar-thumb]:bg-gray-200
                  [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                  {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 pb-10 text-gray-400">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <MessageSquare size={26} className="text-blue-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">
                        No messages yet
                      </p>
                      <p className="text-xs text-gray-400">
                        Say hello to your classmates 👋
                      </p>
                    </div>
                  )}

                  {grouped.map((item, i) => {
                    if (item.type === "date") {
                      return <DateDivider key={item.id} date={item.date} />;
                    }

                    const msg = item;
                    const isMine =
                      (msg.senderId?._id || msg.senderId) === userId;
                    const prevItem = grouped[i - 1];
                    const prevMsg =
                      prevItem?.type === "message" ? prevItem : null;
                    const sameAsPrev =
                      prevMsg &&
                      (prevMsg.senderId?._id || prevMsg.senderId) ===
                        (msg.senderId?._id || msg.senderId);

                    return (
                      <div
                        key={msg._id}
                        className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""} ${sameAsPrev ? "mb-0.5" : "mb-1.5"}`}
                      >
                        {/* Avatar slot — always takes space */}
                        <div className="w-8 flex-shrink-0">
                          {!isMine && !sameAsPrev && (
                            <Avatar
                              name={msg.senderId?.name}
                              role={msg.senderId?.role}
                              size={30}
                            />
                          )}
                        </div>

                        <div
                          className={`flex flex-col max-w-[65%] gap-0.5 ${isMine ? "items-end" : "items-start"}`}
                        >
                          {!isMine && !sameAsPrev && (
                            <span className="text-[11px] font-semibold text-gray-500 px-1">
                              {msg.senderId?.name}
                            </span>
                          )}
                          <div
                            className={`px-3.5 py-2 rounded-2xl max-w-full break-words leading-relaxed
                            ${
                              isMine
                                ? "bg-gradient-to-br from-blue-500 to-blue-700 rounded-br-sm shadow-md shadow-blue-200"
                                : "bg-white border border-gray-200 rounded-bl-sm shadow-sm"
                            }`}
                          >
                            <span
                              className={`text-[13.5px] block ${isMine ? "text-white" : "text-gray-800"}`}
                            >
                              {msg.content}
                            </span>
                            <span
                              className={`text-[10px] block text-right mt-1
                              ${isMine ? "text-blue-200" : "text-gray-400"}`}
                            >
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <TypingIndicator typers={typers} />
                  <div ref={msgEndRef} />
                </div>
              )}

              {/* ── Blocked banner ── */}
              {isBlocked && (
                <div className="px-5 py-2.5 bg-red-50 border-t border-red-100 text-center text-sm text-red-500 font-medium flex-shrink-0">
                  🚫 You have been blocked from sending messages in this chat.
                </div>
              )}

              {/* ── Input area ── */}
              <div className="flex items-end gap-3 px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
                <div
                  className={`flex-1 flex items-center bg-gray-50 border rounded-2xl px-4 transition-all
                  ${
                    isBlocked || !isConnected
                      ? "border-gray-200 opacity-60"
                      : "border-gray-200 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-50"
                  }`}
                >
                  <textarea
                    ref={inputRef}
                    rows={1}
                    placeholder={
                      isBlocked
                        ? "You are blocked from sending messages"
                        : "Ask your question..."
                    }
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={isBlocked || !isConnected}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 py-3 resize-none max-h-32 leading-relaxed placeholder:text-gray-400 font-[inherit]"
                    style={{ scrollbarWidth: "none" }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isBlocked || !isConnected}
                  title="Send message"
                  className="w-11 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-all shadow-md shadow-blue-200 disabled:shadow-none"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </>
          ) : (
            /* ── No course selected ── */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-gray-50">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shadow-inner">
                <MessageSquare size={30} className="text-blue-400" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-gray-700">
                  Select a course
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Join a course chat to connect with your classmates and tutors
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
