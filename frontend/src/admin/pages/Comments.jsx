import React, { useEffect, useState } from 'react';
import { FiMessageSquare, FiTrash2, FiUser } from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';

const Comments = () => {
  const { t, language } = useSettings();
  const { token } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/comments', { token })
      .then(setComments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/admin/comments/${id}`, { method: 'DELETE', token });
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return Math.floor(hrs / 24) + 'd';
  };

  return (
    <div className="bg-[var(--surface-strong)] border border-[var(--border-soft)] rounded-lg md:rounded-xl overflow-hidden animate-reveal">
      <div className="p-3 md:p-6 border-b border-[var(--border-soft)] flex justify-between items-center gap-2">
        <h2 className="text-sm md:text-lg font-bold text-[var(--text-main)]">{t('comments') || 'Comments'}</h2>
        <span className="text-[10px] md:text-xs font-medium text-[var(--text-dim)] bg-[var(--surface)] px-2 md:px-2.5 py-1 rounded-full border border-[var(--border-soft)]">
          {comments.length}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-14 text-center">
          <FiMessageSquare size={32} className="mx-auto text-[var(--text-dim)] mb-3" />
          <p className="text-sm font-bold text-[var(--text-dim)]">
            {language === 'ru' ? 'Комментариев нет' : 'Izoh topilmadi'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-soft)]">
          {comments.map((comment) => (
            <div key={comment._id} className="p-3 md:p-6 hover:bg-[var(--surface)] transition-all group">
              <div className="flex gap-2 md:gap-4">
                <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg bg-[var(--surface)] border border-[var(--border-soft)] flex items-center justify-center text-[var(--text-dim)] shrink-0">
                  <FiUser size={14} />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      <span className="text-xs md:text-sm font-bold text-[var(--text-main)]">
                        {comment.userId?.name || 'User'}
                      </span>
                      {comment.videoId?.title && (
                        <>
                          <span className="text-[10px] text-[var(--text-dim)]">→</span>
                          <span className="text-[10px] md:text-xs font-medium text-indigo-400 truncate max-w-[140px] md:max-w-xs">
                            {comment.videoId.title}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-[var(--text-dim)]">{formatDate(comment.createdAt)}</span>
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="ml-1 p-1.5 opacity-0 group-hover:opacity-100 text-[var(--text-dim)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-[var(--text-soft)] leading-relaxed">{comment.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;
