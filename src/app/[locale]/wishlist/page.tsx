import { translator } from "@/lib/i18n";
import { Wishlist } from "@/components/shop";
import { catalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(
    "Your wishlist",
    "Keep your favourite fragrances in one place.",
    `/${locale}/wishlist`,
  );
}
export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = translator(locale);

  const [products, brands] = await Promise.all([
    catalog.all(),
    catalog.brands(),
  ]);
  return (
    <div className="container">
      <div className="page-heading">
        <h1>{t("A few favourites.")}</h1>
        <p>{t("The scents you’re drawn to. Saved for another moment.")}</p>
      </div>
      <div className="page-body">
        <Wishlist products={products} brands={brands} locale={locale} />
      </div>
    </div>
  );
}
