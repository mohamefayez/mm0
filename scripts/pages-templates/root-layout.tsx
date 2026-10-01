import type { Metadata } from "next";
import { Suspense } from "react";
import { StaticPreferences } from "@/components/static-preferences";
import "./globals.css";
import "./motion.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mohamefayez.github.io/mm0"),
  title: { default: "Asel Cosmetics", template: "%s | Asel Cosmetics" },
  robots: { index: false, follow: true },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ar" dir="rtl" data-theme="light" data-scroll-behavior="smooth">
    <body><Suspense fallback={<p>Asel Cosmetics</p>}><StaticPreferences>{children}</StaticPreferences></Suspense></body>
  </html>;
}
