import type { Metadata } from "next";
import { site } from "@/lib/config";
import "./globals.css";
import "./motion.css";
import { cookies, headers } from "next/headers";
import { PreferencesProvider } from "@/components/preferences";
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  icons: { icon: "/icon.svg" },
  robots: { index: false, follow: true },
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [requestHeaders, cookieStore] = await Promise.all([
    headers(),
    cookies(),
  ]);
  const locale = requestHeaders.get("x-asel-locale") === "ar" ? "ar" : "en";
  const theme =
    cookieStore.get("asel-theme")?.value === "dark" ? "dark" : "light";
  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-theme={theme}
      data-scroll-behavior="smooth"
    >
      <body>
        <PreferencesProvider locale={locale} initialTheme={theme}>
          {children}
        </PreferencesProvider>
      </body>
    </html>
  );
}
