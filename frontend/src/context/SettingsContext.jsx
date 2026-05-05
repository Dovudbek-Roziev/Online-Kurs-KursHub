import { createContext, useContext, useEffect, useMemo, useState } from "react";

import uz from "../i18n/uz";
import ru from "../i18n/ru";

const translations = {
  uz,
  ru
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    return ["uz", "ru"].includes(saved) ? saved : "ru";
  });
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove("theme-dark", "theme-light");
    document.documentElement.classList.add(theme === "light" ? "theme-light" : "theme-dark");
  }, [theme]);

  const value = useMemo(() => {
    const t = (key, params = {}) => {
      let text = translations[language]?.[key] || translations.uz[key] || key;
      if (typeof text !== "string") return text;
      Object.keys(params).forEach((p) => {
        text = text.split(`{${p}}`).join(params[p]);
      });
      return text;
    };
    return { language, setLanguage, theme, setTheme, t };
  }, [language, theme]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
