import React from 'react';
import { FiBell, FiMoon, FiSun, FiMenu } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const PAGE_TITLES = {
  '/admin': { uz: 'Dashboard', ru: 'Панель' },
  '/admin/courses': { uz: 'Kurslar', ru: 'Курсы' },
  '/admin/add-course': { uz: "Kurs qo'shish", ru: 'Добавить курс' },
  '/admin/categories': { uz: 'Kategoriyalar', ru: 'Категории' },
  '/admin/users': { uz: 'Foydalanuvchilar', ru: 'Пользователи' },
  '/admin/analytics': { uz: 'Analitika', ru: 'Аналитика' },
  '/admin/comments': { uz: 'Izohlar', ru: 'Комментарии' },
  '/admin/settings': { uz: 'Sozlamalar', ru: 'Настройки' },
  '/admin/quiz': { uz: 'Test boshqarish', ru: 'Управление тестом' },
  '/admin/quizzes': { uz: 'Savollar', ru: 'Тесты' },
};

const Topbar = ({ onMenuToggle }) => {
  const { language, setLanguage, theme, setTheme } = useSettings();
  const { user } = useAuth();
  const { pathname } = useLocation();

  const matchKey = Object.keys(PAGE_TITLES)
    .filter((k) => pathname === k || pathname.startsWith(k + '/'))
    .sort((a, b) => b.length - a.length)[0];

  const titles = PAGE_TITLES[matchKey] || { uz: 'Admin', ru: 'Админ' };
  const title = titles[language] || titles.uz;

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'AD';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-soft)] bg-[var(--bg)]/90 px-4 md:px-6 backdrop-blur-xl transition-colors duration-300">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-sunken)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
          aria-label="Menu"
        >
          <FiMenu size={16} />
        </button>
        <div>
          <h1 className="text-sm font-black text-[var(--text-main)] md:text-base">{title}</h1>
          <p className="hidden text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--text-dim)] sm:block">
            {language === 'ru' ? 'Панель управления · KursHub' : 'Boshqaruv paneli · KursHub'}
          </p>
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Language toggle */}
        <div className="flex items-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-sunken)] p-0.5">
          {['uz', 'ru'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all md:px-3 ${
                language === lang
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-soft)]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-sunken)] text-[var(--text-dim)] transition-colors hover:text-[var(--text-main)]"
        >
          {theme === 'dark' ? <FiSun size={15} /> : <FiMoon size={15} />}
        </button>

        {/* Bell */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-sunken)] text-[var(--text-dim)] transition-colors hover:text-[var(--text-main)]">
          <FiBell size={15} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
        </button>

        {/* Divider + User */}
        <div className="ml-1 flex items-center gap-2.5 border-l border-[var(--border-soft)] pl-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-black text-white shadow-md shadow-indigo-600/20">
            {initials}
          </div>
          <div className="hidden lg:block">
            <p className="text-[12px] font-bold leading-none text-[var(--text-main)]">
              {user?.name || 'Admin'}
            </p>
            <p className="mt-0.5 text-[9px] uppercase tracking-wider text-[var(--text-dim)]">
              {language === 'ru' ? 'Администратор' : 'Administrator'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
