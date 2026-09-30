import { translator } from "@/lib/i18n";
import { CartContent } from "@/components/shop";
import { catalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(
    "Your shopping bag",
    "Review the fragrances in your Asel Cosmetics bag.",
    `/${locale}/cart`,
  );
}
export default async function Cart({
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
        <h1>{t("Your shopping bag.")}</h1>
        <p>{t("A little luxury, chosen by you.")}</p>
      </div>
      <div className="page-body">
        <CartContent products={products} locale={locale} />
      </div>
    </div>
  );
}
