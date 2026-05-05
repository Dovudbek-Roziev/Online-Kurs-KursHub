import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { apiFetch } from "../api/client";
import { FiSend, FiShield, FiMessageSquare } from "react-icons/fi";

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  return isToday
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatPage() {
  const { user, token } = useAuth();
  const { t, language } = useSettings();
  const lbl = (uz, ru) => language === "ru" ? ru : uz;
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const iv = setInterval(fetchMessages, 3000);
    return () => clearInterval(iv);
  }, [token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    if (!token) return;
    try {
      const data = await apiFetch("/chat/my", { token });
      setMessages(data.messages || []);
    } catch {}
    setLoading(false);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      const msg = await apiFetch("/chat/send", { method: "POST", token, body: { content } });
      setMessages(prev => [...prev, msg]);
      setContent("");
      inputRef.current?.focus();
    } catch {}
    setSending(false);
  }

  const initials = (user?.name || "S").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg)] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-2xl flex flex-col bg-[var(--surface-strong)] border border-[var(--border-soft)] rounded-3xl overflow-hidden shadow-2xl shadow-black/10" style={{ height: "75vh" }}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-soft)] bg-[var(--surface-strong)] flex items-center gap-3.5 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
            <FiShield size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--text-main)]">{lbl("Admin", "Администратор")}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-[10px] text-emerald-500 font-medium">{lbl("Faol", "Онлайн")}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--text-dim)]">{lbl("Yordam markazi", "Служба поддержки")}</p>
            <p className="text-[9px] text-[var(--text-dim)] mt-0.5">{lbl("To'lov va savollar", "Оплата и вопросы")}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center">
                <FiMessageSquare size={28} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-main)] mb-1">
                  {lbl("Admin bilan bog'laning", "Свяжитесь с администратором")}
                </p>
                <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                  {lbl(
                    "Kurs haqida savol yoki to'lov chekingizni yuboring — admin tezda javob beradi.",
                    "Задайте вопрос о курсе или отправьте чек оплаты — администратор ответит быстро."
                  )}
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine = !msg.isAdmin;
              const showTime = i === 0 || new Date(msg.createdAt) - new Date(messages[i - 1]?.createdAt) > 5 * 60 * 1000;

              return (
                <div key={msg._id || i}>
                  {showTime && msg.createdAt && (
                    <div className="flex justify-center my-2">
                      <span className="text-[9px] text-[var(--text-dim)] bg-[var(--surface)] px-2.5 py-1 rounded-full border border-[var(--border-soft)]">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <div className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                    {!isMine && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shrink-0 mb-0.5">
                        <FiShield size={12} />
                      </div>
                    )}
                    <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                      isMine
                        ? "bg-indigo-600 text-white rounded-br-sm shadow-indigo-500/20"
                        : "bg-[var(--surface)] border border-[var(--border-soft)] text-[var(--text-main)] rounded-bl-sm"
                    }`}>
                      {msg.content}
                    </div>
                    {isMine && (
                      <div className="w-7 h-7 rounded-xl bg-[var(--surface-strong)] border border-[var(--border-soft)] flex items-center justify-center text-[var(--text-main)] text-[10px] font-black shrink-0 mb-0.5">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="px-4 py-3.5 border-t border-[var(--border-soft)] bg-[var(--surface-strong)] shrink-0">
          <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border-soft)] rounded-2xl px-4 py-2.5 focus-within:border-indigo-500 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={lbl("Xabar yozing...", "Напишите сообщение...")}
              className="flex-1 bg-transparent text-sm text-[var(--text-main)] outline-none placeholder:text-[var(--text-dim)]"
            />
            <button
              type="submit"
              disabled={!content.trim() || sending}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-all shrink-0 shadow-sm"
            >
              {sending
                ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <FiSend size={13} />
              }
            </button>
          </div>
          <p className="text-[9px] text-[var(--text-dim)] text-center mt-2">
            {lbl("Odatda 1-2 soat ichida javob beriladi", "Обычно отвечаем в течение 1-2 часов")}
          </p>
        </form>
      </div>
    </div>
  );
}
