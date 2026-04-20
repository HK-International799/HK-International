// import { useState, useEffect, useRef, useCallback } from "react";
// import { io } from "socket.io-client";
// import {
//   Send,
//   MessageSquare,
//   BookOpen,
//   Wifi,
//   WifiOff,
//   ChevronRight,
// } from "lucide-react";

// import MainLayout from "../../components/layout/MainLayout";
// import { useAuth } from "../../contexts/AuthContext";
// import { getMessages, sendMessage } from "../../services/messageService";
// import { getStudentCourses } from "../../services/studentService";

// /* ─── Helpers ─── */
// const formatTime = (ts) => {
//   if (!ts) return "";
//   const d = new Date(ts);
//   const now = new Date();
//   const isToday = d.toDateString() === now.toDateString();
//   return isToday
//     ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//     : d.toLocaleDateString([], { month: "short", day: "numeric" }) +
//         " " +
//         d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// };

// const getInitials = (name = "") =>
//   name
//     .split(" ")
//     .slice(0, 2)
//     .map((n) => n[0])
//     .join("")
//     .toUpperCase();

// const ROLE_COLORS = {
//   admin: { bg: "#fef2f2", text: "#ef4444", border: "#fecaca" },
//   tutor: { bg: "#f5f3ff", text: "#7c3aed", border: "#ddd6fe" },
//   student: { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
// };

// /* ─── Avatar ─── */
// function Avatar({ name = "", role, size = 34 }) {
//   const colors = ROLE_COLORS[role] || {
//     bg: "#f3f4f6",
//     text: "#6b7280",
//     border: "#e5e7eb",
//   };
//   return (
//     <div
//       style={{
//         width: size,
//         height: size,
//         borderRadius: "50%",
//         background: colors.bg,
//         border: `2px solid ${colors.border}`,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         fontSize: size * 0.35,
//         fontWeight: 700,
//         color: colors.text,
//         flexShrink: 0,
//         userSelect: "none",
//       }}
//     >
//       {getInitials(name)}
//     </div>
//   );
// }

// /* ─── Typing Indicator ─── */
// function TypingIndicator({ typers }) {
//   if (!typers.length) return null;
//   const label =
//     typers.length === 1
//       ? `${typers[0]} is typing`
//       : `${typers.join(", ")} are typing`;
//   return (
//     <div className="typing-row">
//       <div className="typing-dots">
//         <span />
//         <span />
//         <span />
//       </div>
//       <span className="typing-text">{label}...</span>
//     </div>
//   );
// }

// /* ─── Date divider ─── */
// function DateDivider({ date }) {
//   const label = (() => {
//     const d = new Date(date);
//     const now = new Date();
//     const isToday = d.toDateString() === now.toDateString();
//     const yesterday = new Date(now);
//     yesterday.setDate(yesterday.getDate() - 1);
//     if (isToday) return "Today";
//     if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
//     return d.toLocaleDateString([], {
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     });
//   })();
//   return (
//     <div className="date-divider">
//       <span>{label}</span>
//     </div>
//   );
// }

// /* ─── Group messages by date ─── */
// const groupByDate = (messages) => {
//   const groups = [];
//   let lastDate = null;
//   for (const msg of messages) {
//     const dateStr = new Date(msg.createdAt).toDateString();
//     if (dateStr !== lastDate) {
//       groups.push({ type: "date", date: msg.createdAt, id: `date-${dateStr}` });
//       lastDate = dateStr;
//     }
//     groups.push({ type: "message", ...msg });
//   }
//   return groups;
// };

// /* ─── MAIN COMPONENT ─── */
// export default function Chat() {
//   const { user } = useAuth();
//   const userId = user?._id || user?.id;

//   const [courses, setCourses] = useState([]);
//   const [courseSearch, setCourseSearch] = useState("");
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [isConnected, setIsConnected] = useState(false);
//   const [isBlocked, setIsBlocked] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [typers, setTypers] = useState([]);
//   const [isTyping, setIsTyping] = useState(false);

//   //notification
//   const [notifications, setNotifications] = useState([]);

//   const socketRef = useRef(null);
//   const msgEndRef = useRef(null);
//   const inputRef = useRef(null);
//   const currentRoom = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   /* ─── Load courses ─── */
//   useEffect(() => {
//     getStudentCourses().then((res) =>
//       setCourses(Array.isArray(res) ? res : []),
//     );
//   }, []);

