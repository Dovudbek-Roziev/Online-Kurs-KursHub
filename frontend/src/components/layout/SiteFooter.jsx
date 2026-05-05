import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";

export default function SiteFooter() {
  const { t } = useSettings();

  return (
    <footer className="mt-auto border-t border-[var(--border-soft)] bg-[var(--surface)]/80 backdrop-blur-md pt-16 pb-8 text-center sm:text-left transition-colors duration-300">
      <div className="shell grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--text-main)] text-sm font-bold text-[var(--bg)] shadow-lg">
              KH
            </div>
            <span className="text-lg font-bold tracking-tight text-[var(--text-main)]">KursHub</span>
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
        <p>© {new Date().getFullYear()} KursHub. {t("copyright")}</p>
        <div className="flex items-center gap-6">
          <span className="hover:text-[var(--text-main)] cursor-pointer transition-colors">Telegram</span>
          <span className="hover:text-[var(--text-main)] cursor-pointer transition-colors">Instagram</span>
          <span className="hover:text-[var(--text-main)] cursor-pointer transition-colors">YouTube</span>
        </div>
      </div>
    </footer>
  );
}
