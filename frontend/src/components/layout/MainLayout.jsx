import { Outlet } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { useSettings } from "../../context/SettingsContext";

export default function MainLayout() {
  const { theme } = useSettings();

  return (
    <div className={`min-h-screen page-bg ${theme === "light" ? "theme-light" : "theme-dark"} flex flex-col`}>
      <SiteHeader />
      <main className="animate-reveal flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
