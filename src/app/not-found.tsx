"use client";
import { useTranslation, useLocale } from "@/components/preferences";
import { ButtonLink } from "@/components/ui";
export default function NotFound() {
  const t = useTranslation();
  const locale = useLocale();

  return (
    <main className="container section">
      <div className="empty-state">
        <span className="status-label">{t("404 · A small detour")}</span>
        <h1>{t("This scent trail ends here.")}</h1>
        <p>
          {t(
            "This page isn’t available. Return to Asel and discover something new. ",
          )}
        </p>
        <ButtonLink href={`/${locale}`}>{t("Back to Asel")}</ButtonLink>
      </div>
    </main>
  );
}
