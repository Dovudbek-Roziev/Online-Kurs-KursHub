import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { t } = useSettings();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const normalizedEmail = form.email.trim().toLowerCase();

    if (!/^[a-zA-Z0-9._%+\-]+@gmail\.com$/.test(normalizedEmail)) {
      setError(t("ERR_INVALID_EMAIL"));
      return;
    }

    if (form.password.length !== 6) {
      setError(t("ERR_PASSWORD_SHORT"));
      return;
    }

    try {
      await register(form.name, normalizedEmail, form.password);
      navigate("/courses");
    } catch (err) {
      setError(t(err.message) || t("errorOccurred"));
    }
  }

  return (
    <div className="shell flex min-h-[calc(100vh-5rem)] items-center justify-center py-16">
      <div className="panel w-full max-w-md p-8">
        <span className="eyebrow">{t("register")}</span>
        <h1 className="mt-4 text-3xl font-semibold text-main">{t("registerTitle")}</h1>
        <p className="mt-3 text-sm leading-7 text-soft">{t("registerText")}</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            className="input-ui w-full"
            placeholder={t("fullName")}
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            className="input-ui w-full"
            placeholder={t("emailGmail")}
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            pattern="^[a-zA-Z0-9._%+\\-]+@gmail\\.com$"
            required
          />
          <input
            className="input-ui w-full"
            placeholder={t("password")}
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            minLength={6}
            maxLength={6}
            required
          />
          {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div> : null}
          <button className="primary-btn w-full" type="submit" disabled={loading}>
            {loading ? `${t("register")}...` : t("register")}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link to="/login" className="text-soft hover:text-main">{t("login")}</Link>
          <Link to="/" className="text-soft hover:text-main">{t("backHome")}</Link>
        </div>
      </div>
    </div>
  );
}
