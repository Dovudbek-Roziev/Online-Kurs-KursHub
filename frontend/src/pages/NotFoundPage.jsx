import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

export default function NotFoundPage() {
  const { t } = useSettings();

  return (
    <section className="not-found-wrap">
      <div className="card not-found-card">
        <span className="eyebrow">404</span>
        <h1>{t("noPage")}</h1>
        <p>{t("noPageText")}</p>
        <Link className="primary-button" to="/">{t("goHome")}</Link>
      </div>
    </section>
  );
}
