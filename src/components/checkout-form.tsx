"use client";
import { useTranslation } from "@/components/preferences";
import { useRef, useState } from "react";
import { useShop } from "@/store/shop-store";
import { resolveCart } from "@/lib/cart-logic";
import { currency } from "@/lib/config";
import { checkoutSchema, governorates } from "@/lib/checkout";
import { EmptyState } from "@/components/ui";
import { validWhatsAppNumber } from "@/lib/whatsapp-order";
import { productName } from "@/lib/product-copy";
import type { Product } from "@/types/catalog";
import { useRouter } from "next/navigation";
import { deliveryFee, type StoreSettings } from "@/lib/commerce-schema";

type Fields = {
  name: string;
  email: string;
  phone: string;
  governorate: string;
  city: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  notes: string;
};
const emptyFields: Fields = {
  name: "",
  email: "",
  phone: "",
  governorate: "",
  city: "",
  street: "",
  building: "",
  floor: "",
  apartment: "",
  notes: "",
};
const fields: {
  key: keyof Fields;
  label: string;
  autocomplete: string;
  required?: boolean;
  type?: string;
  wide?: boolean;
}[] = [
  {
    key: "name",
    label: "Full name",
    autocomplete: "name",
    required: true,
    wide: true,
  },
  {
    key: "phone",
    label: "Egyptian mobile number",
    autocomplete: "tel",
    required: true,
    type: "tel",
  },
  {
    key: "email",
    label: "Email address",
    autocomplete: "email",
    required: true,
    type: "email",
  },
  {
    key: "city",
    label: "City / area",
    autocomplete: "address-level2",
    required: true,
  },
  {
    key: "street",
    label: "Street address",
    autocomplete: "address-line1",
    required: true,
    wide: true,
  },
  {
    key: "building",
    label: "Building",
    autocomplete: "address-line2",
    required: true,
  },
  { key: "floor", label: "Floor (optional)", autocomplete: "off" },
  { key: "apartment", label: "Apartment (optional)", autocomplete: "off" },
];
export function CheckoutForm({
  products,
  locale,
  settings,
}: {
  products: Product[];
  locale: string;
  settings: StoreSettings;
}) {
  const t = useTranslation();
  const router = useRouter();
  const clearCart = useShop((state) => state.clearCart);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<{
    id: string;
    total: number;
    test: boolean;
    whatsappUrl: string;
  } | null>(null);
  const submission = useRef<{ key: string; fingerprint: string } | null>(null);

  const items = useShop((state) => state.items);
  const lines = resolveCart(items, products);
  const [values, setValues] = useState<Fields>(emptyFields);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>(
    {},
  );
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const shipping = deliveryFee(settings, values.governorate, subtotal);
  const total = Math.round((subtotal + (shipping ?? 0)) * 100) / 100;
  async function placeOrder() {
    if (busy) return;
    setMessage("");
    setBusy(true);
    const payload = {
      customer: values,
      items,
      expectedTotal: total,
      expectedMode: settings.mode,
      payment: "whatsapp",
    };
    const fingerprint = JSON.stringify(payload);
    if (submission.current?.fingerprint !== fingerprint)
      submission.current = { key: crypto.randomUUID(), fingerprint };
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          idempotencyKey: submission.current.key,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        const messages: Record<string, string> = {
          STOCK_CHANGED: "Availability changed. Review your bag and try again.",
          PRICE_CHANGED:
            "Prices changed. Review the updated total and try again.",
          CHECKOUT_CHANGED:
            "Store settings changed. Please review your order again.",
          UNSUPPORTED_DELIVERY:
            "Delivery is not available for this governorate.",
          TOO_MANY_ORDERS: "Too many orders. Please try again later.",
          WHATSAPP_UNAVAILABLE: "WhatsApp ordering is not configured yet.",
          ORDERING_PAUSED: "Ordering is temporarily paused.",
        };
        setMessage(
          messages[result.error] ||
            "We could not place your order. Please try again.",
        );
        router.refresh();
        return;
      }
      setReceipt(result);
      clearCart();
      router.refresh();
      window.location.assign(result.whatsappUrl);
    } catch {
      setMessage(
        "Connection interrupted. Try again; your order will not be duplicated.",
      );
    } finally {
      setBusy(false);
    }
  }
  const changeStep = (next: number) => {
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  };
  const update = (key: keyof Fields, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };
  const validate = () => {
    const result = checkoutSchema.safeParse(values);
    if (!result.success) {
      const mapped: Partial<Record<keyof Fields, string>> = {};
      for (const issue of result.error.issues)
        mapped[issue.path[0] as keyof Fields] = issue.message;
      setErrors(mapped);
      requestAnimationFrame(() =>
        document.getElementById(`checkout-${Object.keys(mapped)[0]}`)?.focus(),
      );
      return;
    }
    setErrors({});
    if (shipping === null) {
      setMessage("Delivery is not available for this governorate.");
      return;
    }
    setMessage("");
    changeStep(1);
  };
  if (receipt)
    return (
      <div className="order-receipt">
        <span className="status-label">
          {t(receipt.test ? "Test order saved" : "Order saved")}
        </span>
        <h2>{t("Thank you for choosing Asel.")}</h2>
        <p>
          {t(
            receipt.test
              ? "This is a test order. It is saved in the admin panel and does not require delivery or payment."
              : "Your order is saved. Send the prepared message in WhatsApp so the owner can confirm it.",
          )}
        </p>
        <p>{t("Order reference")}</p>
        <strong className="receipt-reference" dir="ltr">
          {receipt.id}
        </strong>
        <p>
          {t("Total")}: {currency(receipt.total, locale)}
        </p>
        <div className="form-actions">
          <a className="button" href={receipt.whatsappUrl}>{t("Open WhatsApp")}</a>
          <button
            className="button button-secondary"
            onClick={() => window.print()}
          >
            {t("Print confirmation")}
          </button>
          <a className="button" href={`/${locale}/perfumes`}>
            {t("Continue shopping")}
          </a>
        </div>
      </div>
    );
  if (!lines.length)
    return (
      <EmptyState
        title={t("Start with a fragrance you love.")}
        description={t("Add a fragrance to your bag before checkout.")}
        href={`/${locale}/perfumes`}
        action={t("Explore fragrances")}
      />
    );
  return (
    <>
      {settings.mode !== "live" && (
        <div className="notice">
          {t(
            settings.mode === "test"
              ? "Test mode: prices and delivery fees are temporary. Test orders are saved without payment or fulfilment."
              : "Ordering is temporarily paused.",
          )}
        </div>
      )}
      {!validWhatsAppNumber(settings.whatsapp) && <p className="notice" role="status">{t("WhatsApp ordering is not configured yet.")}</p>}
      {message && (
        <p className="notice" role="alert">
          {t(message)}
        </p>
      )}
      <ol className="checkout-steps" aria-label={t("Checkout progress")}>
        {["Contact & shipping", "Review"].map((name, index) => (
          <li key={name} aria-current={step === index ? "step" : undefined}>
            {index + 1}
            {t(". ")}
            {t(name)}
          </li>
        ))}
      </ol>
      <div className="checkout-layout">
        <div className="checkout-panel">
          <h2 ref={heading} tabIndex={-1}>
            {t(
              [
                "Where should your order go?",
                "Review your details",
              ][step],
            )}
          </h2>
          {step === 0 ? (
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                validate();
              }}
            >
              <div className="form-grid">
                {fields.map((field) => (
                  <label
                    className={`field ${field.wide ? "span-2" : ""}`}
                    key={field.key}
                    htmlFor={`checkout-${field.key}`}
                  >
                    {t(field.label)}
                    {t(field.required ? " *" : "")}
                    <input
                      id={`checkout-${field.key}`}
                      name={field.key}
                      type={field.type ?? "text"}
                      autoComplete={field.autocomplete}
                      required={field.required}
                      value={values[field.key]}
                      onChange={(event) =>
                        update(field.key, event.target.value)
                      }
                      aria-invalid={!!errors[field.key]}
                      aria-describedby={
                        errors[field.key] ? `error-${field.key}` : undefined
                      }
                    />
                    {t(
                      errors[field.key] && (
                        <span id={`error-${field.key}`} className="field-error">
                          {t(errors[field.key])}
                        </span>
                      ),
                    )}
                  </label>
                ))}
                <label className="field" htmlFor="checkout-governorate">
                  {t("Governorate * ")}
                  <select
                    id="checkout-governorate"
                    name="governorate"
                    required
                    value={values.governorate}
                    onChange={(event) =>
                      update("governorate", event.target.value)
                    }
                    aria-invalid={!!errors.governorate}
                    aria-describedby={
                      errors.governorate ? "error-governorate" : undefined
                    }
                  >
                    <option value="">{t("Choose governorate")}</option>
                    {governorates
                      .filter((name) =>
                        settings.shippingRates.some(
                          (r) => r.governorate === name && r.enabled,
                        ),
                      )
                      .map((name) => (
                        <option key={name} value={name}>
                          {t(name)}
                        </option>
                      ))}
                  </select>
                  {t(
                    errors.governorate && (
                      <span className="field-error" id="error-governorate">
                        {t(errors.governorate)}
                      </span>
                    ),
                  )}
                </label>
                <label className="field span-2" htmlFor="checkout-notes">
                  {t("Landmark / delivery notes (optional) ")}
                  <textarea
                    id="checkout-notes"
                    name="notes"
                    rows={3}
                    maxLength={500}
                    value={values.notes}
                    onChange={(event) => update("notes", event.target.value)}
                  />
                </label>
              </div>
              <button className="button" type="submit">
                {t("Review details")}
              </button>
            </form>
          ) : (
            <>
              <div className="prose">
                <h3>{t("Contact & shipping")}</h3>
                <p>
                  {values.name}
                  <br />
                  {values.phone}
                  <br />
                  {values.email}
                  <br />
                  {values.building}
                  {t(", ")}
                  {values.street}
                  <br />
                  {t(values.floor && `Floor ${values.floor}. `)}
                  {t(values.apartment && `Apartment ${values.apartment}.`)}
                  <br />
                  {values.city}
                  {t(", ")}
                  {t(values.governorate)}
                  <br />
                  {values.notes}
                </p>
                <p>{t("Your order is saved, then WhatsApp opens with a message to send to the owner.")}</p>
              </div>
              <p className="notice">
                {t(
                  "By placing your order, you agree to the store terms and privacy policy.",
                )}{" "}
                <a
                  className="text-link"
                  href={`/${locale}/terms`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Terms")}
                </a>
                {" · "}
                <a
                  className="text-link"
                  href={`/${locale}/privacy`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Privacy")}
                </a>
              </p>
              <div className="form-actions">
                <button
                  className="button button-secondary"
                  onClick={() => changeStep(0)}
                >
                  {t("Edit details ")}
                </button>
                <button
                  className="button"
                  disabled={
                    busy ||
                    settings.mode === "paused" ||
                    !validWhatsAppNumber(settings.whatsapp) ||
                    shipping === null
                  }
                  onClick={placeOrder}
                >
                  {t(
                    busy
                      ? "Placing order…"
                      : "Continue to WhatsApp",
                  )}
                </button>
              </div>
              <p role="status" className="muted small-text">
                {t(message)}
              </p>
            </>
          )}
        </div>
        <aside className="order-summary">
          <h2>{t("In your bag")}</h2>
          {lines.map((line) => (
            <div
              className="summary-row"
              key={`${line.product.id}-${line.size.id}`}
            >
              <span>
                {productName(line.product, locale)}
                <br />
                <span className="muted">
                  {t(line.size.label)}
                  {t(" × ")}
                  {line.quantity}
                </span>
              </span>
              <span>{t(currency(line.total, locale))}</span>
            </div>
          ))}
          <hr className="border-ivory" />
          <div className="summary-row">
            <span>{t("Subtotal")}</span>
            <strong>{t(currency(subtotal, locale))}</strong>
          </div>
          <div className="summary-row">
            <span>{t("Delivery")}</span>
            <span>
              {shipping === null
                ? t("Choose governorate")
                : currency(shipping, locale)}
            </span>
          </div>
          <div className="summary-row">
            <span>{t("Total")}</span>
            <strong>{currency(total, locale)}</strong>
          </div>
        </aside>
      </div>
    </>
  );
}
