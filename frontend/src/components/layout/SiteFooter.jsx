import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { FiAward, FiZap, FiBookOpen } from "react-icons/fi";

export default function SiteFooter() {
  const { t } = useSettings();

  return (
    <footer className="mt-auto border-t border-[var(--border-soft)] bg-[var(--surface)]/80 backdrop-blur-md pt-16 pb-8 text-center sm:text-left transition-colors duration-300">
      <div className="shell grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2.5 justify-center sm:justify-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <span className="text-xs font-black text-white tracking-wider">KH</span>
            </div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">KursHub</span>
          </Link>
          <p className="text-sm leading-relaxed text-[var(--text-soft)]">
            {t("landingText")?.substring(0, 70)}...
          </p>
        </div>
        
        <div>
          <h4 className="text-base font-bold text-[var(--text-main)] mb-6">{t("navCourses")}</h4>
          <ul className="space-y-4 text-sm font-medium text-[var(--text-soft)]">
            <li><Link to="/courses" className="hover:text-[var(--accent)] transition-colors">{t("allCategories")}</Link></li>
            <li><Link to="/courses?category=Full-Stack" className="hover:text-[var(--accent)] transition-colors">Full-Stack</Link></li>
            <li><Link to="/courses?category=Frontend" className="hover:text-[var(--accent)] transition-colors">Frontend</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-base font-bold text-[var(--text-main)] mb-6">{t("profile")}</h4>
          <ul className="space-y-4 text-sm font-medium text-[var(--text-soft)]">
            <li><Link to="/login" className="hover:text-[var(--accent)] transition-colors">{t("login")}</Link></li>
            <li><Link to="/register" className="hover:text-[var(--accent)] transition-colors">{t("register")}</Link></li>
            <li><Link to="/settings" className="hover:text-[var(--accent)] transition-colors">{t("navSettings")}</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-base font-bold text-[var(--text-main)] mb-6">{t("capabilities")}</h4>
          <ul className="space-y-4 text-sm font-medium text-[var(--text-soft)]">
            <li><span className="hover:text-[var(--accent)] transition-colors cursor-pointer">{t("premiumDelivery")}</span></li>
            <li><span className="hover:text-[var(--accent)] transition-colors cursor-pointer">{t("structuredOutcomes")}</span></li>
            <li><span className="hover:text-[var(--accent)] transition-colors cursor-pointer">{t("operationalControl")}</span></li>
          </ul>
        </div>
      </div>
      
      <div className="shell mt-16 pt-8 border-t border-[var(--border-soft)] text-center text-sm font-medium text-[var(--text-dim)] flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} KursHub. {t("copyright")} · {t("author")}: Roziev Dovudbek</p>
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
            <FiBookOpen className="text-sm" /> 50+ {t("navCourses")}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
            <FiAward className="text-sm" /> {t("freeCertBadge")}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold border border-violet-500/20">
            <FiZap className="text-sm" /> {t("onlineBadge")}
          </span>
        </div>
      </div>
    </footer>
  );
}