//   /* ─── Socket init ─── */
//   useEffect(() => {
//     const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

//     socketRef.current = io(baseURL.replace("/api", ""), {
//       withCredentials: true,
//       reconnection: true,
//       reconnectionAttempts: 5,
//     });

//     socketRef.current.on("connect", () => {
//       setIsConnected(true);
//       if (userId) socketRef.current.emit("user:online", userId);

//       if (currentRoom.current) {
//         socketRef.current.emit("course:join", {
//           courseId: currentRoom.current,
//           userId,
//         });
//       }
//     });

//     socketRef.current.on("disconnect", () => setIsConnected(false));

//     // 🔔 ADD THIS
//     socketRef.current.on("notification", (data) => {
//       console.log("🔔 Notification:", data);

//       setNotifications((prev) => [data, ...prev]);

//       // OPTIONAL: browser notification
//       if (document.hidden && Notification.permission === "granted") {
//         new Notification(data.title || "New Notification", {
//           body: data.message,
//         });
//       }
//     });

//     return () => socketRef.current?.disconnect();
//   }, []);

//   useEffect(() => {
//     if ("Notification" in window) {
//       Notification.requestPermission();
//     }
//   }, []);

//   /* ─── Fetch messages ─── */
//   const fetchMessages = useCallback(async (courseId) => {
//     setLoading(true);
//     setIsBlocked(false);
//     try {
//       const data = await getMessages({ courseId });
//       setMessages(Array.isArray(data) ? data : []);
//     } catch (err) {
//       if (err?.response?.status === 403) setIsBlocked(true);
//       setMessages([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   /* ─── Join / leave room ─── */
//   useEffect(() => {
//     if (!selectedCourse || !socketRef.current) return;
//     const courseId = selectedCourse._id;

//     if (currentRoom.current && currentRoom.current !== courseId) {
//       socketRef.current.emit("course:leave", {
//         courseId: currentRoom.current,
//         userId,
//       });
//     }

//     currentRoom.current = courseId;
//     setTypers([]);
//     fetchMessages(courseId);
//     socketRef.current.emit("course:join", { courseId, userId });

//     const handleMessage = (msg) => {
//       if (String(msg.courseId) === String(courseId)) {
//         setMessages((prev) => {
//           if (prev.some((m) => m._id === msg._id)) return prev;
//           return [...prev, msg];
//         });
//         // Clear sender from typers
//         if (msg.senderId?._id !== userId) {
//           setTypers((prev) => prev.filter((n) => n !== msg.senderId?.name));
//         }
//       }
//     };

//     const handleTyping = (typer) => {
//       if (typer?._id !== userId) {
//         setTypers((prev) =>
//           prev.includes(typer.name) ? prev : [...prev, typer.name],
//         );
//       }
//     };

//     const handleStopTyping = () => setTypers([]);

//     const handleDeleted = ({ messageId }) => {
//       setMessages((prev) => prev.filter((m) => m._id !== messageId));
//     };

//     const handleCleared = ({ courseId: cid }) => {
//       if (String(cid) === String(courseId)) setMessages([]);
//     };

//     socketRef.current.on("course:message", handleMessage);
//     socketRef.current.on("course:typing", handleTyping);
//     socketRef.current.on("course:stopTyping", handleStopTyping);
//     socketRef.current.on("course:messageDeleted", handleDeleted);
//     socketRef.current.on("course:messagesCleared", handleCleared);

//     return () => {
//       socketRef.current.off("course:message", handleMessage);
//       socketRef.current.off("course:typing", handleTyping);
//       socketRef.current.off("course:stopTyping", handleStopTyping);
//       socketRef.current.off("course:messageDeleted", handleDeleted);
//       socketRef.current.off("course:messagesCleared", handleCleared);
//     };
//   }, [selectedCourse, userId, fetchMessages]);

//   /* ─── Auto scroll ─── */
//   useEffect(() => {
//     msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, typers]);

//   /* ─── Send message ─── */
//   const handleSend = async () => {
//     const content = newMessage.trim();
//     if (!content || !selectedCourse || isBlocked || !isConnected) return;

