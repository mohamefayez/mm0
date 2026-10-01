"use client";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { PreferencesProvider } from "./preferences";
const subscribe = () => () => {};
const serverTheme = () => "light" as const;
const savedTheme = (): "light" | "dark" => document.cookie.split("; ").includes("asel-theme=dark") ? "dark" : "light";
export function StaticPreferences({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = /^\/en(?:\/|$)/.test(pathname) ? "en" : "ar";
  const theme = useSyncExternalStore(subscribe, savedTheme, serverTheme);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.theme = theme;
  }, [locale, theme]);
  return <PreferencesProvider key={`${locale}-${theme}`} locale={locale} initialTheme={theme}>{children}</PreferencesProvider>;
}
