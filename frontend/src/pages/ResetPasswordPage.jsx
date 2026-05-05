import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

export default function ResetPasswordPage() {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuth();
  const { t } = useSettings();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password.length !== 6) {
      setError(t("ERR_PASSWORD_SHORT"));
      return;
    }

    try {
      await resetPassword(id, token, password);
      setMessage(t("passwordUpdatedSuccess"));
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(t("errorOccurred"));
    }
  }

  return (
    <div className="shell flex min-h-[calc(100vh-5rem)] items-center justify-center py-16">
      <div className="panel w-full max-w-md p-8">
        <span className="eyebrow">{t("newPasswordLabel")}</span>
        <h1 className="mt-4 text-3xl font-semibold text-main">{t("resetPassword")}</h1>
        <p className="mt-3 text-sm leading-7 text-soft">{t("resetPasswordText")}</p>

        {message ? (
          <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {message}
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <input
              className="input-ui w-full"
              placeholder={t("newPassword")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              maxLength={6}
              required
            />
            {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div> : null}
            <button className="primary-btn w-full" type="submit" disabled={loading}>
              {loading ? `${t("loading")}...` : t("resetPassword")}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="text-soft hover:text-main">
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
