import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiSun, FiMoon, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

export default function Navbar() {
  const { t, theme, setTheme, language, setLanguage } = useSettings();
  const { user, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Sahifa o'zgarganda mobil menyuni yopish
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: "/", label: t("navProduct") },
    { to: "/courses", label: t("navCourses") },
  ];

  if (isAdmin) {
    navLinks.push({ to: "/admin", label: t("navAdmin") });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-soft)] bg-[var(--surface)] backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* LGO VA BREND */}
          <div className="flex items-center z-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--text-main)] text-sm font-bold text-[var(--bg)]">
                KH
              </div>
              <span className="text-lg font-bold tracking-tight text-[var(--text-main)] hidden sm:block">
                KursHub
              </span>
            </Link>
          </div>

          {/* DESKTOP MENYU */}
          <nav className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-[var(--text-main)] text-[var(--bg)] shadow-sm"
                      : "text-[var(--text-soft)] hover:bg-[var(--surface-strong)] hover:text-[var(--text-main)]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* DESKTOP O'NG TOMON (Tillar, Tema, Auth) */}
          <div className="hidden lg:flex items-center gap-2 z-10">
            {/* Tilni o'zgartirish (Faqat Uz/Ru) */}
            <button
              className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-[var(--surface-strong)] text-[var(--text-main)] transition-colors text-sm font-bold uppercase"
              onClick={() => setLanguage(language === "uz" ? "ru" : "uz")}
              title={t("changeLanguage")}
            >
              {language === "uz" ? "RU" : "UZ"}
            </button>

            {/* Mavzuni o'zgartirish */}
            <button
              className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-[var(--surface-strong)] text-[var(--text-soft)] hover:text-[var(--accent)] transition-colors"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={t("toggleTheme")}
            >
              {theme === "dark" ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-3 border-l border-[var(--border-soft)] ml-1">
                <Link to="/profile" className="p-2 rounded-xl hover:bg-[var(--surface-strong)] text-[var(--text-soft)] hover:text-[var(--accent)] transition-colors">
                  <FiUser className="text-xl" />
                </Link>
                <Link to="/settings" className="p-2 rounded-xl hover:bg-[var(--surface-strong)] text-[var(--text-soft)] hover:text-[var(--accent)] transition-colors">
                  <FiSettings className="text-xl" />
                </Link>
                <button onClick={logout} className="p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-soft)] hover:text-red-500 transition-colors">
                  <FiLogOut className="text-xl" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-soft)]">
                <Link to="/login" className="text-sm font-medium text-[var(--text-soft)] hover:text-[var(--text-main)] transition-colors">
                  {t("login")}
                </Link>
                <Link to="/register" className="rounded-xl bg-[var(--text-main)] px-4 py-2 text-sm font-semibold text-[var(--bg)] shadow hover:opacity-90 transition-opacity">
                  {t("register")}
                </Link>
              </div>
            )}
          </div>

          {/* MOBIL MENYU TUGMASI */}
          <button
            className="flex lg:hidden items-center justify-center h-10 w-10 rounded-lg text-[var(--text-main)] hover:bg-[var(--surface-strong)] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* MOBIL MENYU OCHILISHI */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 bg-[var(--surface)] border-t border-[var(--border-soft)] ${isMobileMenuOpen ? "max-h-[500px] border-b" : "max-h-0 border-transparent border-t-0"}`}>
        <div className="px-4 py-5 space-y-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="px-4 py-3 rounded-xl text-sm font-semibold text-[var(--text-main)] hover:bg-[var(--surface-strong)] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--border-soft)]">
            <button onClick={() => setLanguage(language === "uz" ? "ru" : "uz")} className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--surface-strong)]">
              <span className="font-bold">{language === "uz" ? "RU" : "UZ"}</span> {language === "uz" ? "Русский" : "O'zbekcha"}
            </button>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--surface-strong)]">
              {theme === "dark" ? <><FiSun /> {t("light")}</> : <><FiMoon /> {t("dark")}</>}
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center justify-center gap-2 w-full rounded-xl border border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--text-main)] bg-[var(--surface-strong)]"><FiUser /> {t("profile")}</Link>
                <button onClick={logout} className="w-full rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">{t("logout")}</button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" className="flex items-center justify-center rounded-xl border border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--surface-strong)]">{t("login")}</Link>
                <Link to="/register" className="flex items-center justify-center rounded-xl bg-[var(--text-main)] px-4 py-3 text-sm font-bold text-[var(--bg)]">{t("register")}</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}