//     try {
//       // ONLY API CALL
//       await sendMessage({
//         courseId: selectedCourse._id,
//         content,
//       });
//     } catch (err) {
//       console.error("Message send failed:", err);
//     }

//     socketRef.current.emit("course:stopTyping", {
//       courseId: selectedCourse._id,
//     });

//     setNewMessage("");
//     inputRef.current?.focus();
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   /* ─── Typing events ─── */
//   const handleInputChange = (e) => {
//     setNewMessage(e.target.value);

//     if (!selectedCourse) return;

//     if (!isTyping) {
//       setIsTyping(true);
//       socketRef.current.emit("course:typing", {
//         courseId: selectedCourse._id,
//         user: { _id: userId, name: user?.name },
//       });
//     }

//     clearTimeout(typingTimeoutRef.current);
//     typingTimeoutRef.current = setTimeout(() => {
//       setIsTyping(false);
//       socketRef.current.emit("course:stopTyping", {
//         courseId: selectedCourse._id,
//       });
//     }, 2000);
//   };

//   const filtered = courses.filter((c) =>
//     c.title?.toLowerCase().includes(courseSearch.toLowerCase()),
//   );

//   const grouped = groupByDate(messages);

//   return (
//     <MainLayout>
//       <style>{`
//         .student-chat-wrap {
//           display: flex;
//           height: calc(100vh - 120px);
//           border-radius: 16px;
//           overflow: hidden;
//           background: #fff;
//           box-shadow: 0 1px 3px rgba(0,0,0,.07), 0 4px 20px rgba(0,0,0,.05);
//           border: 1px solid #f0f0f0;
//         }

//         /* ─── Sidebar ─── */
//         .sc-sidebar {
//           width: 270px;
//           flex-shrink: 0;
//           display: flex;
//           flex-direction: column;
//           border-right: 1px solid #f3f4f6;
//           background: #fafafa;
//         }
//         .sc-sidebar-top {
//           padding: 16px;
//           border-bottom: 1px solid #f0f0f0;
//         }
//         .sc-sidebar-label {
//           font-size: 11px;
//           font-weight: 700;
//           color: #9ca3af;
//           text-transform: uppercase;
//           letter-spacing: .08em;
//           margin-bottom: 10px;
//         }
//         .sc-search {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           background: #fff;
//           border: 1px solid #e5e7eb;
//           border-radius: 8px;
//           padding: 7px 10px;
//         }
//         .sc-search svg { flex-shrink: 0; }
//         .sc-search input {
//           border: none;
//           outline: none;
//           font-size: 12px;
//           color: #374151;
//           background: transparent;
//           width: 100%;
//         }
//         .sc-course-list {
//           flex: 1;
//           overflow-y: auto;
//           padding: 6px;
//         }
//         .sc-course-item {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           padding: 10px 10px;
//           border-radius: 10px;
//           cursor: pointer;
//           transition: background .12s;
//           margin-bottom: 1px;
//         }
//         .sc-course-item:hover { background: #f0f0f0; }
//         .sc-course-item.active { background: #eff6ff; }
//         .sc-course-icon {
//           width: 36px; height: 36px;
//           border-radius: 10px;
//           background: linear-gradient(135deg, #93c5fd, #3b82f6);
//           display: flex; align-items: center; justify-content: center;
//           flex-shrink: 0;
//         }
//         .sc-course-item.active .sc-course-icon {
//           background: linear-gradient(135deg, #3b82f6, #1d4ed8);
//         }
//         .sc-course-info { flex: 1; min-width: 0; }
//         .sc-course-name {
//           font-size: 13px;
//           font-weight: 500;
//           color: #374151;
//           overflow: hidden;
//           text-overflow: ellipsis;
//           white-space: nowrap;
//         }
//         .sc-course-item.active .sc-course-name {
//           color: #1d4ed8;
//           font-weight: 600;
//         }
//         .sc-no-courses {
//           padding: 24px 12px;
//           text-align: center;
//           font-size: 12px;
//           color: #9ca3af;
//         }

//         /* ─── Chat area ─── */
//         .sc-chat {
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//           overflow: hidden;
//         }

