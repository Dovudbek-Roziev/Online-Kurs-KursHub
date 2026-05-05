import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiCheck, FiEdit2, FiClipboard, FiX } from 'react-icons/fi';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const EMPTY_Q = { question: '', options: ['', '', '', ''], correctIndex: 0 };
const LETTERS = ['A', 'B', 'C', 'D'];

export default function ManageQuiz() {
  const { chapterId } = useParams();
  const { token } = useAuth();
  const { language } = useSettings();
  const navigate = useNavigate();
  const tx = (uz, ru) => language === 'ru' ? ru : uz;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(EMPTY_Q);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    apiFetch(`/admin/chapters/${chapterId}/quiz`, { token })
      .then(d => setQuestions(d.questions || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [chapterId, token]);

  async function saveQuiz(updated) {
    setSaving(true);
    try {
      const res = await apiFetch(`/admin/chapters/${chapterId}/quiz`, {
        method: 'POST', token, body: { questions: updated },
      });
      setQuestions(res.questions || []);
      setSuccess(tx('Saqlandi!', 'Сохранено!'));
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function submitForm(e) {
    e.preventDefault();
    if (!form.question.trim() || form.options.some(o => !o.trim())) {
      setError(tx("Barcha maydonlarni to'ldiring", 'Заполните все поля'));
      return;
    }
    setError('');
    const updated = editIndex !== null
      ? questions.map((q, i) => i === editIndex ? form : q)
      : [...questions, form];
    setShowForm(false);
    setEditIndex(null);
    setForm(EMPTY_Q);
    saveQuiz(updated);
  }

  function openEdit(idx) {
    const q = questions[idx];
    setForm({ question: q.question, options: [...q.options], correctIndex: q.correctIndex });
    setEditIndex(idx);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeForm() {
    setShowForm(false);
    setEditIndex(null);
    setForm(EMPTY_Q);
    setError('');
  }

  async function deleteAll() {
    if (!confirm(tx("Barcha savollarni o'chirasizmi?", 'Удалить все вопросы?'))) return;
    try {
      await apiFetch(`/admin/chapters/${chapterId}/quiz`, { method: 'DELETE', token });
      setQuestions([]);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-strong)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
          >
            <FiArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-black text-[var(--text-main)]">{tx('Test boshqarish', 'Управление тестом')}</h1>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">
              {questions.length} {tx('ta savol', 'вопросов')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {questions.length > 0 && !showForm && (
            <button onClick={deleteAll}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold text-rose-400 hover:bg-rose-500/10 transition-colors">
              <FiTrash2 size={12} /> {tx("Tozalash", 'Очистить')}
            </button>
          )}
          {!showForm && (
            <button
              onClick={() => { setForm(EMPTY_Q); setEditIndex(null); setShowForm(true); }}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-[11px] font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-colors"
            >
              <FiPlus size={12} /> {tx("Savol qo'shish", 'Добавить вопрос')}
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-400">
          {error}
          <button onClick={() => setError('')} className="ml-auto"><FiX size={12} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-400">
          <FiCheck size={12} /> {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={submitForm} className="rounded-2xl border border-indigo-500/25 bg-[var(--surface-strong)] shadow-xl shadow-indigo-500/5 overflow-hidden">
          {/* Form header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-soft)] bg-indigo-500/5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <FiClipboard size={13} />
              </div>
              <span className="text-sm font-black text-[var(--text-main)]">
                {editIndex !== null ? tx('Savolni tahrirlash', 'Редактирование') : tx('Yangi savol', 'Новый вопрос')}
              </span>
            </div>
            <button type="button" onClick={closeForm}
              className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--text-dim)] transition-colors">
              <FiX size={14} />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Question */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-2">
                {tx('Savol matni', 'Текст вопроса')}
              </label>
              <textarea
                autoFocus
                rows={3}
                value={form.question}
                onChange={e => setForm({ ...form, question: e.target.value })}
                placeholder={tx('Savolni kiriting...', 'Введите вопрос...')}
                className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Options */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-3">
                {tx("Javob variantlari", 'Варианты ответов')} · {tx("to'g'risini bosib belgilang", 'нажмите для выбора правильного')}
              </label>
              <div className="space-y-2.5">
                {form.options.map((opt, i) => {
                  const isCorrect = form.correctIndex === i;
                  return (
                    <div
                      key={i}
                      onClick={() => setForm({ ...form, correctIndex: i })}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${
                        isCorrect
                          ? 'border-emerald-500/40 bg-emerald-500/8 ring-1 ring-emerald-500/20'
                          : 'border-[var(--border-soft)] hover:border-[var(--text-dim)]/30'
                      }`}
                    >
                      {/* Letter badge */}
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black transition-all ${
                        isCorrect ? 'bg-emerald-500 text-white' : 'bg-[var(--surface)] text-[var(--text-dim)]'
                      }`}>
                        {isCorrect ? <FiCheck size={11} /> : LETTERS[i]}
                      </div>
                      <input
                        type="text"
                        value={opt}
                        onClick={e => e.stopPropagation()}
                        onChange={e => {
                          const opts = [...form.options];
                          opts[i] = e.target.value;
                          setForm({ ...form, options: opts });
                        }}
                        placeholder={`${LETTERS[i]} - ${tx('variant', 'вариант')}`}
                        className={`flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-dim)] ${
                          isCorrect ? 'text-emerald-600 font-semibold placeholder:text-emerald-400/50' : 'text-[var(--text-main)]'
                        }`}
                      />
                      {isCorrect && (
                        <span className="text-[9px] font-black uppercase text-emerald-500 shrink-0">
                          {tx("to'g'ri", 'верно')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={closeForm}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-dim)] hover:bg-[var(--surface-sunken)] transition-colors">
                {tx('Bekor', 'Отмена')}
              </button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-md shadow-indigo-600/20">
                {saving
                  ? <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> {tx('Saqlanmoqda...', 'Сохранение...')}</>
                  : <><FiCheck size={13} /> {tx('Saqlash', 'Сохранить')}</>
                }
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Empty state */}
      {questions.length === 0 && !showForm && (
        <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-strong)] py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
            <FiClipboard size={20} />
          </div>
          <p className="text-sm font-bold text-[var(--text-dim)]">{tx("Hali savol qo'shilmagan", 'Вопросов пока нет')}</p>
          <button onClick={() => setShowForm(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-violet-600/10 px-4 py-2 text-xs font-bold text-violet-400 hover:bg-violet-600 hover:text-white transition-colors">
            <FiPlus size={12} /> {tx("Birinchi savolni qo'shish", 'Добавить первый вопрос')}
          </button>
        </div>
      )}

      {/* Questions list */}
      {questions.length > 0 && (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={idx}
              className="group rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] overflow-hidden hover:border-[var(--text-dim)]/20 transition-all">
              {/* Question header */}
              <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-[10px] font-black text-indigo-400 mt-0.5">
                  {idx + 1}
                </span>
                <p className="flex-1 text-sm font-semibold leading-snug text-[var(--text-main)]">{q.question}</p>
                <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(idx)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-dim)] hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors">
                    <FiEdit2 size={12} />
                  </button>
                  <button onClick={() => saveQuiz(questions.filter((_, i) => i !== idx))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-dim)] hover:bg-rose-500/10 hover:text-rose-400 transition-colors">
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-1.5 px-4 pb-4">
                {q.options.map((opt, i) => (
                  <div key={i} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
                    i === q.correctIndex
                      ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20'
                      : 'bg-[var(--surface)] text-[var(--text-soft)]'
                  }`}>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-black ${
                      i === q.correctIndex ? 'bg-emerald-500 text-white' : 'bg-[var(--surface-strong)] text-[var(--text-dim)]'
                    }`}>
                      {i === q.correctIndex ? <FiCheck size={9} /> : LETTERS[i]}
                    </span>
                    <span className="truncate">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
