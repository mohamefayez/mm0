import { translator } from "@/lib/i18n";
import { CatalogView } from "@/components/catalog-view";
import { Breadcrumbs } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
import type { CatalogQuery } from "@/types/catalog";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(
    "The fragrance collection",
    "Explore perfumes by fragrance family, note, brand and occasion at Asel Cosmetics.",
    `/${locale}/perfumes`,
  );
}
export default async function Perfumes({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<CatalogQuery>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const t = translator(locale);

  return (
    <div className="container">
      <div className="page-heading">
        <Breadcrumbs
          items={[
            { label: "Home", href: `/${locale}` },
            { label: "Fragrances" },
          ]}
        />
        <h1>{t("The fragrance collection.")}</h1>
        <p>{t("For every mood, every moment, every version of you.")}</p>
      </div>
      <div className="page-body">
        <CatalogView locale={locale} query={query} />
      </div>
    </div>
  );
}
