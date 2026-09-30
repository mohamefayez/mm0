"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Moon, Sun, Languages } from "lucide-react";
import { translator, type Language } from "@/lib/i18n";
type Theme = "light" | "dark";
const Preferences = createContext({
  locale: "en" as Language,
  theme: "light" as Theme,
  toggleTheme: () => {},
});
export function PreferencesProvider({
  locale,
  initialTheme,
  children,
}: {
  locale: Language;
  initialTheme: Theme;
  children: ReactNode;
}) {
  const [theme, setTheme] = useState(initialTheme);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.cookie = `asel-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setTheme(next);
  };
  return (
    <Preferences.Provider value={{ locale, theme, toggleTheme }}>
      {children}
    </Preferences.Provider>
  );
}
export function useTranslation() {
  return translator(useContext(Preferences).locale);
}
export function useLocale() {
  return useContext(Preferences).locale;
}
export function PreferenceControls() {
  const { locale, theme, toggleTheme } = useContext(Preferences);
  const t = translator(locale);
  function changeLanguage() {
    const target = locale === "ar" ? "en" : "ar";
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${target}`);
    document.cookie = `asel-locale=${target}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.location.assign(url.pathname + url.search + url.hash);
  }
  return (
    <div className="preference-controls" aria-label={t("Display preferences")}>
      <button
        className="language-toggle"
        onClick={changeLanguage}
        aria-label={
          locale === "ar" ? "Switch to English" : "التبديل إلى العربية"
        }
        lang={locale === "ar" ? "en" : "ar"}
      >
        <Languages size={16} aria-hidden="true" />
        <span>{locale === "ar" ? "English" : "العربية"}</span>
      </button>
      <button
        className="icon-button theme-toggle"
        onClick={toggleTheme}
        aria-label={t(
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        )}
        aria-pressed={theme === "dark"}
        title={t(theme === "dark" ? "Light mode" : "Dark mode")}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}
