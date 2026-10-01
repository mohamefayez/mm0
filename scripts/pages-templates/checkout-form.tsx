"use client";
import { useState } from "react";
import { useShop } from "@/store/shop-store";
import { resolveCart } from "@/lib/cart-logic";
import { currency } from "@/lib/config";
import { productName } from "@/lib/product-copy";
import type { Product } from "@/types/catalog";
import type { StoreSettings } from "@/lib/commerce-schema";
import { EmptyState } from "@/components/ui";

export function CheckoutForm({ products, locale, settings }: { products: Product[]; locale: string; settings: StoreSettings }) {
  const ar = locale === "ar";
  const lines = resolveCart(useShop((state) => state.items), products);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [link, setLink] = useState("");
  const total = lines.reduce((sum, line) => sum + line.total, 0);
  if (!lines.length) return <EmptyState title={ar ? "حقيبتك فارغة" : "Your bag is empty"} description="" href={`/${locale}/perfumes`} action={ar ? "اكتشف العطور" : "Explore fragrances"} />;
  return <div className="prose pages-checkout">
    <p className="notice">{ar ? "الأسعار المعروضة مؤقتة. السعر النهائي والتوفر والشحن بتأكيد المالك على واتساب. الطلب لا يُحفظ على الموقع." : "Displayed prices are provisional. Final price, availability and delivery are confirmed by the owner on WhatsApp. Orders are not saved on this website."}</p>
    <form onSubmit={(event) => {
      event.preventDefault();
      const message = ["Asel Cosmetics — استفسار طلب / Order enquiry", "",
        ...lines.map((line) => `${productName(line.product, locale)} — ${line.size.label} × ${line.quantity}: ${currency(line.total, locale)}`),
        "", `إجمالي مبدئي / Provisional subtotal: ${currency(total, locale)}`,
        "السعر والتوفر والشحن بحاجة للتأكيد / Price, availability and delivery to be confirmed",
        `الاسم / Name: ${name.trim()}`, `الهاتف / Phone: ${phone.trim()}`, `العنوان / Address: ${address.trim()}`,
      ].join("\n");
      const url = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`;
      setLink(url);
      window.location.assign(url);
    }}>
      <label>{ar ? "الاسم" : "Name"}<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>{ar ? "رقم الهاتف" : "Phone"}<input required type="tel" pattern={"(?:\\+?20|0)1[0125][0-9]{8}"} maxLength={14} autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
      <label>{ar ? "المحافظة والعنوان" : "Governorate and address"}<textarea required minLength={8} maxLength={400} autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} /></label>
      <ul>{lines.map((line) => <li key={`${line.product.id}-${line.size.id}`}>{productName(line.product, locale)} × {line.quantity} — {currency(line.total, locale)}</li>)}</ul>
      <p>{ar ? "الإجمالي المبدئي، بدون الشحن: " : "Provisional subtotal, excluding delivery: "}{currency(total, locale)}</p>
      <button type="submit" className="button">{ar ? "متابعة على واتساب" : "Continue to WhatsApp"}</button>
    </form>
    {link && <p><a className="text-link" href={link}>{ar ? "افتح واتساب مرة أخرى ثم اضغط إرسال" : "Reopen WhatsApp, then press Send"}</a></p>}
  </div>;
}
