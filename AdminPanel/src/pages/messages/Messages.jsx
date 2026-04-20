import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader } from "../../components/ui";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

import {
  adminGetCourseMessages,
  adminDeleteMessages,
  adminDownloadMessages,
  adminDeleteSingleMessage,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from "../../services/messageService";
import { getCourses } from "../../services/courseService";

import {
  Send,
  Download,
  Trash2,
  Search,
  ShieldOff,
  Shield,
  X,
  MessageSquare,
  Users,
  AlertTriangle,
  ChevronRight,
  MoreVertical,
  BookOpen,
} from "lucide-react";

/* ─── Helpers ─── */
const formatTime = (ts) => {
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
  admin: "#ef4444",
  tutor: "#8b5cf6",
  student: "#3b82f6",
  partner: "#10b981",
};

/* ─── Sub-components ─── */

function Avatar({ name = "", role, size = 32 }) {
  const color = ROLE_COLORS[role] || "#6b7280";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${color}20`,
        border: `2px solid ${color}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        color,
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

function RoleBadge({ role }) {
  const color = ROLE_COLORS[role] || "#6b7280";
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "1px 6px",
        borderRadius: 4,
        background: `${color}15`,
        color,
        textTransform: "capitalize",
        letterSpacing: "0.04em",
      }}
    >
      {role}
    </span>
  );
}

