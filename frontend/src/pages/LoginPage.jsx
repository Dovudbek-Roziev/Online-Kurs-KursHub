import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

const ADMIN_TELEGRAM_URL = "https://t.me/Dovudbek112";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const { t } = useSettings();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || "/courses");
    } catch (err) {
      setError(t(err.message) || t("errorOccurred"));
    }
  }

  return (
    <div className="shell flex min-h-[calc(100vh-5rem)] items-center justify-center py-16">
      <div className="panel w-full max-w-md p-8">
        <span className="eyebrow">{t("login")}</span>
        <h1 className="mt-4 text-3xl font-semibold text-main">{t("loginTitle")}</h1>
        <p className="mt-3 text-sm leading-7 text-soft">{t("loginText")}</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            className="input-ui w-full"
            placeholder={t("email")}
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            className="input-ui w-full"
            placeholder={t("password")}
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div> : null}
          <button className="primary-btn w-full" type="submit" disabled={loading}>
            {loading ? `${t("login")}...` : t("login")}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-sunken)] p-4 text-center">
          <p className="text-sm text-soft">{t("forgotPasswordContactText")}</p>
          <a
            href={ADMIN_TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-sm font-bold text-main hover:text-soft"
          >
            {t("contactAdminTelegram")}
          </a>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <Link to="/register" className="text-soft hover:text-main">{t("register")}</Link>
          <span className="text-soft">|</span>
          <Link to="/" className="text-soft hover:text-main">{t("backHome")}</Link>
        </div>
      </div>
    </div>
  );
}
