import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  FiBarChart2,
  FiBook,
  FiClipboard,
  FiGrid,
  FiMail,
  FiMessageSquare,
  FiPlusSquare,
  FiTag,
  FiUsers
} from 'react-icons/fi';
import Sidebar from './Sidebar';
import SiteHeader from '../../components/layout/SiteHeader';
import { useSettings } from '../../context/SettingsContext';

const Layout = () => {
  const { t, language } = useSettings();

  const mobileItems = [
    { label: t('dashboard') || 'Dashboard', icon: FiGrid, path: '/admin', end: true },
    { label: t('navCourses') || 'Kurslar', icon: FiBook, path: '/admin/courses' },
    { label: t('addContent') || "Qo'shish", icon: FiPlusSquare, path: '/admin/add-course' },
    { label: t('categories') || 'Kategoriyalar', icon: FiTag, path: '/admin/categories' },
    { label: t('studentsLabel') || 'Foydalanuvchilar', icon: FiUsers, path: '/admin/users' },
    { label: t('analytics') || 'Analitika', icon: FiBarChart2, path: '/admin/analytics' },
    { label: t('comments') || 'Izohlar', icon: FiMessageSquare, path: '/admin/comments' },
    { label: language === 'ru' ? 'Тесты' : 'Savollar', icon: FiClipboard, path: '/admin/quizzes' },
    { label: language === 'ru' ? 'Чат' : 'Chat', icon: FiMail, path: '/admin/chat' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] transition-colors duration-300">
      <SiteHeader />
      <div className="sticky top-16 z-40 border-b border-[var(--border-soft)] bg-[var(--bg)]/95 px-3 py-2 backdrop-blur-xl lg:hidden">
        <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Admin menu">
          {mobileItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-black transition-all ${
                  isActive
                    ? 'border-indigo-500/30 bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'border-[var(--border-soft)] bg-[var(--surface-sunken)] text-[var(--text-soft)] hover:bg-[var(--surface-strong)] hover:text-[var(--text-main)]'
                }`
              }
            >
              <item.icon size={15} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:min-h-[calc(100vh-4rem)] lg:pl-72 lg:pr-8 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
