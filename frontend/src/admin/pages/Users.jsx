import React, { useEffect, useState } from 'react';
import { FiMail, FiUser, FiShield, FiKey, FiBook, FiX, FiCheck } from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-[var(--bg)] border border-[var(--border-soft)] rounded-xl w-full max-w-sm shadow-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-soft)]">
        <p className="text-sm font-bold text-[var(--text-main)]">{title}</p>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-strong)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors">
          <FiX size={16} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

const Users = () => {
  const { t, language } = useSettings();
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pwdModal, setPwdModal] = useState(null);
  const [courseModal, setCourseModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const lbl = (uz, ru) => language === 'ru' ? ru : uz;

  useEffect(() => {
    apiFetch('/admin/users', { token })
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
    apiFetch('/courses')
      .then(data => setCourses(Array.isArray(data) ? data : data.courses || []))
      .catch(console.error);
  }, [token]);

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const handlePasswordSave = async () => {
    if (newPassword.length !== 6) {
      setMsg(lbl("Parol aynan 6 ta belgidan iborat bo'lishi kerak", "Пароль должен быть ровно 6 символов"));
      return;
    }
    setSaving(true); setMsg('');
    try {
      await apiFetch(`/admin/users/${pwdModal._id}/password`, { method: 'PUT', token, body: { newPassword } });
      setMsg(lbl("Parol saqlandi", "Пароль сохранён"));
      setTimeout(() => { setPwdModal(null); setMsg(''); setNewPassword(''); }, 1000);
    } catch {
      setMsg(lbl("Xatolik yuz berdi", "Произошла ошибка"));
    } finally { setSaving(false); }
  };

  const handleAssignSave = async () => {
    if (!selectedCourse) return;
    setSaving(true); setMsg('');
    try {
      await apiFetch('/admin/assign-course', { method: 'POST', token, body: { userId: courseModal._id, courseId: selectedCourse } });
      setMsg(lbl("Kurs berildi", "Курс назначен"));
      setTimeout(() => { setCourseModal(null); setMsg(''); setSelectedCourse(''); }, 1000);
    } catch (err) {
      const text = err?.message || '';
      if (text.includes('ALREADY')) setMsg(lbl("Bu kurs allaqachon berilgan", "Курс уже назначен"));
      else setMsg(lbl("Xatolik yuz berdi", "Произошла ошибка"));
    } finally { setSaving(false); }
  };

  return (
    <>
      <div className="bg-[var(--surface-strong)] border border-[var(--border-soft)] rounded-xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-[var(--border-soft)] flex justify-between items-center">
          <h2 className="text-sm md:text-base font-bold text-[var(--text-main)]">{t('studentsLabel')}</h2>
          <span className="text-xs text-[var(--text-dim)] bg-[var(--surface)] px-2.5 py-1 rounded-full border border-[var(--border-soft)]">
            {lbl('Jami', 'Всего')}: {users.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-14 text-center">
            <FiUser size={32} className="mx-auto text-[var(--text-dim)] mb-3" />
            <p className="text-sm font-bold text-[var(--text-dim)]">{lbl('Foydalanuvchi topilmadi', 'Пользователей нет')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="text-[var(--text-dim)] text-[9px] md:text-xs uppercase tracking-wider border-b border-[var(--border-soft)] bg-[var(--surface)]">
                  <th className="px-4 md:px-6 py-3 font-medium">{lbl('Foydalanuvchi', 'Пользователь')}</th>
                  <th className="px-4 md:px-6 py-3 font-medium hidden md:table-cell">{lbl('Rol', 'Роль')}</th>
                  <th className="px-4 md:px-6 py-3 font-medium text-center hidden sm:table-cell">{lbl('Sana', 'Дата')}</th>
                  <th className="px-4 md:px-6 py-3 font-medium text-center">{lbl('Amallar', 'Действия')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-[var(--surface)] transition-colors">
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border-soft)] flex items-center justify-center text-[var(--text-dim)] shrink-0">
                          <FiUser size={13} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs md:text-sm font-medium text-[var(--text-main)] truncate">{user.name}</div>
                          <div className="text-[10px] text-[var(--text-dim)] flex items-center gap-1 truncate">
                            <FiMail size={9} className="shrink-0" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {user.role === 'admin' && <FiShield size={9} />}
                        {user.role === 'admin' ? lbl('Admin', 'Админ') : lbl('Student', 'Студент')}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-[10px] md:text-xs text-[var(--text-dim)] hidden sm:table-cell">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => { setPwdModal(user); setNewPassword(''); setMsg(''); }}
                          title={lbl("Parolni o'zgartirish", 'Изменить пароль')}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border border-[var(--border-soft)] text-[var(--text-soft)] hover:text-indigo-500 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-colors"
                        >
                          <FiKey size={11} /> <span className="hidden sm:inline">{lbl('Parol', 'Пароль')}</span>
                        </button>
                        <button
                          onClick={() => { setCourseModal(user); setSelectedCourse(''); setMsg(''); }}
                          title={lbl('Kurs berish', 'Назначить курс')}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border border-[var(--border-soft)] text-[var(--text-soft)] hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-colors"
                        >
                          <FiBook size={11} /> <span className="hidden sm:inline">{lbl('Kurs', 'Курс')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pwdModal && (
        <Modal title={`${lbl("Parol o'zgartirish", 'Изменить пароль')} — ${pwdModal.name}`} onClose={() => setPwdModal(null)}>
          <p className="text-xs text-[var(--text-dim)] mb-3">{lbl('Yangi parol (aynan 6 ta belgi)', 'Новый пароль (ровно 6 символов)')}</p>
          <input
            type="text"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            maxLength={6}
            placeholder="······"
            className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-indigo-500 transition-colors mb-3 tracking-widest text-center font-mono"
          />
          {msg && <p className={`text-xs mb-3 ${msg.includes('Xatolik') || msg.includes('Ошибка') || msg.includes('kerak') || msg.includes('должен') ? 'text-rose-500' : 'text-emerald-500'}`}>{msg}</p>}
          <button
            onClick={handlePasswordSave}
            disabled={saving || newPassword.length !== 6}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><FiCheck size={14} /> {lbl('Saqlash', 'Сохранить')}</>}
          </button>
        </Modal>
      )}

      {courseModal && (
        <Modal title={`${lbl('Kurs berish', 'Назначить курс')} — ${courseModal.name}`} onClose={() => setCourseModal(null)}>
          <p className="text-xs text-[var(--text-dim)] mb-3">{lbl('Pullik kursni tanlang', 'Выберите платный курс')}</p>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-indigo-500 transition-colors mb-3"
          >
            <option value="">{lbl('Kursni tanlang...', 'Выберите курс...')}</option>
            {courses.filter(c => c.price > 0).map(c => (
              <option key={c._id} value={c._id}>{c.title} — {c.price.toLocaleString()} UZS</option>
            ))}
          </select>
          {msg && <p className={`text-xs mb-3 ${msg.includes('Xatolik') || msg.includes('Ошибка') ? 'text-rose-500' : msg.includes('allaqachon') || msg.includes('уже') ? 'text-amber-500' : 'text-emerald-500'}`}>{msg}</p>}
          <button
            onClick={handleAssignSave}
            disabled={saving || !selectedCourse}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><FiCheck size={14} /> {lbl('Berish', 'Назначить')}</>}
          </button>
        </Modal>
      )}
    </>
  );
};

export default Users;
