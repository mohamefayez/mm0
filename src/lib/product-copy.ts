import type { Product } from "../types/catalog.ts";
export function productName(product: Product, locale: string) {
  return locale === "ar" && product.nameAr ? product.nameAr : product.name;
}
export function productDescription(product: Product, locale: string) {
  return locale === "ar" && product.descriptionAr
    ? product.descriptionAr
    : product.description;
}
