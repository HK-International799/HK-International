import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Loader2,
  Info,
  AlertTriangle,
  FileText,
  Award,
  MessageCircle,
  Filter,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../services/studentService";

const typeIcons = {
  info: { icon: Info, bg: "bg-blue-50", color: "text-blue-500" },
  warning: { icon: AlertTriangle, bg: "bg-yellow-50", color: "text-yellow-500" },
  assignment: { icon: FileText, bg: "bg-indigo-50", color: "text-indigo-500" },
  grade: { icon: Award, bg: "bg-green-50", color: "text-green-500" },
  message: { icon: MessageCircle, bg: "bg-orange-50", color: "text-orange-500" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const params = {};
      if (filter === "unread") params.isRead = "false";
      if (filter === "read") params.isRead = "true";
      const data = await getNotifications(params);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setTotalCount(data.totalCount || 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-orange-500" />
              Notifications
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-semibold hover:bg-orange-100 transition disabled:opacity-60"
            >
              {markingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
              Mark all read
            </motion.button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          {["all", "unread", "read"].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setLoading(true); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === f
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1 bg-white/20 px-1.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700">No notifications</h3>
            <p className="text-sm text-gray-400 mt-1">
              {filter === "unread" ? "No unread notifications" : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => {
              const typeInfo = typeIcons[n.type] || typeIcons.info;
              const Icon = typeInfo.icon;
              return (
                <motion.div
                  key={n._id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => !n.isRead && handleMarkRead(n._id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    n.isRead
                      ? "bg-white border-gray-100"
                      : "bg-orange-50/40 border-orange-100 hover:bg-orange-50"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg ${typeInfo.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${typeInfo.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-relaxed ${n.isRead ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    {n.body && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-2" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
