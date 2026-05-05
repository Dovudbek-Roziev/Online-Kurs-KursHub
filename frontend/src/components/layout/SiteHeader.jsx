import { useMemo, useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { FiSun, FiMoon, FiSettings, FiUser, FiLogOut } from "react-icons/fi";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";

export default function SiteHeader() {
  const { t, theme, setTheme, language, setLanguage } = useSettings();
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const initials = useMemo(
    () =>
      (user?.name || "K")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [user?.name]
  );

  const links = [
    { to: "/", label: t("navProduct") },
    { to: "/courses", label: t("navCourses") }
  ];
  if (isAdmin) {
    links.push({ to: "/admin", label: t("navAdmin") });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-soft)] bg-[var(--bg)] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 relative">
          
          {/* Logo */}
          <div className="flex items-center z-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--text-main)] text-sm font-bold text-[var(--bg)]">
                KH
              </div>
              <span className="text-lg font-bold tracking-tight text-[var(--text-main)] hidden sm:block">KursHub</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-2 z-0">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
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

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2 z-10">
            <button
              className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-[var(--surface-strong)] text-[var(--text-main)] transition-colors text-sm font-bold uppercase"
              onClick={() => setLanguage(language === "uz" ? "ru" : "uz")}
              title={t("changeLanguage")}
              type="button"
            >
              {language === "uz" ? "RU" : "UZ"}
            </button>
            <button
              className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-[var(--surface-strong)] text-[var(--text-soft)] hover:text-[var(--accent)] transition-colors"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? t("light") : t("dark")}
              type="button"
            >
              {theme === "dark" ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-[var(--surface-strong)] text-[var(--text-soft)] hover:text-[var(--accent)] transition-colors" title={t("profile")}>
                  <FiUser className="text-xl" />
                </Link>
                <Link to="/settings" className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-[var(--surface-strong)] text-[var(--text-soft)] hover:text-[var(--accent)] transition-colors" title={t("navSettings")}>
                  <FiSettings className="text-xl" />
                </Link>
                
                <div className="flex items-center gap-3 pl-3 pr-4 ml-1 border-l border-[var(--border-soft)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-strong)] border border-[var(--border-soft)] text-sm font-bold text-[var(--text-main)] shadow-sm">
                    {initials}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-main)]">{user.name}</span>
                </div>
                
                <button className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-red-500/10 text-[var(--text-soft)] hover:text-red-500 transition-colors" onClick={logout} title={t("logout")} type="button">
                  <FiLogOut className="text-xl" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 pl-4 border-l border-[var(--border-soft)]">
                <Link to="/login" className="text-sm font-medium text-[var(--text-soft)] hover:text-[var(--text-main)] transition-colors">{t("login")}</Link>
                <Link to="/register" className="rounded-xl bg-[var(--text-main)] px-4 py-2 text-sm font-semibold text-[var(--bg)] shadow hover:opacity-90 transition-opacity">{t("register")}</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="flex lg:hidden items-center justify-center h-10 w-10 rounded-lg text-[var(--text-main)] hover:bg-[var(--surface-strong)] transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={t("menu")}
          >
            {mobileOpen ? <HiOutlineX className="text-2xl" /> : <HiOutlineMenuAlt3 className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-500 border-t border-[var(--border-soft)] bg-[var(--bg)]/95 backdrop-blur-2xl ${mobileOpen ? 'max-h-[600px] border-b' : 'max-h-0 border-transparent border-t-0'}`}>
        <div className="px-4 py-5 space-y-4">
          {user && (
            <div className="flex items-center gap-3 mb-2 px-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-strong)] border border-[var(--border-soft)] text-sm font-bold text-[var(--text-main)]">
                {initials}
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--text-main)]">{user.name}</p>
                <p className="text-xs text-[var(--text-dim)]">{isAdmin ? t("adminRole") : t("studentRole")}</p>
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive 
                      ? "bg-[var(--text-main)] text-[var(--bg)] shadow-md" 
                      : "text-[var(--text-soft)] hover:bg-[var(--surface-strong)] hover:text-[var(--text-main)]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-soft)]">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--surface-strong)] transition-colors"
              onClick={() => setLanguage(language === "uz" ? "ru" : "uz")}
            >
              <span className="font-bold">{language === "uz" ? "RU" : "UZ"}</span> {language === "uz" ? "Русский" : "O'zbekcha"}
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--surface-strong)] transition-colors"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <><FiSun className="text-lg"/> {t("light")}</> : <><FiMoon className="text-lg"/> {t("dark")}</>}
            </button>
          </div>
          
          <div className="pt-2">
            <Link to="/settings" className="flex items-center justify-center gap-2 w-full rounded-xl border border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--surface-strong)] transition-colors mb-3" onClick={() => setMobileOpen(false)}>
              <FiSettings className="text-lg"/> {t("navSettings")}
            </Link>
            {user && (
              <Link to="/profile" className="flex items-center justify-center gap-2 w-full rounded-xl border border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--surface-strong)] transition-colors mb-3" onClick={() => setMobileOpen(false)}>
                <FiUser className="text-lg"/> {t("profile")}
              </Link>
            )}
            {user ? (
              <button
                type="button"
                className="w-full rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/20 transition-colors"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
              >
                {t("logout")}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" className="flex items-center justify-center rounded-xl border border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--surface-strong)] transition-colors" onClick={() => setMobileOpen(false)}>
                  {t("login")}
                </Link>
                <Link to="/register" className="flex items-center justify-center rounded-xl bg-[var(--text-main)] px-4 py-3 text-sm font-bold text-[var(--bg)] hover:opacity-90 transition-opacity" onClick={() => setMobileOpen(false)}>
                  {t("register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
