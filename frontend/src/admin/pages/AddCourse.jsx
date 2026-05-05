import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUploadCloud, FiPlus, FiX, FiCheck,
  FiBookOpen, FiDollarSign, FiList, FiArrowRight
} from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';

export default function AddCourse() {
  const { language } = useSettings();
  const { token } = useAuth();
  const navigate = useNavigate();
  const lbl = (uz, ru) => language === 'ru' ? ru : uz;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [outcomes, setOutcomes] = useState(['']);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  function handleThumb(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim() || !description.trim() || !category.trim()) {
      setError(lbl("Sarlavha, tavsif va kategoriya majburiy", "Название, описание и категория обязательны"));
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('description', description.trim());
      fd.append('price', isFree ? '0' : (price || '0'));
      fd.append('category', category.trim());
      fd.append('isPublished', 'true');
      const filtered = outcomes.filter(o => o.trim());
      if (filtered.length) fd.append('outcomes', JSON.stringify(filtered));
      if (thumbnail) fd.append('thumbnail', thumbnail);
      const course = await apiFetch('/admin/courses', { method: 'POST', token, body: fd });
      navigate(`/admin/courses/${course._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-xl font-black text-[var(--text-main)]">{lbl("Yangi kurs", 'Новый курс')}</h1>
        <p className="text-xs text-[var(--text-dim)] mt-1">
          {lbl("Kurs yaratilgandan keyin bo'lim va videolar qo'sha olasiz", "После создания курса можно добавить разделы и видео")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic info */}
        <Section icon={<FiBookOpen size={13} className="text-indigo-400" />} label={lbl("Asosiy ma'lumot", 'Основное')}>
          <Field label={lbl('Kurs nomi', 'Название курса')} required>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={lbl("Masalan: React.js to'liq kursi", "Например: Полный курс React.js")}
              className={INPUT}
            />
          </Field>
          <Field label={lbl('Tavsif', 'Описание')} required>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={lbl("Kurs haqida batafsil...", "Подробно о курсе...")}
              className={INPUT + ' resize-none'}
            />
          </Field>
        </Section>

        {/* Thumbnail */}
        <Section icon={<FiUploadCloud size={13} className="text-indigo-400" />} label={lbl('Muqova rasm', 'Обложка')}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleThumb} className="hidden" />
          {preview ? (
            <div className="relative group rounded-xl overflow-hidden aspect-video cursor-pointer" onClick={() => fileRef.current?.click()}>
              <img src={preview} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-semibold">
                <FiUploadCloud size={16} /> {lbl("O'zgartirish", 'Изменить')}
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setThumbnail(null); setPreview(null); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <FiX size={12} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-[var(--border-soft)] rounded-xl py-10 flex flex-col items-center gap-3 hover:border-indigo-500/60 hover:bg-indigo-500/3 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--surface)] border border-[var(--border-soft)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiUploadCloud size={20} className="text-[var(--text-dim)]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--text-soft)]">{lbl("Rasm yuklash uchun bosing", 'Нажмите для загрузки')}</p>
                <p className="text-[10px] text-[var(--text-dim)] mt-0.5">PNG, JPG · 16:9 tavsiya etiladi</p>
              </div>
            </button>
          )}
        </Section>

        {/* Price & Category */}
        <Section icon={<FiDollarSign size={13} className="text-indigo-400" />} label={lbl("Narx va kategoriya", 'Цена и категория')}>
          {/* Free toggle */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)]">
            <div>
              <p className="text-sm font-semibold text-[var(--text-main)]">{lbl("Bepul kurs", 'Бесплатный курс')}</p>
              <p className="text-[10px] text-[var(--text-dim)]">{lbl("Hamma ko'ra oladi", 'Доступен всем')}</p>
            </div>
            <Toggle on={isFree} onToggle={() => setIsFree(v => !v)} />
          </div>

          {!isFree && (
            <Field label={lbl("Narx (UZS)", 'Цена (UZS)')}>
              <input
                type="number"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0"
                className={INPUT}
              />
            </Field>
          )}

          <Field label={lbl('Kategoriya', 'Категория')} required>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder={lbl("Masalan: Dasturlash", "Например: Программирование")}
              className={INPUT}
            />
          </Field>
        </Section>

        {/* Outcomes */}
        <Section
          icon={<FiList size={13} className="text-indigo-400" />}
          label={lbl("Nima o'rganiladi", 'Чему научатся')}
          action={
            <button type="button" onClick={() => setOutcomes(p => [...p, ''])}
              className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300">
              <FiPlus size={11} /> {lbl("Qo'shish", 'Добавить')}
            </button>
          }
        >
          {outcomes.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                <FiCheck size={9} className="text-indigo-400" />
              </div>
              <input
                type="text"
                value={o}
                onChange={e => setOutcomes(p => p.map((x, xi) => xi === i ? e.target.value : x))}
                placeholder={lbl(`${i + 1}-natija`, `Результат ${i + 1}`)}
                className={INPUT + ' flex-1'}
              />
              {outcomes.length > 1 && (
                <button type="button" onClick={() => setOutcomes(p => p.filter((_, xi) => xi !== i))}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--text-dim)] hover:text-rose-400 transition-colors">
                  <FiX size={13} />
                </button>
              )}
            </div>
          ))}
        </Section>

        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.99]"
        >
          {saving
            ? <><Spinner /> {lbl('Yaratilmoqda...', 'Создание...')}</>
            : <>{lbl("Kurs yaratish", 'Создать курс')} <FiArrowRight size={15} /></>
          }
        </button>
      </form>
    </div>
  );
}

const INPUT = 'w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] outline-none focus:border-indigo-500 transition-colors';

function Section({ icon, label, action, children }) {
  return (
    <div className="bg-[var(--surface-strong)] border border-[var(--border-soft)] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">{label}</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--text-soft)] mb-1.5">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-indigo-600' : 'bg-[var(--border-soft)]'}`}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function Spinner() {
  return <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />;
}
