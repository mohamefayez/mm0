import type { Metadata } from "next";
import { site } from "@/lib/config";
import { translator } from "@/lib/i18n";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const locale = path.startsWith("/ar") ? "ar" : "en";
  const t = translator(locale);
  title = t(title);
  description = t(description);
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        en: path.replace(/^\/ar/, "/en"),
        ar: path.replace(/^\/en/, "/ar"),
      },
    },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: path,
      locale: locale === "ar" ? "ar_EG" : "en_EG",
      images: ["/images/asel-logo.jpeg"],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/images/asel-logo.jpeg"],
    },
  };
}
