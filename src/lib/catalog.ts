import { getStore } from "@/lib/commerce-store";
import { filterCatalog } from "@/lib/catalog-logic";
import type { CatalogQuery } from "@/types/catalog";

export const catalog = {
  list: async (query: CatalogQuery = {}) =>
    filterCatalog(
      getStore().products(),
      query,
      Object.fromEntries(
        getStore()
          .brands()
          .map((brand) => [brand.id, brand.name]),
      ),
    ),
  all: async () => getStore().products(),
  get: async (slug: string) =>
    getStore()
      .products()
      .find((product) => product.slug === slug),
  brands: async () => getStore().brands(),
  brand: async (slug: string) =>
    getStore()
      .brands()
      .find((brand) => brand.slug === slug),
};
