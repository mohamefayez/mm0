import type { CatalogQuery, Product } from "../types/catalog.ts";

export function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}
export function productPrice(product: Product) {
  return Math.min(...product.sizes.map((size) => size.price));
}
export function filterCatalog(
  products: Product[],
  query: CatalogQuery,
  brandNames: Record<string, string> = {},
) {
  const rawQuery = first(query.q).trim().toLowerCase();
  const aliases: Record<string, string> = {
    عود: "oud",
    العود: "oud",
    ورد: "rose",
    الورد: "rose",
    فانيليا: "vanilla",
    الفانيليا: "vanilla",
    مسك: "musk",
    المسك: "musk",
    عنبر: "amber",
    العنبر: "amber",
    حمضيات: "citrus",
    الحمضيات: "citrus",
    ياسمين: "jasmine",
    الياسمين: "jasmine",
    برغموت: "bergamot",
    رجالي: "men",
    نسائي: "women",
    للجميع: "unisex",
  };
  const q = aliases[rawQuery] ?? rawQuery;
  const has = (key: string, value: string) =>
    !first(query[key]) || first(query[key]) === value;
  let result = products.filter((product) => {
    const allNotes = [
      ...product.topNotes,
      ...product.heartNotes,
      ...product.baseNotes,
    ];
    const haystack = [
      product.name,
      product.nameAr,
      brandNames[product.brandId],
      product.gender,
      ...product.categories,
      ...allNotes,
    ]
      .join(" ")
      .toLowerCase();
    return (
      (!q || haystack.includes(q)) &&
      has("gender", product.gender) &&
      has("brand", product.brandId) &&
      has("concentration", product.concentration) &&
      (!first(query.category) ||
        product.categories.includes(first(query.category))) &&
      (!first(query.note) || allNotes.includes(first(query.note))) &&
      (!first(query.family) ||
        product.scentFamilies.includes(first(query.family))) &&
      (!first(query.occasion) ||
        product.occasions.includes(first(query.occasion))) &&
      (!first(query.season) || product.seasons.includes(first(query.season))) &&
      (!first(query.size) ||
        product.sizes.some((size) => String(size.ml) === first(query.size))) &&
      (!first(query.min) ||
        productPrice(product) >= Number(first(query.min))) &&
      (!first(query.max) ||
        productPrice(product) <= Number(first(query.max))) &&
      (first(query.stock) !== "in-stock" ||
        product.sizes.some((size) => size.stock > 0)) &&
      (first(query.collection) !== "new" || product.isNew) &&
      (first(query.collection) !== "bestsellers" || product.isBestSeller)
    );
  });
  const sort = first(query.sort);
  result = result.sort((a, b) => {
    if (sort === "price-asc") return productPrice(a) - productPrice(b);
    if (sort === "price-desc") return productPrice(b) - productPrice(a);
    if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
    if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    if (sort === "bestselling")
      return Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller));
    return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
  });
  const pageCount = Math.max(1, Math.ceil(result.length / 12));
  const requestedPage = Number(first(query.page)) || 1;
  const page = Math.max(1, Math.min(pageCount, Math.floor(requestedPage)));
  return {
    products: result.slice((page - 1) * 12, page * 12),
    total: result.length,
    page,
    pageCount,
  };
}

export type QuizAnswers = {
  gender: string;
  family: string;
  occasion: string;
  projection: string;
  budget: string;
};
export function recommend(products: Product[], answers: QuizAnswers) {
  return products
    .filter(
      (product) =>
        product.sizes.some((size) => size.stock > 0) &&
        (answers.gender === "any" ||
          product.gender === answers.gender ||
          product.gender === "unisex") &&
        (answers.budget === "any" ||
          productPrice(product) <= Number(answers.budget)),
    )
    .map((product) => {
      const reasons = [
        product.scentFamilies.includes(answers.family)
          ? `${answers.family} scent family`
          : "",
        product.occasions.includes(answers.occasion)
          ? `suited to ${answers.occasion}`
          : "",
        product.projection === answers.projection
          ? `${answers.projection} projection`
          : "",
      ].filter(Boolean);
      return { product, reasons, score: reasons.length };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}