/* ─── BLOCKED USERS PANEL ─── */
function BlockedUsersPanel({ onClose }) {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getBlockedUsers();
      setBlocked(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUnblock = async (userId) => {
    await unblockUser(userId);
    setBlocked((prev) => prev.filter((b) => b.userId?._id !== userId));
  };

  return (
    <div className="blocked-panel">
      <div className="blocked-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={16} color="#ef4444" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>Blocked Users</span>
          <span className="count-badge">{blocked.length}</span>
        </div>
        <button className="icon-btn" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="blocked-list">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : blocked.length === 0 ? (
          <div className="empty-state">
            <Shield size={28} color="#d1d5db" />
            <p>No blocked users</p>
          </div>
        ) : (
          blocked.map((b) => (
            <div key={b._id} className="blocked-item">
              <Avatar name={b.userId?.name} role={b.userId?.role} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>
                  {b.userId?.name}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                  {b.userId?.email}
                </div>
                {b.reason && (
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                    Reason: {b.reason}
                  </div>
                )}
              </div>
              <button
                className="unblock-btn"
                onClick={() => handleUnblock(b.userId?._id)}
                title="Unblock user"
              >
                <ShieldOff size={14} />
                Unblock
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── CONFIRM MODAL ─── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <AlertTriangle size={20} color="#ef4444" />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Confirm Action</span>
        </div>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>{message}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ─── BLOCK USER MODAL ─── */
function BlockModal({ user, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <ShieldOff size={20} color="#ef4444" />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Block User</span>
        </div>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
          Block <strong>{user?.name}</strong> from sending messages?
        </p>
        <input
          className="text-input"
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={() => onConfirm(reason)}>Block</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MESSAGE ITEM ─── */
function MessageItem({ msg, isMine, onDelete, onBlock }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={`msg-row ${isMine ? "mine" : "theirs"}`}>
      {!isMine && (
        <Avatar name={msg.senderId?.name} role={msg.senderId?.role} size={30} />
      )}

      <div className="msg-group">
        {!isMine && (
          <div className="msg-meta">
            <span className="msg-sender">{msg.senderId?.name}</span>
            <RoleBadge role={msg.senderId?.role} />
          </div>
        )}

        <div className={`msg-bubble ${isMine ? "bubble-mine" : "bubble-theirs"}`}>
          <span className="msg-text">{msg.content}</span>
          <span className="msg-time">{formatTime(msg.createdAt)}</span>
        </div>
      </div>

      {/* Actions menu */}
      <div className="msg-actions" ref={menuRef}>
        <button
          className="msg-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <MoreVertical size={14} />
        </button>
        {menuOpen && (
          <div className="msg-menu">
            <button
              className="msg-menu-item danger"
              onClick={() => { onDelete(msg._id); setMenuOpen(false); }}
            >
              <Trash2 size={12} /> Delete
            </button>
            {!isMine && (
              <button
                className="msg-menu-item"
                onClick={() => { onBlock(msg.senderId); setMenuOpen(false); }}
              >
                <ShieldOff size={12} /> Block user
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function Messages() {
  const { user } = useAdminAuth();
  const adminId = user?._id || user?.id;

  const [courses, setCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [blockTarget, setBlockTarget] = useState(null);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  const socketRef = useRef(null);
  const msgEndRef = useRef(null);
  const inputRef = useRef(null);
  const prevCourseId = useRef(null);

  /* ─── Socket init ─── */
  useEffect(() => {
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  socketRef.current = io(baseURL.replace("/api", ""), {
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socketRef.current.on("connect", () => {
    console.log("✅ Admin connected:", socketRef.current.id);
    setIsConnected(true);

    if (adminId) {
      socketRef.current.emit("user:online", adminId);
    }
  });

  socketRef.current.on("disconnect", (reason) => {
    console.log("❌ Admin disconnected:", reason);
    setIsConnected(false);
  });

  socketRef.current.on("connect_error", (err) => {
    console.error("❌ Admin socket error:", err.message);
  });

  // Moderation events
  socketRef.current.on("course:messageDeleted", ({ messageId }) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  });

  socketRef.current.on("course:messagesCleared", () => {
    setMessages([]);
  });

  return () => {
    socketRef.current?.disconnect();
  };
}, []); 

  /* ─── Load courses ─── */
  useEffect(() => {
    getCourses().then((res) => setCourses(Array.isArray(res) ? res : []));
  }, []);

  /* ─── Load messages ─── */
  const loadMessages = useCallback(async (courseId) => {
    setLoadingMsgs(true);
    try {
      const res = await adminGetCourseMessages(courseId);
      const msgs = res?.messages || res || [];
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  /* ─── Join course room ─── */
  useEffect(() => {
    if (!selectedCourse || !socketRef.current) return;
    const courseId = selectedCourse._id;

    if (prevCourseId.current && prevCourseId.current !== courseId) {
      socketRef.current.emit("course:leave", {
        courseId: prevCourseId.current,
        userId: adminId,
      });
    }

    prevCourseId.current = courseId;
    loadMessages(courseId);

    socketRef.current.emit("course:join", { courseId, userId: adminId });

    const handleIncoming = (msg) => {
      if (String(msg.courseId) === String(courseId)) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socketRef.current.on("course:message", handleIncoming);
    return () => socketRef.current.off("course:message", handleIncoming);
  }, [selectedCourse, adminId, loadMessages]);

  /* ─── Auto scroll ─── */
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ─── Send message ─── */
  const handleSend = async () => {
    const content = newMsg.trim();
    if (!content || !selectedCourse || sendingMsg) return;

    setSendingMsg(true);
    setNewMsg("");

    socketRef.current.emit("course:message", {
      senderId: adminId,
      courseId: selectedCourse._id,
      content,
    });

    setSendingMsg(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ─── Delete single message ─── */
  const handleDeleteMessage = async (messageId) => {
    await adminDeleteSingleMessage(messageId);
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    // Notify others in room
    socketRef.current.emit("admin:deleteMessage", {
      courseId: selectedCourse._id,
      messageId,
    });
  };

  /* ─── Clear all ─── */
  const handleClearAll = async () => {
    await adminDeleteMessages({ courseId: selectedCourse._id });
    setMessages([]);
    setConfirmClear(false);
    socketRef.current.emit("admin:clearChat", { courseId: selectedCourse._id });
  };

  /* ─── Block user ─── */
  const handleBlockUser = (sender) => {
    setBlockTarget(sender);
  };

  const confirmBlock = async (reason) => {
    if (!blockTarget) return;
    await blockUser({ userId: blockTarget._id, reason });
    setBlockTarget(null);
  };

  /* ─── Download CSV ─── */
  const handleDownload = async () => {
    if (!selectedCourse) return;
    const res = await adminDownloadMessages({ courseId: selectedCourse._id });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${selectedCourse.title}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredCourses = courses.filter((c) =>
    c.title?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <AdminLayout>
      <style>{`
        .chat-wrapper {
          display: flex;
          height: calc(100vh - 140px);
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 4px 20px rgba(0,0,0,.06);
          border: 1px solid #f0f0f0;
          position: relative;
        }

        /* ─── Sidebar ─── */
        .sidebar {
          width: 280px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #f3f4f6;
          background: #fafafa;
        }
        .sidebar-header {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        .sidebar-title {
          font-size: 12px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: .08em;
          margin-bottom: 10px;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 7px 10px;
        }
        .search-box input {
          border: none;
          outline: none;
          font-size: 13px;
          background: transparent;
          width: 100%;
          color: #374151;
        }
        .course-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        .course-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: background .15s;
          margin-bottom: 2px;
        }
        .course-item:hover { background: #f0f0f0; }
        .course-item.active { background: #fff7ed; }
        .course-icon {
          width: 34px; height: 34px;
          border-radius: 8px;
          background: linear-gradient(135deg, #fed7aa, #fb923c);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .course-name {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .course-item.active .course-name { color: #ea580c; font-weight: 600; }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid #f0f0f0;
        }
        .blocked-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #ef4444;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background .15s;
        }
        .blocked-btn:hover { background: #fee2e2; }

        /* ─── Chat area ─── */
        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          padding: 14px 20px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          flex-shrink: 0;
        }
        .chat-title { font-weight: 700; font-size: 15px; color: #111827; }
        .chat-sub { font-size: 12px; color: #9ca3af; margin-top: 1px; }
        .header-actions { display: flex; align-items: center; gap: 6px; }
        .conn-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #10b981;
        }
        .conn-dot.off { background: #d1d5db; }

        .icon-btn {
          width: 34px; height: 34px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #6b7280;
          transition: all .15s;
        }
        .icon-btn:hover { background: #f9fafb; color: #374151; }
        .icon-btn.danger:hover { background: #fef2f2; border-color: #fecaca; color: #ef4444; }

        /* ─── Messages ─── */
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

        .date-divider {
          text-align: center;
          margin: 12px 0;
        }
        .date-divider span {
          font-size: 11px;
          color: #9ca3af;
          background: #f8fafc;
          padding: 2px 10px;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
        }

        .msg-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 2px 0;
          position: relative;
        }
        .msg-row.mine { flex-direction: row-reverse; }
        .msg-row:hover .msg-actions { opacity: 1; }

        .msg-group {
          display: flex;
          flex-direction: column;
          max-width: 65%;
          gap: 3px;
        }
        .msg-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 4px;
        }
        .msg-sender {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
        }

        .msg-bubble {
          padding: 9px 12px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          position: relative;
        }
        .bubble-mine {
          background: linear-gradient(135deg, #f97316, #ea580c);
          border-bottom-right-radius: 4px;
        }
        .bubble-theirs {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,.05);
        }
        .msg-text {
          font-size: 13.5px;
          line-height: 1.5;
          word-break: break-word;
        }
        .bubble-mine .msg-text { color: #fff; }
        .bubble-theirs .msg-text { color: #1f2937; }
        .msg-time {
          font-size: 10px;
          align-self: flex-end;
          margin-top: 2px;
        }
        .bubble-mine .msg-time { color: rgba(255,255,255,.65); }
        .bubble-theirs .msg-time { color: #9ca3af; }

        .msg-actions {
          opacity: 0;
          transition: opacity .15s;
          position: relative;
        }
        .msg-menu-btn {
          width: 24px; height: 24px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #9ca3af;
          transition: all .15s;
          flex-shrink: 0;
        }
        .msg-menu-btn:hover { background: #f3f4f6; color: #374151; }
        .msg-menu {
          position: absolute;
          bottom: 28px;
          left: 0;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,.1);
          z-index: 100;
          min-width: 130px;
          overflow: hidden;
        }
        .msg-row.mine .msg-menu { left: auto; right: 0; }
        .msg-menu-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          font-size: 12px;
          color: #374151;
          cursor: pointer;
          width: 100%;
          background: none;
          border: none;
          text-align: left;
          transition: background .1s;
        }
        .msg-menu-item:hover { background: #f9fafb; }
        .msg-menu-item.danger { color: #ef4444; }
        .msg-menu-item.danger:hover { background: #fef2f2; }

        /* ─── Input ─── */
        .chat-input-area {
          padding: 14px 20px;
          border-top: 1px solid #f3f4f6;
          background: #fff;
          display: flex;
          align-items: flex-end;
          gap: 10px;
          flex-shrink: 0;
        }
        .chat-input-wrap {
          flex: 1;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          padding: 0 14px;
          transition: border-color .15s;
        }
        .chat-input-wrap:focus-within {
          border-color: #f97316;
          background: #fff;
        }
        .chat-input-wrap textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: #1f2937;
          padding: 11px 0;
          resize: none;
          max-height: 120px;
          line-height: 1.5;
          font-family: inherit;
        }
        .send-btn {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: #ea580c;
          border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background .15s, transform .1s;
          color: #fff;
        }
        .send-btn:hover { background: #c2410c; }
        .send-btn:active { transform: scale(.95); }
        .send-btn:disabled { background: #d1d5db; cursor: not-allowed; }

        /* ─── Empty state ─── */
        .empty-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #9ca3af;
        }
        .empty-chat-icon {
          width: 64px; height: 64px;
          border-radius: 16px;
          background: #f3f4f6;
          display: flex; align-items: center; justify-content: center;
        }
        .empty-chat h3 { font-size: 15px; font-weight: 600; color: #374151; margin: 0; }
        .empty-chat p { font-size: 13px; margin: 0; }

        /* ─── Loading ─── */
        .loading-msgs {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          font-size: 13px;
          gap: 8px;
        }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid #e5e7eb;
          border-top-color: #f97316;
          border-radius: 50%;
          animation: spin .6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ─── Blocked panel ─── */
        .blocked-panel {
          position: absolute;
          bottom: 0; right: 0;
          width: 320px;
          max-height: 480px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px 0 0 16px;
          box-shadow: -4px 0 20px rgba(0,0,0,.08);
          display: flex;
          flex-direction: column;
          z-index: 50;
          overflow: hidden;
        }
        .blocked-header {
          padding: 14px 16px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .blocked-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        .blocked-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 8px;
          border-radius: 8px;
        }
        .blocked-item:hover { background: #fafafa; }
        .unblock-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border-radius: 6px;
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #ef4444;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          flex-shrink: 0;
          transition: background .15s;
        }
        .unblock-btn:hover { background: #fee2e2; }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 32px;
          color: #9ca3af;
          font-size: 13px;
        }
        .count-badge {
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 10px;
        }

        /* ─── Modal ─── */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          width: 360px;
          box-shadow: 0 20px 60px rgba(0,0,0,.15);
        }
        .btn-secondary {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: #374151;
          transition: background .15s;
        }
        .btn-secondary:hover { background: #f9fafb; }
        .btn-danger {
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          background: #ef4444;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: #fff;
          transition: background .15s;
        }
        .btn-danger:hover { background: #dc2626; }
        .text-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
        }
        .text-input:focus { border-color: #f97316; }

        .no-courses {
          padding: 24px 16px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
        }
      `}</style>

      <PageHeader title="Chat Management" />

      <div className="chat-wrapper">
        {/* ─── LEFT SIDEBAR ─── */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">Course Rooms</div>
            <div className="search-box">
              <Search size={13} color="#9ca3af" />
              <input
                placeholder="Search courses..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="course-list">
            {filteredCourses.length === 0 ? (
              <div className="no-courses">No courses found</div>
            ) : (
              filteredCourses.map((c) => (
                <div
                  key={c._id}
                  className={`course-item ${selectedCourse?._id === c._id ? "active" : ""}`}
                  onClick={() => setSelectedCourse(c)}
                >
                  <div className="course-icon">
                    <BookOpen size={16} color="#fff" />
                  </div>
                  <span className="course-name">{c.title}</span>
                  {selectedCourse?._id === c._id && (
                    <ChevronRight size={14} color="#ea580c" style={{ marginLeft: "auto", flexShrink: 0 }} />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="sidebar-footer">
            <button
              className="blocked-btn"
              onClick={() => setShowBlocked((v) => !v)}
            >
              <Shield size={14} />
              Blocked Users
            </button>
          </div>
        </div>

        {/* ─── MAIN CHAT ─── */}
        <div className="chat-area">
          {selectedCourse ? (
            <>
              {/* Header */}
              <div className="chat-header">
                <div>
                  <div className="chat-title">{selectedCourse.title}</div>
                  <div className="chat-sub">
                    {messages.length} messages &nbsp;·&nbsp;
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                      }}
                    >
                      <span className={`conn-dot ${isConnected ? "" : "off"}`} />
                      {isConnected ? "Live" : "Offline"}
                    </span>
                  </div>
                </div>
                <div className="header-actions">
                  <button
                    className="icon-btn"
                    title="Download CSV"
                    onClick={handleDownload}
                  >
                    <Download size={15} />
                  </button>
                  <button
                    className="icon-btn danger"
                    title="Clear all messages"
                    onClick={() => setConfirmClear(true)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              {loadingMsgs ? (
                <div className="loading-msgs">
                  <div className="spinner" />
                  Loading messages...
                </div>
              ) : (
                <div className="messages-area">
                  {messages.length === 0 ? (
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9ca3af",
                        fontSize: 13,
                      }}
                    >
                      No messages yet
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMine =
                        (m.senderId?._id || m.senderId) === adminId;
                      return (
                        <MessageItem
                          key={m._id}
                          msg={m}
                          isMine={isMine}
                          onDelete={handleDeleteMessage}
                          onBlock={handleBlockUser}
                        />
                      );
                    })
                  )}
                  <div ref={msgEndRef} />
                </div>
              )}

              {/* Input */}
              <div className="chat-input-area">
                <div className="chat-input-wrap">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    placeholder="Type a message as Admin..."
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!newMsg.trim() || sendingMsg}
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="empty-chat">
              <div className="empty-chat-icon">
                <MessageSquare size={28} color="#d1d5db" />
              </div>
              <h3>Select a course</h3>
              <p>Choose a course from the left to view and manage its chat</p>
            </div>
          )}
        </div>

        {/* ─── BLOCKED PANEL ─── */}
        {showBlocked && (
          <BlockedUsersPanel onClose={() => setShowBlocked(false)} />
        )}
      </div>

      {/* ─── MODALS ─── */}
      {confirmClear && (
        <ConfirmModal
          message={`Delete all messages in "${selectedCourse?.title}"? This cannot be undone.`}
          onConfirm={handleClearAll}
          onCancel={() => setConfirmClear(false)}
        />
      )}

      {blockTarget && (
        <BlockModal
          user={blockTarget}
          onConfirm={confirmBlock}
          onCancel={() => setBlockTarget(null)}
        />
      )}
    </AdminLayout>
  );
}