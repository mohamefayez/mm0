import type { MetadataRoute } from "next";
import { site, locales } from "@/lib/config";
import { catalog } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, brands] = await Promise.all([
    catalog.all(),
    catalog.brands(),
  ]);
  const paths = [
    "",
    "/perfumes",
    "/brands",
    "/discover",
    "/notes",
    "/about",
    ...products.map((product) => `/perfumes/${product.slug}`),
    ...brands.map((brand) => `/brands/${brand.slug}`),
  ];
  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${site.url}/${locale}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
  );
}
