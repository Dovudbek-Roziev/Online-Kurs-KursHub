import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { FiSun, FiMoon, FiSettings, FiUser, FiLogOut } from "react-icons/fi";

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, setTheme, language, setLanguage, t } = useSettings();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-xl text-white tracking-tight">KursHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-800/50 p-1 rounded-2xl border border-slate-700/50">
            <NavLink 
              to="/" 
              className={({ isActive }) =>
                `px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`
              }
            >
              {t("navProduct")}
            </NavLink>
            <NavLink 
              to="/courses" 
              className={({ isActive }) =>
                `px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`
              }
            >
              {t("navCourses")}
            </NavLink>
            {user?.role === "admin" && (
              <NavLink 
                to="/admin" 
                className={({ isActive }) =>
                  `px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                      : 'text-indigo-400 hover:bg-indigo-500/10'
                  }`
                }
              >
                {t("navAdmin")}
              </NavLink>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setLanguage(language === 'uz' ? 'ru' : 'uz')}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all duration-300 text-xs font-bold uppercase tracking-wider"
              title={t("language")}
            >
              {language}
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all duration-300"
              title={t("toggleTheme")}
            >
              {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/profile"
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all duration-300"
                  title={t("profile")}
                >
                  <FiUser className="w-5 h-5" />
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all duration-300"
                  title={t("navSettings")}
                >
                  <FiSettings className="w-5 h-5" />
                </Link>
                
                <div className="flex items-center gap-3 pl-2 pr-4 border-l border-r border-slate-700 mx-1">
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-white truncate max-w-[100px]">{user.name}</div>
                </div>
                
                <button 
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all duration-300"
                  onClick={logout}
                  title={t("logout")}
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <NavLink 
                  to="/login" 
                  className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {t("login")}
                </NavLink>
                <NavLink 
                  to="/register" 
                  className="px-6 py-2.5 text-sm font-semibold bg-white text-slate-900 rounded-full hover:bg-slate-200 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  {t("register")}
                </NavLink>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? (
                <svg className="w-5 h-5 animate-fade-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 animate-fade-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-slate-900 border-b border-slate-800 shadow-2xl animate-slide-down origin-top">
          <div className="px-4 py-6 space-y-2 max-w-7xl mx-auto">
            {user && (
              <div className="flex items-center gap-4 p-4 mb-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="text-white font-semibold">{user.name}</div>
                  <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider">{user.role}</div>
                </div>
              </div>
            )}
            
            <NavLink to="/" className={({ isActive }) => `block px-5 py-4 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              {t("navProduct")}
            </NavLink>
            <NavLink to="/courses" className={({ isActive }) => `block px-5 py-4 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              {t("navCourses")}
            </NavLink>
            {user?.role === "admin" && (
              <NavLink to="/admin" className={({ isActive }) => `block px-5 py-4 rounded-xl text-base font-bold mt-2 transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'}`}>
                {t("navAdmin")}
              </NavLink>
            )}
            
            <div className="h-px bg-slate-800 my-4"></div>
            
            {!user ? (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <NavLink to="/login" className="py-3.5 rounded-xl text-center font-medium text-slate-300 bg-slate-800 border border-slate-700">
                  {t("login")}
                </NavLink>
                <NavLink to="/register" className="py-3.5 rounded-xl text-center font-bold bg-white text-slate-900">
                  {t("register")}
                </NavLink>
              </div>
            ) : (
              <button onClick={logout} className="w-full py-4 mt-2 rounded-xl text-center font-medium text-red-400 bg-red-500/10 border border-red-500/20 transition-colors hover:bg-red-500/20">
                {t("logout")}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
