import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { apiFetch } from "../api/client";
import { FiSend, FiUser, FiArrowLeft, FiMessageSquare, FiSearch } from "react-icons/fi";
import AdminSidebar from "../components/admin/AdminSidebar";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return formatTime(dateStr);
  return d.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
}

export default function AdminChatPage() {
  const { token, isAdmin } = useAuth();
  const { t } = useSettings();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAdmin) {
      fetchConversations();
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, token]);

  useEffect(() => {
    let interval;
    if (activeConv) {
      fetchMessages(activeConv._id);
      interval = setInterval(() => fetchMessages(activeConv._id), 3000);
    }
    return () => clearInterval(interval);
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversations() {
    try {
      const data = await apiFetch("/chat/admin", { token });
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchMessages(convId) {
    try {
      const data = await apiFetch(`/chat/admin/${convId}`, { token });
      setMessages(data.messages || []);
      setConversations(prev =>
        prev.map(c => c._id === convId ? { ...c, unreadByAdmin: false } : c)
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!content.trim() || !activeConv) return;
    try {
      const newMsg = await apiFetch("/chat/send", {
        method: "POST",
        token,
        body: { content, conversationId: activeConv._id }
      });
      setMessages(prev => [...prev, newMsg]);
      setContent("");
      inputRef.current?.focus();
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = conversations.filter(c =>
    (c.student?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.filter(c => c.unreadByAdmin).length;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] flex">
      <AdminSidebar activeTab="chat" setActiveTab={() => {}} />

      <main className="flex-1 lg:pl-72 flex flex-col h-screen pt-[60px] lg:pt-0">
        <div className="flex-1 flex overflow-hidden">

          {/* ── Conversations list ── */}
          <aside className={`
            ${activeConv ? "hidden" : "flex"} lg:flex
            flex-col w-full lg:w-80 shrink-0
            border-r border-[var(--border-soft)]
            bg-[var(--surface)]
          `}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--border-soft)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-xl">{t("messages")}</h2>
                {totalUnread > 0 && (
                  <span className="flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-full bg-[var(--accent)] text-white text-xs font-bold">
                    {totalUnread}
                  </span>
                )}
              </div>
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] text-sm" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t("search") || "Qidirish..."}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface-strong)] border border-[var(--border-soft)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-dim)] px-6 py-12">
                  <FiMessageSquare className="text-4xl opacity-30" />
                  <p className="text-sm text-center">{t("noChats")}</p>
                </div>
              ) : (
                filtered.map(conv => {
                  const isActive = activeConv?._id === conv._id;
                  const initials = getInitials(conv.student?.name);
                  return (
                    <button
                      key={conv._id}
                      onClick={() => setActiveConv(conv)}
                      className={`w-full text-left px-4 py-3.5 border-b border-[var(--border-soft)] transition-all duration-200 flex items-center gap-3 group
                        ${isActive
                          ? "bg-[var(--accent)]/10 border-l-4 border-l-[var(--accent)]"
                          : "hover:bg-[var(--surface-strong)] border-l-4 border-l-transparent"
                        }
                      `}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                          {initials}
                        </div>
                        {conv.unreadByAdmin && (
                          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--accent)] border-2 border-[var(--surface)]" />
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={`text-sm font-bold truncate ${conv.unreadByAdmin ? "text-[var(--text-main)]" : "text-[var(--text-soft)]"}`}>
                            {conv.student?.name || t("unknownUser")}
                          </span>
                          <span className="text-[11px] text-[var(--text-dim)] shrink-0">
                            {formatDate(conv.updatedAt)}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${conv.unreadByAdmin ? "text-[var(--text-soft)] font-medium" : "text-[var(--text-dim)]"}`}>
                          {conv.lastMessage || t("newChat")}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* ── Chat area ── */}
          <div className={`
            ${!activeConv ? "hidden" : "flex"} lg:flex
            flex-col flex-1 min-w-0
          `}>
            {activeConv ? (
              <>
                {/* Chat header */}
                <div className="shrink-0 px-4 py-3 bg-[var(--surface)] border-b border-[var(--border-soft)] flex items-center gap-3 shadow-sm">
                  <button
                    className="lg:hidden p-2 rounded-xl hover:bg-[var(--surface-strong)] text-[var(--text-soft)] transition-colors"
                    onClick={() => setActiveConv(null)}
                  >
                    <FiArrowLeft className="text-lg" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {getInitials(activeConv.student?.name)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-sm truncate">{activeConv.student?.name || t("userFallback")}</h2>
                    <p className="text-xs text-[var(--text-dim)] truncate">{activeConv.student?.email}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 bg-[var(--bg)]">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--text-dim)] gap-2">
                      <FiMessageSquare className="text-4xl opacity-20" />
                      <p className="text-sm">{t("noChats")}</p>
                    </div>
                  )}
                  {messages.map((msg, idx) => {
                    const fromAdmin = msg.isAdmin;
                    return (
                      <div key={msg._id || idx} className={`flex items-end gap-2 ${fromAdmin ? "flex-row-reverse" : "flex-row"}`}>
                        {!fromAdmin && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white text-xs font-bold shrink-0 mb-0.5">
                            {getInitials(activeConv.student?.name)}
                          </div>
                        )}
                        <div className={`group max-w-[70%] flex flex-col gap-1 ${fromAdmin ? "items-end" : "items-start"}`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                            ${fromAdmin
                              ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-sm"
                              : "bg-[var(--surface)] border border-[var(--border-soft)] text-[var(--text-main)] rounded-bl-sm"
                            }
                          `}>
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                          <span className="text-[10px] text-[var(--text-dim)] px-1">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form
                  onSubmit={handleSend}
                  className="shrink-0 px-4 py-3 bg-[var(--surface)] border-t border-[var(--border-soft)] flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border-soft)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] outline-none focus:border-[var(--accent)] transition-colors"
                    placeholder={t("replyPlaceholder")}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
                  />
                  <button
                    type="submit"
                    disabled={!content.trim()}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md hover:shadow-indigo-500/40 disabled:opacity-40 disabled:shadow-none transition-all duration-200 shrink-0"
                  >
                    <FiSend className="text-lg" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-dim)] gap-4">
                <div className="w-20 h-20 rounded-3xl bg-[var(--surface)] border border-[var(--border-soft)] flex items-center justify-center shadow-sm">
                  <FiMessageSquare className="text-4xl opacity-30" />
                </div>
                <p className="text-sm font-medium">{t("selectChat")}</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
