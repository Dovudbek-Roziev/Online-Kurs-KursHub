import { useEffect, useState, useRef } from 'react';
import { FiSend, FiArrowLeft, FiMessageSquare, FiSearch, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { apiFetch } from '../../api/client';

function Avatar({ name, size = 10 }) {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-indigo-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
  ];
  const letter = (name || '?')[0].toUpperCase();
  const colorIndex = letter.charCodeAt(0) % colors.length;
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold shrink-0`}
      style={{ fontSize: size <= 8 ? 12 : 14 }}>
      {letter}
    </div>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function Chat() {
  const { token } = useAuth();
  const { language } = useSettings();
  const lbl = (uz, ru) => language === 'ru' ? ru : uz;

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    const iv = setInterval(fetchConversations, 5000);
    return () => clearInterval(iv);
  }, [token]);

  useEffect(() => {
    if (!activeConv) return;
    fetchMessages(activeConv._id);
    const iv = setInterval(() => fetchMessages(activeConv._id), 3000);
    return () => clearInterval(iv);
  }, [activeConv?._id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeConv) inputRef.current?.focus();
  }, [activeConv]);

  async function fetchConversations() {
    try {
      const data = await apiFetch('/chat/admin', { token });
      setConversations(data);
    } catch {}
  }

  async function fetchMessages(convId) {
    try {
      const data = await apiFetch(`/chat/admin/${convId}`, { token });
      setMessages(data.messages || []);
      setConversations(prev => prev.map(c => c._id === convId ? { ...c, unreadByAdmin: false } : c));
    } catch {}
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!content.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      const msg = await apiFetch('/chat/send', { method: 'POST', token, body: { content, conversationId: activeConv._id } });
      setMessages(prev => [...prev, msg]);
      setContent('');
    } catch {}
    setSending(false);
  }

  const filtered = conversations.filter(c =>
    !search || (c.student?.name || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalUnread = conversations.filter(c => c.unreadByAdmin).length;

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 md:-m-6 lg:-m-8 overflow-hidden rounded-none">

      {/* ── Left Panel ── */}
      <div className={`${activeConv ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 xl:w-96 border-r border-[var(--border-soft)] bg-[var(--surface-strong)] shrink-0`}>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[var(--border-soft)] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-main)]">{lbl('Xabarlar', 'Сообщения')}</h2>
              <p className="text-[10px] text-[var(--text-dim)] mt-0.5">
                {conversations.length} {lbl('suhbat', 'диалогов')}
                {totalUnread > 0 && <span className="ml-1 text-indigo-500 font-semibold">· {totalUnread} {lbl('yangi', 'новых')}</span>}
              </p>
            </div>
            {totalUnread > 0 && (
              <span className="text-[10px] font-bold bg-indigo-600 text-white rounded-full px-2.5 py-1 shadow-sm shadow-indigo-500/30">
                {totalUnread}
              </span>
            )}
          </div>
          {/* Search */}
          <div className="relative">
            <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lbl('Qidirish...', 'Поиск...')}
              className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] pl-8 pr-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-dim)] gap-3 py-16">
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border-soft)] flex items-center justify-center">
                <FiMessageSquare size={22} className="opacity-40" />
              </div>
              <p className="text-xs font-medium">{lbl("Xabar yo'q", 'Нет сообщений')}</p>
            </div>
          ) : filtered.map(conv => {
            const isActive = activeConv?._id === conv._id;
            return (
              <button
                key={conv._id}
                onClick={() => setActiveConv(conv)}
                className={`w-full text-left px-4 py-4 border-b border-[var(--border-soft)] transition-all flex items-center gap-3 group relative
                  ${isActive
                    ? 'bg-indigo-500/8 border-l-[3px] border-l-indigo-500'
                    : 'hover:bg-[var(--surface)] border-l-[3px] border-l-transparent'
                  }`}
              >
                <div className="relative shrink-0">
                  <Avatar name={conv.student?.name} size={10} />
                  {conv.unreadByAdmin && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-[var(--surface-strong)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`text-xs font-semibold truncate ${isActive ? 'text-indigo-500' : 'text-[var(--text-main)]'}`}>
                      {conv.student?.name || lbl("Noma'lum", 'Неизвестно')}
                    </span>
                    {conv.lastMessageAt && (
                      <span className="text-[9px] text-[var(--text-dim)] shrink-0">{formatTime(conv.lastMessageAt)}</span>
                    )}
                  </div>
                  <p className={`text-[10px] truncate ${conv.unreadByAdmin ? 'text-[var(--text-soft)] font-medium' : 'text-[var(--text-dim)]'}`}>
                    {conv.lastMessage || lbl('Yangi chat', 'Новый чат')}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className={`${!activeConv ? 'hidden lg:flex' : 'flex'} flex-col flex-1 min-w-0 bg-[var(--bg)]`}>
        {activeConv ? (
          <>
            {/* Chat header */}
            <div className="px-5 py-3.5 border-b border-[var(--border-soft)] bg-[var(--surface-strong)] flex items-center gap-3 shrink-0">
              <button
                className="lg:hidden p-2 rounded-xl hover:bg-[var(--surface)] text-[var(--text-dim)] transition-colors shrink-0"
                onClick={() => setActiveConv(null)}
              >
                <FiArrowLeft size={16} />
              </button>
              <Avatar name={activeConv.student?.name} size={9} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[var(--text-main)] truncate">{activeConv.student?.name}</p>
                <p className="text-[10px] text-[var(--text-dim)] truncate">{activeConv.student?.email}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-500 font-medium">{lbl('Faol', 'Активен')}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-dim)] gap-3">
                  <FiMessageSquare size={32} className="opacity-20" />
                  <p className="text-xs">{lbl("Xabarlar yo'q", 'Нет сообщений')}</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isAdmin = msg.isAdmin;
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
                    <div className={`flex items-end gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      {!isAdmin && (
                        <div className="shrink-0 mb-1">
                          <Avatar name={activeConv.student?.name} size={7} />
                        </div>
                      )}
                      <div className={`max-w-[72%] group`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                          isAdmin
                            ? 'bg-indigo-600 text-white rounded-br-sm shadow-indigo-500/20'
                            : 'bg-[var(--surface-strong)] border border-[var(--border-soft)] text-[var(--text-main)] rounded-bl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        {isAdmin && (
                          <div className="flex justify-end mt-1 items-center gap-1">
                            <FiCheck size={10} className="text-[var(--text-dim)]" />
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="shrink-0 mb-1 w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                          A
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                  placeholder={lbl('Javob yozing...', 'Напишите ответ...')}
                  className="flex-1 bg-transparent text-sm text-[var(--text-main)] outline-none placeholder:text-[var(--text-dim)]"
                />
                <button
                  type="submit"
                  disabled={!content.trim() || sending}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-all shrink-0 shadow-sm"
                >
                  <FiSend size={13} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-dim)] gap-4">
            <div className="w-20 h-20 rounded-3xl bg-[var(--surface-strong)] border border-[var(--border-soft)] flex items-center justify-center shadow-sm">
              <FiMessageSquare size={36} className="opacity-20" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--text-soft)]">{lbl('Chatni tanlang', 'Выберите чат')}</p>
              <p className="text-xs text-[var(--text-dim)] mt-1">{lbl("Chap paneldan suhbatni oching", 'Откройте диалог слева')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