//         /* ─── Chat header ─── */
//         .sc-header {
//           padding: 13px 18px;
//           border-bottom: 1px solid #f3f4f6;
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           background: #fff;
//           flex-shrink: 0;
//         }
//         .sc-header-icon {
//           width: 38px; height: 38px;
//           border-radius: 10px;
//           background: linear-gradient(135deg, #3b82f6, #1d4ed8);
//           display: flex; align-items: center; justify-content: center;
//           flex-shrink: 0;
//         }
//         .sc-header-info { flex: 1; min-width: 0; }
//         .sc-header-title {
//           font-size: 14px;
//           font-weight: 700;
//           color: #111827;
//           overflow: hidden;
//           text-overflow: ellipsis;
//           white-space: nowrap;
//         }
//         .sc-header-sub {
//           font-size: 11px;
//           color: #9ca3af;
//           display: flex;
//           align-items: center;
//           gap: 5px;
//           margin-top: 1px;
//         }
//         .sc-status-dot {
//           width: 6px; height: 6px;
//           border-radius: 50%;
//           background: #10b981;
//           animation: pulse 2s infinite;
//         }
//         .sc-status-dot.off { background: #d1d5db; animation: none; }
//         @keyframes pulse {
//           0%, 100% { opacity: 1; }
//           50% { opacity: .5; }
//         }

//         /* ─── Messages ─── */
//         .sc-messages {
//           flex: 1;
//           overflow-y: auto;
//           padding: 16px 18px;
//           background: #f8fafc;
//           display: flex;
//           flex-direction: column;
//         }
//         .sc-messages::-webkit-scrollbar { width: 4px; }
//         .sc-messages::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

//         .date-divider {
//           text-align: center;
//           margin: 14px 0 10px;
//         }
//         .date-divider span {
//           font-size: 11px;
//           color: #9ca3af;
//           background: #f8fafc;
//           padding: 3px 10px;
//           border-radius: 20px;
//           border: 1px solid #e5e7eb;
//         }

//         /* ─── Message rows ─── */
//         .sc-msg-row {
//           display: flex;
//           align-items: flex-end;
//           gap: 8px;
//           margin-bottom: 6px;
//         }
//         .sc-msg-row.mine { flex-direction: row-reverse; }

//         /* consecutive messages from same sender */
//         .sc-msg-row.consecutive { margin-bottom: 2px; }
//         .sc-msg-row.consecutive .avatar-slot { visibility: hidden; }

//         .avatar-slot { width: 34px; flex-shrink: 0; }

//         .sc-msg-group {
//           display: flex;
//           flex-direction: column;
//           max-width: 68%;
//           gap: 2px;
//         }
//         .sc-msg-row.mine .sc-msg-group { align-items: flex-end; }

//         .sc-msg-name {
//           font-size: 11px;
//           font-weight: 600;
//           color: #6b7280;
//           padding: 0 4px;
//           margin-bottom: 1px;
//         }

//         .sc-bubble {
//           padding: 8px 12px;
//           border-radius: 16px;
//           max-width: 100%;
//           word-break: break-word;
//           position: relative;
//           line-height: 1.55;
//         }
//         .sc-bubble.mine {
//           background: linear-gradient(135deg, #3b82f6, #2563eb);
//           border-bottom-right-radius: 4px;
//         }
//         .sc-bubble.theirs {
//           background: #fff;
//           border: 1px solid #e5e7eb;
//           border-bottom-left-radius: 4px;
//           box-shadow: 0 1px 2px rgba(0,0,0,.04);
//         }
//         .sc-bubble-text {
//           font-size: 13.5px;
//           display: block;
//         }
//         .sc-bubble.mine .sc-bubble-text { color: #fff; }
//         .sc-bubble.theirs .sc-bubble-text { color: #1f2937; }
//         .sc-bubble-time {
//           font-size: 10px;
//           display: block;
//           text-align: right;
//           margin-top: 3px;
//         }
//         .sc-bubble.mine .sc-bubble-time { color: rgba(255,255,255,.6); }
//         .sc-bubble.theirs .sc-bubble-time { color: #9ca3af; }

//         /* ─── Typing indicator ─── */
//         .typing-row {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 6px 0;
//         }
//         .typing-dots {
//           display: flex;
//           gap: 3px;
//           background: #fff;
//           border: 1px solid #e5e7eb;
//           border-radius: 12px;
//           padding: 6px 10px;
//         }
//         .typing-dots span {
//           width: 5px; height: 5px;
//           border-radius: 50%;
//           background: #3b82f6;
//           animation: bounce .8s ease-in-out infinite;
//           display: block;
//         }
//         .typing-dots span:nth-child(2) { animation-delay: .12s; }
//         .typing-dots span:nth-child(3) { animation-delay: .24s; }
//         @keyframes bounce {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-3px); }
//         }
//         .typing-text {
//           font-size: 11px;
//           color: #9ca3af;
//           font-style: italic;
//         }

