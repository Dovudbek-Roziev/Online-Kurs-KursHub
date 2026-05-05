import { FiMonitor, FiMoon, FiSun } from "react-icons/fi";
import { useSettings } from "../context/SettingsContext";

export default function SettingsPage() {
  const { t, language, setLanguage, theme, setTheme } = useSettings();

  return (
    <div className="shell space-y-8 pb-24 pt-16">
      <div className="panel p-8">
        <span className="eyebrow">{t("navSettings")}</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-main">{t("settingsTitle")}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-soft">{t("settingsText")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="panel p-6">
          <p className="text-sm font-bold text-dim">{t("language")}</p>
          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={() => setLanguage("uz")}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-all ${language === "uz" ? "border-transparent bg-[var(--text-main)] text-[var(--bg)]" : "border-[var(--border-soft)] bg-[var(--surface-sunken)] text-[var(--text-soft)]"}`}
            >
              {t("uzbek")}
            </button>
            <button
              type="button"
              onClick={() => setLanguage("ru")}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-all ${language === "ru" ? "border-transparent bg-[var(--text-main)] text-[var(--bg)]" : "border-[var(--border-soft)] bg-[var(--surface-sunken)] text-[var(--text-soft)]"}`}
            >
              {t("russian")}
            </button>
          </div>
        </div>

        <div className="panel p-6">
          <p className="text-sm font-bold text-dim">{t("appearance")}</p>
          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-all ${theme === "dark" ? "border-transparent bg-[var(--text-main)] text-[var(--bg)]" : "border-[var(--border-soft)] bg-[var(--surface-sunken)] text-[var(--text-soft)]"}`}
            >
              <FiMoon /> {t("dark")}
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-all ${theme === "light" ? "border-transparent bg-[var(--text-main)] text-[var(--bg)]" : "border-[var(--border-soft)] bg-[var(--surface-sunken)] text-[var(--text-soft)]"}`}
            >
              <FiSun /> {t("light")}
            </button>
          </div>
        </div>

        <div className="panel p-6">
          <p className="text-sm font-bold text-dim">{t("mobile")}</p>
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-sunken)] p-4">
            <FiMonitor className="mt-1 shrink-0 text-[var(--text-main)]" />
            <p className="text-sm leading-7 text-soft">{t("mobileText")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
