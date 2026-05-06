import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import {
  FiArrowRight, FiCode, FiLayers, FiBriefcase,
  FiStar, FiUsers, FiGlobe, FiCheckCircle
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";

const STATS = [
  { icon: FiLayers,   valueKey: "stat1Value", labelKey: "stat1Label" },
  { icon: FiUsers,    valueKey: "stat2Value", labelKey: "stat2Label" },
  { icon: FiStar,     valueKey: "stat3Value", labelKey: "stat3Label" },
  { icon: FiGlobe,    valueKey: "stat4Value", labelKey: "stat4Label" },
];

const FEATURE_ICONS = [FiCode, FiBriefcase, FiLayers];
const FEATURE_COLORS = [
  "from-indigo-500 to-violet-500",
  "from-violet-500 to-purple-500",
  "from-purple-500 to-pink-500",
];

export default function HomePage() {
  const { t } = useSettings();
  const { isAdmin, user } = useAuth();

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative flex min-h-[88vh] flex-col items-center justify-center px-4 py-24 text-center">

        {/* Animated blob orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="animate-blob absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="animate-blob animation-delay-2000 absolute -right-32 top-1/4 h-[480px] w-[480px] rounded-full bg-violet-500/20 blur-3xl" />
          <div className="animate-blob animation-delay-4000 absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-purple-500/15 blur-3xl" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(var(--text-main) 1px,transparent 1px),linear-gradient(90deg,var(--text-main) 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        {/* Badge */}
        <div className="animate-fade-up mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-400">
            <HiSparkles className="text-sm text-amber-400" />
            {t("heroBadge")}
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up mb-6 max-w-4xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            {t("heroTitle_1")}
          </span>
          <br />
          <span className="text-[var(--text-main)]">{t("heroTitle_2")}</span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-up mb-10 max-w-2xl text-base leading-relaxed text-[var(--text-dim)] sm:text-lg"
          style={{ animationDelay: "0.18s" }}
        >
          {t("heroSubtitle")}
        </p>

        {/* CTA buttons */}
        <div
          className="animate-fade-up flex flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: "0.26s" }}
        >
          <Link
            to="/courses"
            className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40"
          >
            {t("viewCoursesBtn")}
            <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          {!user && (
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-7 py-3.5 text-sm font-black text-[var(--text-main)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-md"
            >
              {t("registerBtn")}
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-7 py-3.5 text-sm font-black text-[var(--text-main)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-md"
            >
              {t("openDashboard")}
            </Link>
          )}
        </div>

        {/* Floating trust badges */}
        <div
          className="animate-fade-up mt-14 flex flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: "0.35s" }}
        >
          {[t("freeCertBadge"), t("onlineBadge"), "React · Node.js · MongoDB"].map((badge, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3.5 py-1.5 text-[11px] font-bold text-[var(--text-dim)]"
            >
              <FiCheckCircle className="text-emerald-400" size={11} />
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* ── STATS ROW ── */}
      <section className="shell py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: FiLayers, value: "50+",   label: t("totalCoursesLabel") },
            { icon: FiUsers,  value: "1000+", label: t("activeStudents") },
            { icon: FiStar,   value: "5.0",   label: t("averageRating") },
            { icon: FiGlobe,  value: "100%",  label: t("onlineBadge") },
          ].map((s, i) => (
            <div
              key={i}
              className={`animate-fade-up flex flex-col items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 text-center shadow-sm`}
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20">
                <s.icon size={18} className="text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-[var(--text-main)]">{s.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-dim)]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY US / FEATURES ── */}
      <section className="shell py-20">
        {/* Section header */}
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-violet-400">
            {t("capabilities")}
          </span>
          <h2 className="mb-4 text-3xl font-black text-[var(--text-main)] sm:text-4xl">
            {t("whyUsTitle")}
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--text-dim)]">
            {t("whyUsSubtitle")}
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <article
                key={n}
                className={`animate-fade-up group relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/20 hover:shadow-xl hover:shadow-black/10`}
                style={{ animationDelay: `${0.12 * i}s` }}
              >
                {/* Gradient hover glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.08), transparent)" }} />

                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${FEATURE_COLORS[i]} shadow-lg`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="mb-2.5 text-lg font-black text-[var(--text-main)]">
                  {t(`feature${n}Title`)}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-dim)]">
                  {t(`feature${n}Text`)}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── COURSE INCLUDES (mini section) ── */}
      <section className="shell py-6 pb-16">
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 sm:p-8">
          <p className="mb-5 text-xs font-black uppercase tracking-widest text-[var(--text-dim)]">
            {t("courseIncludes")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                  <FiCheckCircle size={13} className="text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-[var(--text-main)]">{t(`courseIncludes_${n}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="shell pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-8 py-16 text-center shadow-2xl shadow-indigo-500/20 sm:px-16">
          {/* Background orbs */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />
          </div>

          <div className="relative">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white/90 backdrop-blur-sm">
              <HiSparkles className="text-amber-300" />
              KursHub
            </span>

            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              {t("readyTitle")}
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-white/75">
              {t("readySubtitle")}
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/courses"
                className="group flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-black text-indigo-600 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                {t("allCoursesBtn")}
                <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-8 py-3.5 text-sm font-black text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
                >
                  {t("registerBtn")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
