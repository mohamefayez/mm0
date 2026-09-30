import { translator } from "@/lib/i18n";
import { Search } from "lucide-react";
import { CatalogView } from "@/components/catalog-view";
import { pageMetadata } from "@/lib/metadata";
import { first } from "@/lib/catalog-logic";
import type { CatalogQuery } from "@/types/catalog";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(
    "Search fragrances",
    "Find a fragrance by name, brand or note.",
    `/${locale}/search`,
  );
}
export default async function SearchPage({
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
        <h1>{t("Follow a scent.")}</h1>
        <p>{t("A name, a note, a favourite house. Start anywhere.")}</p>
      </div>
      <form action={`/${locale}/search`} className="search-form">
        <label className="sr-only" htmlFor="page-search">
          {t("Search fragrances ")}
        </label>
        <input
          id="page-search"
          name="q"
          type="search"
          defaultValue={first(query.q)}
          placeholder={t("Search by fragrance, brand or note")}
        />
        <button className="icon-button" aria-label={t("Search")}>
          <Search size={20} />
        </button>
      </form>
      <div className="page-body">
        <CatalogView locale={locale} query={query} />
      </div>
    </div>
  );
}
