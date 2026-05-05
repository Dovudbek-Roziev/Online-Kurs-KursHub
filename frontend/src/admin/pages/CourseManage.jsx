import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiVideo, FiClipboard, FiChevronDown, FiChevronUp,
  FiClock, FiAlertCircle, FiPlus, FiTrash2, FiUploadCloud, FiX,
  FiCheck, FiPlay, FiLayers
} from 'react-icons/fi';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const INPUT = 'w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] outline-none focus:border-indigo-500 transition-colors';

function Spinner({ small }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-indigo-500 border-t-transparent ${small ? 'h-4 w-4' : 'h-6 w-6'}`} />
  );
}

export default function CourseManage() {
  const { courseId } = useParams();
  const { token } = useAuth();
  const { language } = useSettings();
  const navigate = useNavigate();
  const tx = (uz, ru) => language === 'ru' ? ru : uz;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  // Add chapter state
  const [addingChapter, setAddingChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [savingChapter, setSavingChapter] = useState(false);

  // Per-chapter video upload state
  const [videoForms, setVideoForms] = useState({});
  const [uploadingVideo, setUploadingVideo] = useState({});

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  async function loadCourse() {
    setLoading(true);
    try {
      const data = await apiFetch(`/courses/${courseId}`, { token });
      setCourse(data);
      if (data.chapters?.length > 0) {
        setExpanded({ [data.chapters[0]._id]: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggle(id) {
    setExpanded(p => ({ ...p, [id]: !p[id] }));
  }

  function fmt(sec) {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  // Chapter actions
  async function addChapter(e) {
    e.preventDefault();
    if (!chapterTitle.trim()) return;
    setSavingChapter(true);
    try {
      const order = (course.chapters?.length || 0) + 1;
      await apiFetch(`/admin/courses/${courseId}/chapters`, {
        method: 'POST', token, body: { title: chapterTitle.trim(), order }
      });
      setChapterTitle('');
      setAddingChapter(false);
      await loadCourse();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingChapter(false);
    }
  }

  async function deleteChapter(chapterId) {
    if (!confirm(tx("Bu bo'limni o'chirasizmi?", 'Удалить этот раздел?'))) return;
    try {
      await apiFetch(`/admin/chapters/${chapterId}`, { method: 'DELETE', token });
      await loadCourse();
    } catch (err) {
      setError(err.message);
    }
  }

  // Video actions
  function openVideoForm(chapterId) {
    setVideoForms(p => ({ ...p, [chapterId]: { title: '', description: '', file: null, preview: null } }));
    setExpanded(p => ({ ...p, [chapterId]: true }));
  }

  function closeVideoForm(chapterId) {
    setVideoForms(p => { const n = { ...p }; delete n[chapterId]; return n; });
  }

  function updateVideoForm(chapterId, key, val) {
    setVideoForms(p => ({ ...p, [chapterId]: { ...p[chapterId], [key]: val } }));
  }

  async function uploadVideo(e, chapterId) {
    e.preventDefault();
    const vf = videoForms[chapterId];
    if (!vf?.title.trim() || !vf?.file) return;
    setUploadingVideo(p => ({ ...p, [chapterId]: true }));
    try {
      const chapter = course.chapters.find(c => c._id === chapterId);
      const order = (chapter?.videos?.length || 0) + 1;
      const fd = new FormData();
      fd.append('title', vf.title.trim());
      fd.append('description', vf.description?.trim() || '');
      fd.append('order', String(order));
      fd.append('video', vf.file);
      await apiFetch(`/admin/chapters/${chapterId}/videos`, { method: 'POST', token, body: fd });
      closeVideoForm(chapterId);
      await loadCourse();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingVideo(p => ({ ...p, [chapterId]: false }));
    }
  }

  async function deleteVideo(videoId) {
    if (!confirm(tx("Bu videoni o'chirasizmi?", 'Удалить это видео?'))) return;
    try {
      await apiFetch(`/admin/videos/${videoId}`, { method: 'DELETE', token });
      await loadCourse();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  }

  if (error && !course) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm font-bold text-rose-400">
        <FiAlertCircle size={18} /> {error}
      </div>
    );
  }

  const totalVideos = course.chapters?.reduce((a, c) => a + (c.videos?.length || 0), 0) || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate('/admin/courses')}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-strong)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
        >
          <FiArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-lg font-black text-[var(--text-main)]">{course.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Stat icon={<FiLayers size={10} />} val={`${course.chapters?.length || 0} ${tx("bo'lim", 'разд.')}`} />
            <Stat icon={<FiPlay size={10} />} val={`${totalVideos} ${tx('video', 'видео')}`} />
            {course.price > 0
              ? <span className="text-[10px] font-bold text-emerald-400">{course.price.toLocaleString()} UZS</span>
              : <span className="text-[10px] font-bold text-indigo-400">{tx('Bepul', 'Бесплатно')}</span>
            }
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-400 flex items-center gap-2">
          <FiAlertCircle size={13} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><FiX size={13} /></button>
        </div>
      )}

      {/* Chapters */}
      <div className="space-y-3">
        {!course.chapters?.length && !addingChapter && (
          <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-strong)] py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
              <FiLayers size={20} />
            </div>
            <p className="text-sm font-bold text-[var(--text-dim)]">{tx("Hali bo'lim qo'shilmagan", 'Разделов пока нет')}</p>
            <button
              onClick={() => setAddingChapter(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600/10 px-4 py-2 text-xs font-bold text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
            >
              <FiPlus size={12} /> {tx("Birinchi bo'limni qo'shish", 'Добавить первый раздел')}
            </button>
          </div>
        )}

        {course.chapters?.map((chapter, idx) => {
          const isOpen = !!expanded[chapter._id];
          const vf = videoForms[chapter._id];
          const uploading = !!uploadingVideo[chapter._id];

          return (
            <div key={chapter._id} className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)]">
              {/* Chapter header */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <button
                  onClick={() => toggle(chapter._id)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-[11px] font-black text-indigo-400">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--text-main)]">{chapter.title}</p>
                    <p className="text-[10px] text-[var(--text-dim)] mt-0.5">
                      {chapter.videos?.length || 0} {tx('ta video', 'видео')}
                      {chapter.quiz?.questions?.length > 0 && (
                        <span className="ml-2 text-violet-400">· {chapter.quiz.questions.length} {tx('savol', 'вопр.')}</span>
                      )}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openVideoForm(chapter._id)}
                    title={tx("Video qo'shish", 'Добавить видео')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    <FiPlus size={11} /> {tx('Video', 'Видео')}
                  </button>
                  <Link
                    to={`/admin/quiz/${chapter._id}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-violet-500/10 text-violet-400 hover:bg-violet-600 hover:text-white transition-colors"
                  >
                    <FiClipboard size={11} /> {tx('Test', 'Тест')}
                  </Link>
                  <button
                    onClick={() => deleteChapter(chapter._id)}
                    className="p-1.5 rounded-lg text-[var(--text-dim)] hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                  >
                    <FiTrash2 size={13} />
                  </button>
                  <button onClick={() => toggle(chapter._id)} className="p-1.5 text-[var(--text-dim)]">
                    {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {isOpen && (
                <div className="border-t border-[var(--border-soft)]">
                  {/* Video upload form */}
                  {vf && (
                    <VideoUploadForm
                      vf={vf}
                      uploading={uploading}
                      tx={tx}
                      onChange={(k, v) => updateVideoForm(chapter._id, k, v)}
                      onSubmit={e => uploadVideo(e, chapter._id)}
                      onClose={() => closeVideoForm(chapter._id)}
                    />
                  )}

                  {/* Video list */}
                  {chapter.videos?.length > 0 ? (
                    <div className="divide-y divide-[var(--border-soft)]">
                      {chapter.videos.map((video, vIdx) => (
                        <div key={video._id} className="flex items-center gap-3 px-4 py-3 group hover:bg-[var(--surface)] transition-colors">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--surface-sunken)] text-[9px] font-black text-[var(--text-dim)]">
                            {vIdx + 1}
                          </span>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                            <FiPlay size={12} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-bold text-[var(--text-main)]">{video.title}</p>
                            {video.description && (
                              <p className="text-[10px] text-[var(--text-dim)] truncate mt-0.5">{video.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[10px] text-[var(--text-dim)]">
                              <FiClock size={9} /> {fmt(video.duration)}
                            </span>
                            <button
                              onClick={() => deleteVideo(video._id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--text-dim)] hover:text-rose-400 transition-all"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !vf ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-[var(--text-dim)] mb-2">{tx("Hali video yo'q", 'Видео пока нет')}</p>
                      <button
                        onClick={() => openVideoForm(chapter._id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                      >
                        <FiPlus size={11} /> {tx("Video qo'shish", 'Добавить видео')}
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}

        {/* Add chapter form */}
        {addingChapter ? (
          <form onSubmit={addChapter} className="rounded-2xl border border-indigo-500/30 bg-[var(--surface-strong)] p-4 flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-[11px] font-black text-indigo-400">
              {(course.chapters?.length || 0) + 1}
            </span>
            <input
              autoFocus
              type="text"
              value={chapterTitle}
              onChange={e => setChapterTitle(e.target.value)}
              placeholder={tx("Bo'lim nomi", 'Название раздела')}
              className="flex-1 rounded-xl border border-[var(--border-soft)] bg-[var(--bg)] px-3.5 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] outline-none focus:border-indigo-500 transition-colors"
            />
            <button type="submit" disabled={savingChapter || !chapterTitle.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {savingChapter ? <Spinner small /> : <FiCheck size={13} />}
              {tx('Saqlash', 'Сохранить')}
            </button>
            <button type="button" onClick={() => { setAddingChapter(false); setChapterTitle(''); }}
              className="p-2 rounded-xl hover:bg-[var(--surface)] text-[var(--text-dim)] transition-colors">
              <FiX size={14} />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setAddingChapter(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border-soft)] py-4 text-xs font-bold text-[var(--text-dim)] hover:border-indigo-500/40 hover:text-indigo-400 transition-all"
          >
            <FiPlus size={14} /> {tx("Yangi bo'lim qo'shish", 'Добавить новый раздел')}
          </button>
        )}
      </div>
    </div>
  );
}

function VideoUploadForm({ vf, uploading, tx, onChange, onSubmit, onClose }) {
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange('file', file);
    onChange('preview', URL.createObjectURL(file));
  }

  return (
    <form onSubmit={onSubmit} className="m-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
          {tx("Video qo'shish", 'Добавить видео')}
        </span>
        <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--surface)] text-[var(--text-dim)]">
          <FiX size={13} />
        </button>
      </div>

      <input
        autoFocus
        type="text"
        value={vf.title}
        onChange={e => onChange('title', e.target.value)}
        placeholder={tx('Video sarlavhasi *', 'Название видео *')}
        className={INPUT}
      />
      <input
        type="text"
        value={vf.description || ''}
        onChange={e => onChange('description', e.target.value)}
        placeholder={tx('Tavsif (ixtiyoriy)', 'Описание (необязательно)')}
        className={INPUT}
      />

      {/* File pick */}
      <input ref={fileRef} type="file" accept="video/*" onChange={handleFile} className="hidden" />
      {vf.file ? (
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shrink-0">
            <FiVideo size={13} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--text-main)] truncate">{vf.file.name}</p>
            <p className="text-[10px] text-[var(--text-dim)]">{(vf.file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <button type="button" onClick={() => { onChange('file', null); onChange('preview', null); }}
            className="p-1 rounded-lg hover:bg-rose-500/10 text-[var(--text-dim)] hover:text-rose-400">
            <FiX size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 border-dashed border-[var(--border-soft)] hover:border-indigo-500/40 text-[var(--text-dim)] hover:text-indigo-400 transition-all"
        >
          <FiUploadCloud size={16} />
          <span className="text-xs font-semibold">{tx("Video faylni tanlang", 'Выберите видео файл')}</span>
          <span className="text-[10px] ml-auto opacity-60">MP4, MOV, AVI</span>
        </button>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          {tx("Yuklanmoqda... Iltimos kuting", 'Загрузка... Пожалуйста подождите')}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-dim)] hover:bg-[var(--surface)] transition-colors">
          {tx('Bekor', 'Отмена')}
        </button>
        <button type="submit" disabled={uploading || !vf.title.trim() || !vf.file}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {uploading
            ? <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> {tx('Yuklanmoqda...', 'Загрузка...')}</>
            : <><FiCheck size={12} /> {tx('Yuklash', 'Загрузить')}</>
          }
        </button>
      </div>
    </form>
  );
}

function Stat({ icon, val }) {
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-dim)]">
      {icon} {val}
    </span>
  );
}
