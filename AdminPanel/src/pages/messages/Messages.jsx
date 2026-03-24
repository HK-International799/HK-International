import { useEffect, useState, useRef } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, Input, Button } from "../../components/ui";
import { getAllUsers } from "../../services/adminService";
import { getMessages, sendMessage } from "../../services/messageService";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Send, Search, MessageCircle, Circle } from "lucide-react";

export default function Messages() {
  const { user } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [search, setSearch] = useState("");
  const msgEndRef = useRef(null);

  useEffect(() => { loadUsers(); }, []);
  useEffect(() => { if (selectedUser) loadMessages(selectedUser._id); }, [selectedUser]);
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      const list = Array.isArray(data) ? data : data.users || [];
      setUsers(list.filter((u) => u._id !== user?._id));
    } catch { }
  };

  const loadMessages = async (userId) => {
    try { const data = await getMessages(userId); setMessages(Array.isArray(data) ? data : []); } catch { setMessages([]); }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedUser) return;
    try {
      await sendMessage({ receiverId: selectedUser._id, content: newMsg });
      setNewMsg("");
      loadMessages(selectedUser._id);
    } catch { }
  };

  const filteredUsers = users.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader title="Messages" subtitle="Chat with students and tutors" />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
          <div className="flex h-full">
            {/* Users List */}
            <div className="w-80 border-r border-gray-100 flex flex-col shrink-0 hidden md:flex">
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredUsers.map((u) => (
                  <button key={u._id} onClick={() => setSelectedUser(u)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${selectedUser?._id === u._id ? "bg-primary/5 border-r-2 border-primary" : ""}`}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{u.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <>
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold">
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{selectedUser.name}</p>
                      <p className="text-xs text-gray-400">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {messages.map((m, i) => {
                      const isMine = (m.senderId?._id || m.senderId) === user?._id || (m.senderId?._id || m.senderId) === user?.id;
                      return (
                        <div key={m._id || i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? "bg-primary text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
                            <p>{m.content}</p>
                            <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-gray-400"}`}>
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={msgEndRef} />
                  </div>

                  <div className="px-5 py-3 border-t border-gray-100 flex gap-3">
                    <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <button onClick={handleSend} className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors">
                      <Send size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <MessageCircle size={48} className="mb-3 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">Select a conversation</p>
                  <p className="text-sm">Choose a user from the list to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
