import React, { useState } from "react";
import { 
  FiLayers, FiVideo, FiBarChart2, FiLogOut, FiUsers, FiMenu, FiX
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const { t } = useSettings();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "analytics", label: t("analytics"), icon: FiBarChart2 },
    { id: "courses", label: t("coursesSection"), icon: FiLayers },
    { id: "chapters", label: t("chaptersSection"), icon: FiLayers },
    { id: "videos", label: t("videosSection"), icon: FiVideo },
    { id: "users", label: t("users"), icon: FiUsers },
    { id: "chat", label: t("contactAdmin") || "Chat", icon: FiUsers }
  ];

  const handleTabClick = (id) => {
    if (id === "chat") {
      navigate("/admin/chat");
    } else {
      if (location.pathname !== "/admin") {
        navigate("/admin", { state: { activeTab: id } });
      } else {
        setActiveTab(id);
      }
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between bg-[var(--surface-strong)] px-5 py-4 border-b border-[var(--border-soft)] backdrop-blur-xl lg:hidden">
        <h2 className="text-lg font-black tracking-tighter text-[var(--text-main)]">{t("adminPanel")}</h2>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl bg-[var(--surface)] p-2.5 text-[var(--text-main)] shadow-sm border border-[var(--border-soft)]"
        >
          {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-[58] flex w-72 flex-col bg-[var(--surface-strong)] border-r border-[var(--border-soft)] transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="hidden items-center justify-between p-8 lg:flex">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-main)]">{t("adminPanel")}</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-dim)]">{t("management")}</p>
          </div>
        </div>

        <div className="p-6 pt-24 lg:hidden">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-dim)]">{t("management")}</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? "bg-[var(--text-main)] text-[var(--bg)] shadow-lg shadow-black/10" 
                  : "text-[var(--text-soft)] hover:bg-[var(--surface)] hover:text-[var(--text-main)]"
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? "" : "text-[var(--text-dim)]"} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-[var(--border-soft)] p-4">
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-4 text-sm font-bold text-[var(--text-soft)] transition-all hover:bg-red-500/10 hover:text-red-500"
          >
            <FiLogOut size={20} />
            {t("logout")}
          </button>
        </div>
      </aside>
    </>
  );
}
