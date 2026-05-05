import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { FiMonitor, FiTarget, FiSettings, FiArrowRight, FiCheckCircle } from "react-icons/fi";

export default function HomePage() {
  const { t } = useSettings();
  const { isAdmin } = useAuth();

  const capabilities = [
    { title: t("premiumDelivery"), desc: t("premiumDeliveryText"), icon: FiMonitor },
    { title: t("structuredOutcomes"), desc: t("structuredOutcomesText"), icon: FiTarget },
    { title: t("operationalControl"), desc: t("operationalControlText"), icon: FiSettings },
  ];

  return (
    <div className="pb-24">
      {/* HERO SECTION */}
      <section className="shell relative py-24 lg:py-40 flex flex-col items-center text-center overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full -z-10 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-[var(--accent)] rounded-full filter blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-[var(--text-main)] rounded-full filter blur-3xl opacity-30"></div>
        </div>

        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-strong)] border border-[var(--border-soft)] text-[var(--text-main)] text-sm font-semibold tracking-wide uppercase mb-6">
            <FiCheckCircle className="text-[var(--accent)]" /> {t("modernCourseSaas")}
          </span>
        </div>

        <h1 className="max-w-5xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--text-main)] leading-[1.1] mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {t("landingTitle")}
        </h1>
        
        <p className="max-w-2xl text-lg sm:text-xl leading-relaxed text-[var(--text-soft)] mb-12 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {t("landingText")}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full sm:w-auto animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Link to="/courses" className="primary-btn w-full sm:w-auto text-base px-8 py-4 gap-2 group">
            {t("exploreCourses")}
            <FiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
          </Link>
          
          {isAdmin && (
            <Link to="/admin" className="secondary-btn w-full sm:w-auto text-base px-8 py-4">
              {t("openDashboard")}
            </Link>
          )}
        </div>
      </section>

      {/* CAPABILITIES SECTION */}
      <section className="shell space-y-12 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <span className="eyebrow">{t("capabilities")}</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-main)] mt-4 mb-4">{t("capabilitiesTitle")}</h2>
          <p className="text-lg text-[var(--text-soft)]">{t("capabilitiesText")}</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {capabilities.map((item, idx) => (
            <article key={idx} className="panel p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--text-main)] text-[var(--bg)] mb-6 shadow-lg">
                <item.icon className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-main)] mb-4">{item.title}</h3>
              <p className="text-base leading-relaxed text-[var(--text-soft)]">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="shell space-y-12 py-16">
        <div className="panel p-10 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left bg-gradient-to-br from-[var(--surface-strong)] to-[var(--surface)]">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-main)] mb-4">{t("featuredLibraryTitle")}</h2>
            <p className="text-lg text-[var(--text-soft)]">{t("featuredLibraryText")}</p>
          </div>
          <Link to="/courses" className="primary-btn shrink-0 gap-2 w-full md:w-auto">
            {t("browseCatalog")} <FiArrowRight className="text-lg" />
          </Link>
        </div>
      </section>
    </div>
  );
}