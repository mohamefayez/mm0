"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/components/preferences";
import { adminRequest, useAdminText } from "./dashboard";
import type { StoreSettings } from "@/lib/commerce-schema";
export function SettingsEditor({
  settings,
  busy,
  onSave,
}: {
  settings: StoreSettings;
  busy: boolean;
  onSave: (s: StoreSettings) => Promise<boolean>;
}) {
  const tr = useAdminText();
  const t = useTranslation();
  const router = useRouter();
  const [s, setS] = useState(settings);
  const [passwordError, setPasswordError] = useState("");
  function update<K extends keyof StoreSettings>(
    key: K,
    value: StoreSettings[K],
  ) {
    setS((old) => ({ ...old, [key]: value }));
  }
  return (
    <div className="admin-settings">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onSave(s);
        }}
      >
        <h2>{tr("Store and contact details", "المتجر وبيانات التواصل")}</h2>
        <div className="form-grid">
          <label className="field">
            {tr("Store mode", "وضع المتجر")}
            <select
              value={s.mode}
              onChange={(e) =>
                update("mode", e.target.value as StoreSettings["mode"])
              }
            >
              <option value="test">
                {tr(
                  "Test orders and temporary prices",
                  "تجربة الطلبات والأسعار المؤقتة",
                )}
              </option>
              <option value="paused">
                {tr("Pause orders", "إيقاف الطلبات")}
              </option>
              <option value="live">
                {tr("Accept real orders", "استقبال طلبات فعلية")}
              </option>
            </select>
          </label>
          <label className="field">
            {tr("Contact phone", "رقم التواصل")}
            <input
              type="tel"
              value={s.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </label>
          <label className="field">
            {tr(
              "WhatsApp (country code, digits only)",
              "واتساب (كود الدولة ثم الرقم بدون +)",
            )}
            <input
              inputMode="numeric"
              dir="ltr"
              placeholder="2010…"
              value={s.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
            />
          </label>
          <label className="field">
            {tr("Contact email", "البريد الإلكتروني")}
            <input
              type="email"
              value={s.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </label>
          <label className="field span-2">
            {tr("Business address", "عنوان المتجر")}
            <input
              value={s.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </label>
        </div>
        <p className="notice">
          {tr("Checkout opens this WhatsApp number with the order details. Customers press Send in WhatsApp to contact you.", "إتمام الطلب يفتح رقم الواتساب ده بتفاصيل الطلب. العميل بيضغط إرسال داخل واتساب للتواصل معاك.")}
        </p>
        <h2>{tr("Delivery by governorate", "الشحن حسب المحافظة")}</h2>
        <p className="muted">
          {tr(
            "Initial fees are examples. Set your actual rates before enabling live orders.",
            "الرسوم المبدئية للتجربة. حدّد أسعار الشحن الفعلية قبل استقبال طلبات حقيقية.",
          )}
        </p>
        <label className="field">
          {tr(
            "Free delivery above (leave empty to disable)",
            "شحن مجاني فوق مبلغ (اتركه فارغًا للإلغاء)",
          )}
          <input
            type="number"
            min={0}
            step="0.01"
            value={s.freeShippingThreshold ?? ""}
            onChange={(e) =>
              update(
                "freeShippingThreshold",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          />
        </label>
        <div className="admin-rates">
          {s.shippingRates.map((rate, index) => (
            <div key={rate.governorate}>
              <label>
                <input
                  type="checkbox"
                  checked={rate.enabled}
                  onChange={(e) =>
                    update(
                      "shippingRates",
                      s.shippingRates.map((r, i) =>
                        i === index ? { ...r, enabled: e.target.checked } : r,
                      ),
                    )
                  }
                />
                {t(rate.governorate)}
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                aria-label={`${tr("Delivery fee", "رسوم الشحن")} ${t(rate.governorate)}`}
                value={rate.fee}
                onChange={(e) =>
                  update(
                    "shippingRates",
                    s.shippingRates.map((r, i) =>
                      i === index ? { ...r, fee: Number(e.target.value) } : r,
                    ),
                  )
                }
              />
            </div>
          ))}
        </div>
        <h2>{tr("Published store policies", "سياسات المتجر المعروضة")}</h2>
        <p className="muted">
          {tr(
            "Enter the terms you approve. Arabic copy is required for launch; English copy is shown where supplied.",
            "اكتب الشروط اللي تعتمدها. النص العربي مطلوب لفتح البيع، والإنجليزي يظهر لو أضفته.",
          )}
        </p>
        <div className="form-grid">
          {(
            [
              ["shippingTextAr", "الشحن والتوصيل بالعربي"],
              ["shippingText", "Delivery in English"],
              ["returnsTextAr", "الاستبدال والاسترجاع بالعربي"],
              ["returnsText", "Returns in English"],
              ["privacyTextAr", "سياسة الخصوصية بالعربي"],
              ["privacyText", "Privacy in English"],
              ["termsTextAr", "شروط الشراء بالعربي"],
              ["termsText", "Terms in English"],
            ] as const
          ).map(([key, label]) => (
            <label className="field" key={key}>
              {label}
              <textarea
                rows={4}
                maxLength={4000}
                value={s[key]}
                onChange={(e) => update(key, e.target.value)}
              />
            </label>
          ))}
        </div>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={s.businessConfirmed}
            onChange={(e) => update("businessConfirmed", e.target.checked)}
          />
          {tr(
            "I confirm the contact details, shipping rates and policies are ready for real customers.",
            "أؤكد إن بيانات التواصل ورسوم الشحن والسياسات جاهزة للعملاء.",
          )}
        </label>
        <button className="button" disabled={busy}>
          {tr("Save settings", "حفظ الإعدادات")}
        </button>
      </form>
      <form
        className="admin-password"
        onSubmit={async (e) => {
          e.preventDefault();
          setPasswordError("");
          const form = new FormData(e.currentTarget);
          try {
            await adminRequest("/api/admin/session", "PATCH", {
              currentPassword: form.get("current"),
              newPassword: form.get("next"),
            });
            router.refresh();
          } catch {
            setPasswordError(
              tr(
                "Could not change the password. Check your current password and try again.",
                "تعذّر تغيير كلمة المرور. راجع الكلمة الحالية وحاول مرة أخرى.",
              ),
            );
          }
        }}
      >
        <h2>{tr("Admin password", "كلمة مرور الإدارة")}</h2>
        <div className="form-grid">
          <label className="field">
            {tr("Current password", "كلمة المرور الحالية")}
            <input
              name="current"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <label className="field">
            {tr(
              "New password (12+ characters)",
              "كلمة مرور جديدة (١٢ حرفًا على الأقل)",
            )}
            <input
              name="next"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={200}
              required
            />
          </label>
        </div>
        <button className="button button-secondary">
          {tr(
            "Change password and sign out",
            "تغيير كلمة المرور وتسجيل الخروج",
          )}
        </button>
        <p role="alert" className="field-error">
          {passwordError}
        </p>
      </form>
    </div>
  );
}
