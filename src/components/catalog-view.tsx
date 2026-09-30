import { translator } from "@/lib/i18n";
import Link from "next/link";
import { catalog } from "@/lib/catalog";
import {
  ActiveFilters,
  CatalogToolbar,
  FilterSidebar,
} from "@/components/catalog-controls";
import { EmptyState } from "@/components/ui";
import { ProductGrid } from "@/components/product-card";
import type { CatalogQuery } from "@/types/catalog";
export async function CatalogView({
  query,
  locale,
}: {
  query: CatalogQuery;
  locale: string;
}) {
  const t = translator(locale);

  const [result, brands, all] = await Promise.all([
    catalog.list(query),
    catalog.brands(),
    catalog.all(),
  ]);
  return (
    <>
      <CatalogToolbar total={result.total} brands={brands} />
      <ActiveFilters brands={brands} />
      <div className="catalog-layout">
        <FilterSidebar brands={brands} />
        <div>
          {result.products.length ? (
            <ProductGrid
              products={result.products}
              brands={brands}
              locale={locale}
            />
          ) : (
            <EmptyState
              title={t(
                all.length
                  ? "A different direction, perhaps?"
                  : "Our first collection is coming soon.",
              )}
              description={t(
                all.length
                  ? "No fragrances match these filters. Clear a filter or explore another note."
                  : "We’re making room for something special. In the meantime, discover the fragrance families that feel like you.",
              )}
              href={all.length ? `/${locale}/perfumes` : `/${locale}/discover`}
              action={t(
                all.length ? "Clear filters" : "Find your scent family",
              )}
            />
          )}
          {result.pageCount > 1 && (
            <nav className="pagination" aria-label={t("Catalog pages")}>
              {Array.from(
                { length: result.pageCount },
                (_, index) => index + 1,
              ).map((page) => {
                const params = new URLSearchParams();
                Object.entries(query).forEach(([key, value]) => {
                  if (value && !Array.isArray(value)) params.set(key, value);
                });
                params.set("page", String(page));
                return (
                  <Link
                    key={page}
                    href={`?${params}`}
                    aria-current={page === result.page ? "page" : undefined}
                  >
                    {page}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