//         /* ─── Loading ─── */
//         .sc-loading {
//           flex: 1;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 8px;
//           color: #9ca3af;
//           font-size: 13px;
//         }
//         .sc-spinner {
//           width: 18px; height: 18px;
//           border: 2px solid #e5e7eb;
//           border-top-color: #3b82f6;
//           border-radius: 50%;
//           animation: spin .6s linear infinite;
//         }
//         @keyframes spin { to { transform: rotate(360deg); } }

//         /* ─── Blocked banner ─── */
//         .blocked-banner {
//           padding: 10px 18px;
//           background: #fef2f2;
//           border-top: 1px solid #fecaca;
//           text-align: center;
//           font-size: 13px;
//           color: #ef4444;
//           font-weight: 500;
//           flex-shrink: 0;
//         }

//         /* ─── Input ─── */
//         .sc-input-area {
//           padding: 12px 16px;
//           border-top: 1px solid #f3f4f6;
//           background: #fff;
//           display: flex;
//           align-items: flex-end;
//           gap: 10px;
//           flex-shrink: 0;
//         }
//         .sc-input-wrap {
//           flex: 1;
//           background: #f9fafb;
//           border: 1.5px solid #e5e7eb;
//           border-radius: 14px;
//           display: flex;
//           align-items: center;
//           padding: 0 14px;
//           transition: border-color .15s, background .15s;
//         }
//         .sc-input-wrap:focus-within {
//           border-color: #3b82f6;
//           background: #fff;
//         }
//         .sc-input-wrap textarea {
//           flex: 1;
//           background: transparent;
//           border: none;
//           outline: none;
//           font-size: 14px;
//           color: #1f2937;
//           padding: 10px 0;
//           resize: none;
//           max-height: 120px;
//           line-height: 1.5;
//           font-family: inherit;
//         }
//         .sc-input-wrap textarea::placeholder { color: #9ca3af; }
//         .sc-send-btn {
//           width: 42px; height: 42px;
//           border-radius: 12px;
//           background: #2563eb;
//           border: none;
//           display: flex; align-items: center; justify-content: center;
//           cursor: pointer;
//           flex-shrink: 0;
//           transition: background .15s, transform .1s;
//           color: #fff;
//         }
//         .sc-send-btn:hover:not(:disabled) { background: #1d4ed8; }
//         .sc-send-btn:active:not(:disabled) { transform: scale(.93); }
//         .sc-send-btn:disabled { background: #d1d5db; cursor: not-allowed; }

//         /* ─── Empty ─── */
//         .sc-empty {
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           gap: 12px;
//           color: #9ca3af;
//         }
//         .sc-empty-icon {
//           width: 64px; height: 64px;
//           border-radius: 18px;
//           background: #eff6ff;
//           display: flex; align-items: center; justify-content: center;
//         }
//         .sc-empty h3 { font-size: 15px; font-weight: 700; color: #374151; margin: 0; }
//         .sc-empty p { font-size: 13px; margin: 0; color: #9ca3af; }
//       `}</style>

//       <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999 }}>
//         {notifications.slice(0, 3).map((n, i) => (
//           <div
//             key={i}
//             style={{
//               background: "#111",
//               color: "#fff",
//               padding: "10px 14px",
//               marginBottom: "8px",
//               borderRadius: "8px",
//               fontSize: "12px",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
//             }}
//           >
//             <strong>{n.title}</strong>
//             <div>{n.message}</div>
//           </div>
//         ))}
//       </div>
//       <div className="student-chat-wrap">
//         {/* ─── Sidebar ─── */}
//         <div className="sc-sidebar">
//           <div className="sc-sidebar-top">
//             <div className="sc-sidebar-label">My Courses</div>
//             <div className="sc-search">
//               <svg
//                 width="12"
//                 height="12"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="#9ca3af"
//                 strokeWidth="2.5"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <circle cx="11" cy="11" r="8" />
//                 <path d="m21 21-4.35-4.35" />
//               </svg>
//               <input
//                 placeholder="Search..."
//                 value={courseSearch}
//                 onChange={(e) => setCourseSearch(e.target.value)}
//               />
//             </div>
//           </div>

