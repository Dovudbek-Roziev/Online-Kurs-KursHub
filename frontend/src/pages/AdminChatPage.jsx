import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { apiFetch } from "../api/client";
import { FiSend, FiUser, FiArrowLeft, FiMessageSquare } from "react-icons/fi";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminChatPage() {
  const { token, isAdmin } = useAuth();
  const { t } = useSettings();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef(null);

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
      // Optimistically clear unread status if it's the active one
      setConversations(prev => prev.map(c => c._id === convId ? { ...c, unreadByAdmin: false } : c));
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
      setMessages([...messages, newMsg]);
      setContent("");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] flex">
      <AdminSidebar activeTab="chat" setActiveTab={() => {}} />

      <main className="flex-1 lg:pl-72 flex flex-col h-screen pt-[60px] lg:pt-0">
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar Conversations */}
          <div className={`${activeConv ? "hidden" : "flex"} lg:flex flex-col w-full lg:w-80 border-r border-[var(--border-soft)] bg-[var(--surface)]`}>
            <div className="p-4 border-b border-[var(--border-soft)]">
              <h2 className="font-black text-xl">{t("messages")}</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => (
                <div 
                  key={conv._id} 
                  className={`p-4 border-b border-[var(--border-soft)] cursor-pointer hover:bg-[var(--surface-sunken)] transition-colors ${activeConv?._id === conv._id ? "bg-[var(--surface-sunken)] border-l-4 border-l-[var(--accent)]" : "border-l-4 border-l-transparent"}`}
                  onClick={() => setActiveConv(conv)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm truncate">{conv.student?.name || t("unknownUser")}</span>
                    {conv.unreadByAdmin && <span className="w-3 h-3 rounded-full bg-[var(--accent)]"></span>}
                  </div>
                  <p className="text-xs text-[var(--text-dim)] truncate">{conv.lastMessage || t("newChat")}</p>
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="p-8 text-center text-[var(--text-dim)]">{t("noChats")}</div>
              )}
            </div>
          </div>

          {/* Active Chat Area */}
          <div className={`${!activeConv ? "hidden" : "flex"} lg:flex flex-col flex-1 bg-[var(--bg-main)]`}>
            {activeConv ? (
              <>
                <div className="p-4 bg-[var(--surface)] border-b border-[var(--border-soft)] flex items-center gap-3">
                  <button className="lg:hidden p-2 bg-[var(--surface-sunken)] rounded-xl" onClick={() => setActiveConv(null)}>
                    <FiArrowLeft />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white">
                    <FiUser />
                  </div>
                  <div>
                    <h2 className="font-bold">{activeConv.student?.name || t("userFallback")}</h2>
                    <p className="text-xs text-[var(--text-dim)]">{activeConv.student?.email}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => {
                    const isAdmin = msg.isAdmin;
                    return (
                      <div key={msg._id || idx} className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`p-3 rounded-2xl max-w-[75%] ${isAdmin ? "bg-[var(--accent)] text-[var(--bg)] rounded-tr-none" : "bg-[var(--surface-sunken)] border border-[var(--border-soft)] text-[var(--text-main)] rounded-tl-none"}`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 bg-[var(--surface)] border-t border-[var(--border-soft)] flex gap-2">
                  <input
                    type="text"
                    className="input-ui flex-1 !rounded-2xl"
                    placeholder={t("replyPlaceholder")}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <button type="submit" className="primary-btn !rounded-2xl !w-12 !h-12 flex items-center justify-center shrink-0" disabled={!content.trim()}>
                    <FiSend />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-dim)]">
                <FiMessageSquare className="text-6xl mb-4 opacity-20" />
                <p>{t("selectChat")}</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
