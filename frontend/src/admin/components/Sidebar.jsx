import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid, FiBook, FiPlusSquare, FiTag,
  FiUsers, FiBarChart2, FiMessageSquare, FiClipboard, FiMail
} from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = (t, language) => [
  {
    label: language === 'ru' ? 'Обзор' : 'Umumiy',
    items: [
      { label: t('dashboard') || 'Dashboard', icon: FiGrid, path: '/admin', end: true },
    ],
  },
  {
    label: language === 'ru' ? 'Контент' : 'Kontent',
    items: [
      { label: t('navCourses') || 'Kurslar', icon: FiBook, path: '/admin/courses' },
      { label: t('addContent') || "Qo'shish", icon: FiPlusSquare, path: '/admin/add-course' },
      { label: t('categories') || 'Kategoriyalar', icon: FiTag, path: '/admin/categories' },
    ],
  },
  {
    label: language === 'ru' ? 'Управление' : 'Boshqaruv',
    items: [
      { label: t('studentsLabel') || 'Foydalanuvchilar', icon: FiUsers, path: '/admin/users' },
      { label: t('analytics') || 'Analitika', icon: FiBarChart2, path: '/admin/analytics' },
      { label: t('comments') || 'Izohlar', icon: FiMessageSquare, path: '/admin/comments' },
      { label: language === 'ru' ? 'Тесты' : 'Savollar', icon: FiClipboard, path: '/admin/quizzes' },
      { label: language === 'ru' ? 'Чат' : 'Chat', icon: FiMail, path: '/admin/chat' },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { t, language } = useSettings();
  const { user } = useAuth();

  const groups = NAV_GROUPS(t, language);

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'AD';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 z-[60] flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-[var(--border-soft)] bg-[var(--bg)] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-none">
          {groups.map((group, i) => (
            <div key={group.label} className={i > 0 ? "border-t border-[var(--border-soft)] pt-3" : ""}>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all ${
                        isActive
                          ? 'border border-indigo-500/20 bg-indigo-500/10 text-indigo-500'
                          : 'text-[var(--text-soft)] hover:bg-[var(--surface-strong)] hover:text-[var(--text-main)]'
                      }`
                    }
                  >
                    <item.icon size={15} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

      </aside>
    </>
  );
};

export default Sidebar;
