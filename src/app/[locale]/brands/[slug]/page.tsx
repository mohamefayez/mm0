import { translator } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { catalog } from "@/lib/catalog";
import { CatalogView } from "@/components/catalog-view";
import { Breadcrumbs } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
import type { CatalogQuery } from "@/types/catalog";
type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<CatalogQuery>;
};
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const brand = await catalog.brand(slug);
  return brand
    ? pageMetadata(brand.name, brand.description, `/${locale}/brands/${slug}`)
    : {};
}
export default async function BrandPage({ params, searchParams }: Props) {
  const [{ locale, slug }, query] = await Promise.all([params, searchParams]);
  const t = translator(locale);

  const brand = await catalog.brand(slug);
  if (!brand) notFound();
  return (
    <div className="container">
      <div className="page-heading">
        <Breadcrumbs
          items={[
            { label: "Home", href: `/${locale}` },
            { label: "Houses", href: `/${locale}/brands` },
            { label: brand.name },
          ]}
        />
        <h1>{t(brand.name)}</h1>
        <p>{t(brand.description)}</p>
      </div>
      <div className="page-body">
        <CatalogView locale={locale} query={{ ...query, brand: brand.id }} />
      </div>
    </div>
  );
}
