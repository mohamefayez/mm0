"use client";
import { useTranslation } from "@/components/preferences";
export default function StoreError({ reset }: { reset: () => void }) {
  const t = useTranslation();

  return (
    <div className="container section">
      <div className="empty-state">
        <h1>{t("Something interrupted your visit.")}</h1>
        <p>
          {t(
            "We couldn’t load this page. Try again to continue your discovery.",
          )}
        </p>
        <button className="button" onClick={reset}>
          {t("Try again ")}
        </button>
      </div>
    </div>
  );
}
