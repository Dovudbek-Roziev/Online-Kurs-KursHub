import { Outlet } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import { useSettings } from "../../context/SettingsContext";

export default function MainLayout() {
  const { theme } = useSettings();

  return (
    <div className={`min-h-screen page-bg ${theme === "light" ? "theme-light" : "theme-dark"}`}>
      <SiteHeader />
      <main className="animate-reveal">
        <Outlet />
      </main>
    </div>
  );
}
