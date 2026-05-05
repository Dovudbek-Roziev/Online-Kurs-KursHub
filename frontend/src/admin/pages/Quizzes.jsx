import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiClipboard, FiChevronDown, FiChevronUp, FiBook, FiLayers, FiArrowRight } from 'react-icons/fi';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const Quizzes = () => {
  const { token } = useAuth();
  const { language } = useSettings();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  const tx = (uz, ru) => language === 'ru' ? ru : uz;

  useEffect(() => {
    apiFetch('/courses', { token })
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  function toggle(id) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  }

  const totalChapters = courses.reduce((a, c) => a + (c.chapters?.length || 0), 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          {
            label: tx('Jami kurslar', 'Всего курсов'),
            value: courses.length,
            icon: FiBook,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
          },
          {
            label: tx('Jami bo\'limlar', 'Всего разделов'),
            value: totalChapters,
            icon: FiLayers,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10',
          },
          {
            label: tx('Test qo\'shish mumkin', 'Можно добавить тест'),
            value: totalChapters,
            icon: FiClipboard,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
        ].map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-black text-[var(--text-main)]">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Course list */}
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-strong)] py-16 text-center">
          <p className="text-sm font-bold text-[var(--text-dim)]">
            {tx('Hali kurs yo\'q', 'Курсов пока нет')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const isOpen = !!expanded[course._id];
            const chapters = course.chapters || [];

            return (
              <div
                key={course._id}
                className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)]"
              >
                {/* Course row */}
                <button
                  onClick={() => toggle(course._id)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--surface)]"
                >
                  {/* Thumbnail */}
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt=""
                      className="h-10 w-16 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                      <FiBook size={16} className="text-indigo-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--text-main)]">{course.title}</p>
                    <p className="mt-0.5 text-[10px] text-[var(--text-dim)]">
                      {chapters.length} {tx('ta bo\'lim', 'разделов')}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                      course.isPublished
                        ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                        : 'bg-[var(--surface-sunken)] text-[var(--text-dim)] ring-1 ring-[var(--border-soft)]'
                    }`}>
                      {course.isPublished ? tx('Aktiv', 'Активен') : 'Draft'}
                    </span>
                    {isOpen
                      ? <FiChevronUp size={15} className="text-[var(--text-dim)]" />
                      : <FiChevronDown size={15} className="text-[var(--text-dim)]" />
                    }
                  </div>
                </button>

                {/* Chapters */}
                {isOpen && (
                  <div className="border-t border-[var(--border-soft)]">
                    {chapters.length === 0 ? (
                      <p className="px-5 py-5 text-center text-xs font-bold text-[var(--text-dim)]">
                        {tx("Bo'lim yo'q", 'Разделов нет')}
                      </p>
                    ) : (
                      <div className="divide-y divide-[var(--border-soft)]">
                        {chapters.map((ch, idx) => (
                          <div
                            key={ch._id}
                            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface)]"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-[10px] font-black text-violet-400">
                              {idx + 1}
                            </span>

                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-bold text-[var(--text-main)]">{ch.title}</p>
                              <p className="mt-0.5 text-[9px] text-[var(--text-dim)]">
                                {ch.videos?.length || 0} {tx('ta video', 'видео')}
                              </p>
                            </div>

                            <Link
                              to={`/admin/quiz/${ch._id}`}
                              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-md shadow-violet-600/20 transition-colors hover:bg-violet-500"
                            >
                              <FiClipboard size={11} />
                              {tx("Savollar", 'Вопросы')}
                              <FiArrowRight size={10} />
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Quizzes;
