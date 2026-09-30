"use client";
import { useTranslation } from "@/components/preferences";
export default function Loading() {
  const t = useTranslation();

  return (
    <div
      className="container section"
      role="status"
      aria-label={t("Loading page")}
    >
      <p className="loading-label">{t("A little moment…")}</p>
      <div className="skeleton-grid" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <div className="skeleton" key={index} />
        ))}
      </div>
    </div>
  );
}
