export const site = {
  name: "Asel Cosmetics",
  description:
    "Discover your own scent story. A considered world of fragrance by Asel Cosmetics, Egypt.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  announcement: "A new world of fragrance is unfolding. Welcome to Asel.",
  currency: "EGP",
  // Confirm business rules with the owner before enabling checkout.
  checkoutEnabled: false,
  shippingFee: null as number | null,
  freeShippingThreshold: null as number | null,
  contactEmail: null as string | null,
  whatsapp: null as string | null,
};
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const localeDirection = { en: "ltr", ar: "rtl" } as const;
export function pathFor(locale: string, path = "") {
  return `/${locale}${path}`;
}
export function currency(amount: number, locale = "en") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}