//           <div className="sc-course-list">
//             {filtered.length === 0 ? (
//               <div className="sc-no-courses">No courses found</div>
//             ) : (
//               filtered.map((c) => {
//                 const active = selectedCourse?._id === c._id;
//                 return (
//                   <div
//                     key={c._id}
//                     className={`sc-course-item ${active ? "active" : ""}`}
//                     onClick={() => setSelectedCourse(c)}
//                   >
//                     <div className="sc-course-icon">
//                       <BookOpen size={16} color="#fff" />
//                     </div>
//                     <div className="sc-course-info">
//                       <div className="sc-course-name">{c.title}</div>
//                     </div>
//                     {active && <ChevronRight size={14} color="#1d4ed8" />}
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         </div>

//         {/* ─── Chat ─── */}
//         <div className="sc-chat">
//           {selectedCourse ? (
//             <>
//               {/* Header */}
//               <div className="sc-header">
//                 <div className="sc-header-icon">
//                   <BookOpen size={17} color="#fff" />
//                 </div>
//                 <div className="sc-header-info">
//                   <div className="sc-header-title">{selectedCourse.title}</div>
//                   <div className="sc-header-sub">
//                     <span
//                       className={`sc-status-dot ${isConnected ? "" : "off"}`}
//                     />
//                     {isConnected ? "Connected · Live chat" : "Reconnecting..."}
//                   </div>
//                 </div>
//               </div>

//               {/* Messages */}
//               {loading ? (
//                 <div className="sc-loading">
//                   <div className="sc-spinner" />
//                   Loading messages...
//                 </div>
//               ) : (
//                 <div className="sc-messages">
//                   {messages.length === 0 && (
//                     <div
//                       style={{
//                         flex: 1,
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         color: "#9ca3af",
//                         fontSize: 13,
//                         gap: 8,
//                         paddingBottom: 40,
//                       }}
//                     >
//                       <MessageSquare size={28} color="#d1d5db" />
//                       <span>No messages yet. Say hello! 👋</span>
//                     </div>
//                   )}

//                   {grouped.map((item, i) => {
//                     if (item.type === "date") {
//                       return <DateDivider key={item.id} date={item.date} />;
//                     }

//                     const msg = item;
//                     const isMine =
//                       (msg.senderId?._id || msg.senderId) === userId;
//                     const prevItem = grouped[i - 1];
//                     const prevMsg =
//                       prevItem?.type === "message" ? prevItem : null;
//                     const sameAsPrev =
//                       prevMsg &&
//                       (prevMsg.senderId?._id || prevMsg.senderId) ===
//                         (msg.senderId?._id || msg.senderId);

//                     return (
//                       <div
//                         key={msg._id}
//                         className={`sc-msg-row ${isMine ? "mine" : ""} ${sameAsPrev ? "consecutive" : ""}`}
//                       >
//                         <div className="avatar-slot">
//                           {!isMine && !sameAsPrev && (
//                             <Avatar
//                               name={msg.senderId?.name}
//                               role={msg.senderId?.role}
//                               size={30}
//                             />
//                           )}
//                         </div>

//                         <div className="sc-msg-group">
//                           {!isMine && !sameAsPrev && (
//                             <div className="sc-msg-name">
//                               {msg.senderId?.name}
//                             </div>
//                           )}
//                           <div
//                             className={`sc-bubble ${isMine ? "mine" : "theirs"}`}
//                           >
//                             <span className="sc-bubble-text">
//                               {msg.content}
//                             </span>
//                             <span className="sc-bubble-time">
//                               {formatTime(msg.createdAt)}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}

//                   <TypingIndicator typers={typers} />
//                   <div ref={msgEndRef} />
//                 </div>
//               )}

//               {/* Blocked banner */}
//               {isBlocked && (
//                 <div className="blocked-banner">
//                   🚫 You have been blocked from sending messages in this chat.
//                 </div>
//               )}

