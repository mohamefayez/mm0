import { translator } from "@/lib/i18n";
import { CheckoutForm } from "@/components/checkout-form";
import { catalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { getStore } from "@/lib/commerce-store";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(
    "Checkout",
    "Review your Asel Cosmetics order details.",
    `/${locale}/checkout`,
  );
}
export default async function Checkout({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = translator(locale);

  const products = await catalog.all();
  return (
    <div className="container">
      <div className="page-heading">
        <h1>{t("The finishing touches.")}</h1>
        <p>{t("Your fragrance journey, almost ready.")}</p>
      </div>
      <div className="page-body">
        <CheckoutForm
          products={products}
          locale={locale}
          settings={getStore().settings()}
        />
      </div>
    </div>
  );
}
