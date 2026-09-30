import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { getStore } from "@/lib/commerce-store";
import { translator } from "@/lib/i18n";
import { currency } from "@/lib/config";
const pages: Record<string, [string, string]> = {
  about: ["Our story", "حكايتنا"],
  contact: ["Here to help.", "نحن هنا لمساعدتك."],
  shipping: ["Delivery & returns.", "التوصيل والاسترجاع."],
  privacy: ["Your privacy.", "خصوصيتك."],
  terms: ["Store terms", "شروط المتجر"],
  account: ["Your Asel space.", "مساحتك في أسيل."],
};
type Props = { params: Promise<{ locale: string; section: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale, section } = await params;
  return pages[section]
    ? pageMetadata(
        pages[section][locale === "ar" ? 1 : 0],
        "Asel Cosmetics",
        `/${locale}/${section}`,
      )
    : {};
}
export default async function InformationPage({ params }: Props) {
  const { locale, section } = await params;
  const t = translator(locale);
  const tr = (en: string, ar: string) => (locale === "ar" ? ar : en);
  if (["men", "women", "unisex"].includes(section))
    redirect(`/${locale}/perfumes?gender=${section}`);
  if (["niche", "gifts", "arabic"].includes(section))
    redirect(`/${locale}/perfumes?category=${section}`);
  if (!Object.hasOwn(pages, section)) notFound();
  const s = getStore().settings();
  const copy = (en: string, ar: string) =>
    locale === "ar" ? ar || en : en || ar;
  return (
    <div className="container">
      <div className="page-heading">
        <h1>{pages[section][locale === "ar" ? 1 : 0]}</h1>
      </div>
      <div className="page-body prose">
        {section === "about" && (
          <>
            <h2>{tr("Fragrance is personal.", "العطر اختيار يخصك.")}</h2>
            <p>
              {tr(
                "Discover the Asel Cosmetics collection, explore your favourite notes and choose a fragrance that feels like you.",
                "اكتشف مجموعة أسيل كوزمتكس، وتعرّف على المكوّنات اللي تحبها واختار العطر اللي يشبهك.",
              )}
            </p>
            <Link className="text-link" href={`/${locale}/perfumes`}>
              {tr("Explore the collection", "اكتشف المجموعة")}
            </Link>
          </>
        )}
        {section === "contact" && (
          <>
            <h2>{tr("Contact Asel", "تواصل مع أسيل")}</h2>
            {s.phone && (
              <p>
                <a href={`tel:${s.phone}`} dir="ltr">
                  {s.phone}
                </a>
              </p>
            )}
            {s.whatsapp && (
              <p>
                <a
                  className="text-link"
                  href={`https://wa.me/${s.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </p>
            )}
            {s.email && (
              <p>
                <a href={`mailto:${s.email}`}>{s.email}</a>
              </p>
            )}
            {s.address && <p>{s.address}</p>}
            {!s.phone && !s.whatsapp && !s.email && (
              <p>
                {tr(
                  "Official contact details will be available before launch.",
                  "بيانات التواصل الرسمية هتتوفر قبل فتح البيع.",
                )}
              </p>
            )}
            <details open>
              <summary>
                {tr("Can I order now?", "هل أقدر أطلب دلوقتي؟")}
              </summary>
              <p>
                {s.mode === "live"
                  ? tr(
                      "Yes. Add products to your bag and complete checkout. Pay on delivery.",
                      "نعم. أضف المنتجات للحقيبة وأكمل الطلب. الدفع عند الاستلام.",
                    )
                  : s.mode === "test"
                    ? tr(
                        "You can place a test order. Prices are temporary and test orders are not shipped.",
                        "تقدر تعمل طلب تجريبي. الأسعار مؤقتة والطلبات التجريبية لا يتم شحنها.",
                      )
                    : tr(
                        "Orders are temporarily paused.",
                        "الطلبات متوقفة مؤقتًا.",
                      )}
              </p>
            </details>
            <details>
              <summary>{tr("Do I need an account?", "هل محتاج حساب؟")}</summary>
              <p>
                {tr(
                  "No. You can order as a guest. Your bag and favourites are saved on this device.",
                  "لا. تقدر تطلب بدون حساب. الحقيبة والمفضلة محفوظين على جهازك.",
                )}
              </p>
            </details>
          </>
        )}
        {section === "shipping" && (
          <>
            <h2>{tr("Delivery across Egypt", "التوصيل داخل مصر")}</h2>
            {s.mode !== "live" && (
              <p className="notice">
                {tr(
                  "The rates below are test values until approved by the store.",
                  "الرسوم التالية تجريبية لحين اعتمادها من المتجر.",
                )}
              </p>
            )}
            {copy(s.shippingText, s.shippingTextAr) && (
              <p className="preserve-lines">
                {copy(s.shippingText, s.shippingTextAr)}
              </p>
            )}
            <div className="shipping-table">
              {s.shippingRates
                .filter((r) => r.enabled)
                .map((r) => (
                  <div className="summary-row" key={r.governorate}>
                    <span>{t(r.governorate)}</span>
                    <strong>{currency(r.fee, locale)}</strong>
                  </div>
                ))}
            </div>
            {s.freeShippingThreshold !== null && (
              <p>
                {tr("Free delivery on orders from ", "شحن مجاني للطلبات من ")}
                {currency(s.freeShippingThreshold, locale)}
              </p>
            )}
            <h2>{tr("Returns & exchanges", "الاستبدال والاسترجاع")}</h2>
            <p className="preserve-lines">
              {copy(s.returnsText, s.returnsTextAr) ||
                tr(
                  "The approved return and exchange policy will be published before live ordering opens.",
                  "سيتم نشر سياسة الاستبدال والاسترجاع المعتمدة قبل استقبال طلبات فعلية.",
                )}
            </p>
          </>
        )}
        {section === "privacy" && (
          <>
            <h2>{tr("Your order details", "بيانات طلبك")}</h2>
            <p>
              {tr(
                "When you place an order, your name, phone, email, delivery address and order details are saved in the store database. Only the signed-in store administrator can view them. Test orders are also saved; use test contact details while trying the store.",
                "عند تسجيل طلب، بنحفظ الاسم ورقم الهاتف والبريد وعنوان التوصيل وتفاصيل الطلب في قاعدة بيانات المتجر. مدير المتجر المسجل دخوله فقط يقدر يشوفها. الطلبات التجريبية بتتحفظ كمان؛ استخدم بيانات تجريبية أثناء تجربة الموقع.",
              )}
            </p>
            <h2>{tr("Saved preferences", "التفضيلات المحفوظة")}</h2>
            <p>
              {tr(
                "Your bag, favourites and recent views are saved in this browser. Language and appearance cookies last one year. Admin sessions use a private cookie lasting up to eight hours. Clear site data in your browser to remove saved preferences. No advertising trackers are included.",
                "الحقيبة والمفضلة والمشاهدات الأخيرة محفوظة في المتصفح. ملفات اللغة والمظهر تستمر سنة. جلسة الإدارة تستخدم ملفًا خاصًا لمدة تصل إلى ٨ ساعات. تقدر تمسح بيانات الموقع من المتصفح لحذف التفضيلات. لا توجد أدوات تتبع إعلانية.",
              )}
            </p>
            {copy(s.privacyText, s.privacyTextAr) && (
              <p className="preserve-lines">
                {copy(s.privacyText, s.privacyTextAr)}
              </p>
            )}
          </>
        )}
        {section === "terms" && (
          <>
            <p>
              {s.mode === "test"
                ? tr(
                    "This store is in test mode. Displayed prices, stock and shipping rates are temporary. Test orders are saved for review and do not create a delivery or payment obligation.",
                    "المتجر في وضع التجربة. الأسعار والمخزون ورسوم الشحن مؤقتة. الطلبات التجريبية تتحفظ للمراجعة ولا تتطلب شحن أو دفع.",
                  )
                : tr(
                    "The price and delivery charge are shown before you place your order. Payment is collected on delivery.",
                    "السعر ورسوم الشحن بيظهروا قبل تسجيل الطلب. الدفع عند الاستلام.",
                  )}
            </p>
            <p className="preserve-lines">
              {copy(s.termsText, s.termsTextAr) ||
                tr(
                  "Approved purchase terms will be published before launch.",
                  "سيتم نشر شروط الشراء المعتمدة قبل فتح البيع.",
                )}
            </p>
          </>
        )}
        {section === "account" && (
          <>
            <h2>{tr("Shop without an account", "تسوّق بدون حساب")}</h2>
            <p>
              {tr(
                "Guest checkout is available. Keep your order reference after checkout; your saved favourites are available on this device.",
                "تقدر تكمل الطلب بدون حساب. احتفظ برقم الطلب بعد تسجيله، والمفضلة متاحة على نفس الجهاز.",
              )}
            </p>
            <Link className="text-link" href={`/${locale}/wishlist`}>
              {tr("Your wishlist", "المفضلة")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