//               {/* Input */}
//               <div className="sc-input-area">
//                 <div className="sc-input-wrap">
//                   <textarea
//                     ref={inputRef}
//                     rows={1}
//                     placeholder={
//                       isBlocked
//                         ? "You are blocked from sending messages"
//                         : "Type a message..."
//                     }
//                     value={newMessage}
//                     onChange={handleInputChange}
//                     onKeyDown={handleKeyDown}
//                     disabled={isBlocked || !isConnected}
//                   />
//                 </div>
//                 <button
//                   className="sc-send-btn"
//                   onClick={handleSend}
//                   disabled={!newMessage.trim() || isBlocked || !isConnected}
//                   title="Send message"
//                 >
//                   <Send size={17} />
//                 </button>
//               </div>
//             </>
//           ) : (
//             <div className="sc-empty">
//               <div className="sc-empty-icon">
//                 <MessageSquare size={28} color="#3b82f6" />
//               </div>
//               <h3>Select a course</h3>
//               <p>
//                 Join a course chat to connect with your classmates and tutors
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </MainLayout>
//   );
// }


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
      setCourses(Array.isArray(res) ? res : [])
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
      if (userId) socketRef.current.emit("user:online", userId);
      if (currentRoom.current) {
        socketRef.current.emit("course:join", {
          courseId: currentRoom.current,
          userId,
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
          prev.includes(typer.name) ? prev : [...prev, typer.name]
        );
      }
    };

    const handleStopTyping = () => setTypers([]);

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

    try {
      await sendMessage({ courseId: selectedCourse._id, content });
    } catch (err) {
      console.error("Message send failed:", err);
    }

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
    c.title?.toLowerCase().includes(courseSearch.toLowerCase())
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
      <div className="flex rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-lg"
        style={{ height: "calc(100vh - 120px)" }}>

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
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-thumb]:bg-gray-200
            [&::-webkit-scrollbar-thumb]:rounded-full">
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
                      ${active
                        ? "bg-blue-50 shadow-sm"
                        : "hover:bg-gray-100"
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                      ${active
                        ? "bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-200"
                        : "bg-gradient-to-br from-blue-300 to-blue-500 group-hover:from-blue-400 group-hover:to-blue-600"
                      }`}>
                      <BookOpen size={14} className="text-white" />
                    </div>
                    <span className={`flex-1 text-xs font-medium truncate
                      ${active ? "text-blue-700 font-semibold" : "text-gray-600"}`}>
                      {c.title}
                    </span>
                    {active && (
                      <ChevronRight size={13} className="text-blue-500 flex-shrink-0" />
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
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                      ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-gray-300"}`} />
                    <span className="text-[11px] text-gray-400">
                      {isConnected ? "Connected · Live chat" : "Reconnecting..."}
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
                <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50 flex flex-col
                  [&::-webkit-scrollbar]:w-1.5
                  [&::-webkit-scrollbar-thumb]:bg-gray-200
                  [&::-webkit-scrollbar-thumb]:rounded-full">

                  {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 pb-10 text-gray-400">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <MessageSquare size={26} className="text-blue-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">No messages yet</p>
                      <p className="text-xs text-gray-400">Say hello to your classmates 👋</p>
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

                        <div className={`flex flex-col max-w-[65%] gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
                          {!isMine && !sameAsPrev && (
                            <span className="text-[11px] font-semibold text-gray-500 px-1">
                              {msg.senderId?.name}
                            </span>
                          )}
                          <div className={`px-3.5 py-2 rounded-2xl max-w-full break-words leading-relaxed
                            ${isMine
                              ? "bg-gradient-to-br from-blue-500 to-blue-700 rounded-br-sm shadow-md shadow-blue-200"
                              : "bg-white border border-gray-200 rounded-bl-sm shadow-sm"
                            }`}>
                            <span className={`text-[13.5px] block ${isMine ? "text-white" : "text-gray-800"}`}>
                              {msg.content}
                            </span>
                            <span className={`text-[10px] block text-right mt-1
                              ${isMine ? "text-blue-200" : "text-gray-400"}`}>
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
                <div className={`flex-1 flex items-center bg-gray-50 border rounded-2xl px-4 transition-all
                  ${isBlocked || !isConnected
                    ? "border-gray-200 opacity-60"
                    : "border-gray-200 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-50"
                  }`}>
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
                <h3 className="text-base font-bold text-gray-700">Select a course</h3>
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