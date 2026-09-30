import { translator } from "@/lib/i18n";
import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { EmptyState } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(
    "Fragrance houses",
    "Discover the fragrance houses in the Asel Cosmetics collection.",
    `/${locale}/brands`,
  );
}
export default async function Brands({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = translator(locale);

  const brands = await catalog.brands();
  return (
    <div className="container">
      <div className="page-heading">
        <h1>{t("The houses behind the scents.")}</h1>
        <p>{t("Different perspectives. A shared love of perfumery.")}</p>
      </div>
      <div className="page-body">
        {brands.length ? (
          <div className="brand-grid">
            {brands.map((brand) => (
              <Link key={brand.id} href={`/${locale}/brands/${brand.slug}`}>
                {t(brand.name)}
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title={t("Our fragrance houses, revealed soon.")}
            description={t(
              "Meet the names behind our first collection when it arrives. Until then, start your discovery with a fragrance note.",
            )}
            href={`/${locale}/notes`}
          />
        )}
      </div>
    </div>
  );
}
