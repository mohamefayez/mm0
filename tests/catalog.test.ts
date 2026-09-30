import { test } from "node:test";
import assert from "node:assert/strict";
import { filterCatalog, recommend } from "../src/lib/catalog-logic.ts";
import { addCartItem, resolveCart } from "../src/lib/cart-logic.ts";
import { checkoutSchema } from "../src/lib/checkout.ts";
import type { Product } from "../src/types/catalog.ts";

// Test-only records. These are never imported into the store catalog.
const product: Product = {
  id: "test-1",
  slug: "test-one",
  name: "Test fragrance",
  brandId: "test-house",
  gender: "unisex",
  concentration: "EDP",
  description: "Test fixture",
  scentFamilies: ["woody"],
  topNotes: ["bergamot"],
  heartNotes: ["rose"],
  baseNotes: ["oud"],
  occasions: ["evening"],
  seasons: ["winter"],
  projection: "strong",
  categories: ["niche"],
  sizes: [
    { id: "50", ml: 50, label: "50 ml", price: 2000, stock: 2 },
    { id: "100", ml: 100, label: "100 ml", price: 3000, stock: 0 },
  ],
  images: [],
  createdAt: "2026-01-01",
  isFeatured: true,
};
test("catalog combines note, gender, stock and price filters; searches brand names", () => {
  assert.equal(
    filterCatalog([product], {
      note: "oud",
      gender: "unisex",
      max: "2500",
      stock: "in-stock",
    }).total,
    1,
  );
  assert.equal(filterCatalog([product], { max: "1999" }).total, 0);
  assert.equal(
    filterCatalog(
      [product],
      { q: "TEST HOUSE" },
      { "test-house": "Test House" },
    ).total,
    1,
  );
  assert.equal(filterCatalog([product], { q: "missing" }).total, 0);
  assert.equal(filterCatalog([product], { q: "العود" }).total, 1);
  assert.equal(filterCatalog([product], { q: "ورد" }).total, 1);
  assert.equal(filterCatalog([product], { q: "فانيليا" }).total, 0);
  assert.equal(filterCatalog([], {}).total, 0);
});
test("catalog sorts and clamps invalid pagination", () => {
  const expensive = {
    ...product,
    id: "test-2",
    sizes: [{ ...product.sizes[0], price: 8000 }],
  };
  assert.equal(
    filterCatalog([product, expensive], { sort: "price-desc" }).products[0].id,
    "test-2",
  );
  assert.equal(filterCatalog([product], { page: "-5" }).page, 1);
  assert.equal(filterCatalog([product], { page: "Infinity" }).page, 1);
});
test("cart merges a size and respects stock limits", () => {
  const first = addCartItem(
    [],
    { productId: product.id, sizeId: "50", quantity: 1 },
    2,
  );
  const result = addCartItem(
    first,
    { productId: product.id, sizeId: "50", quantity: 3 },
    2,
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].quantity, 2);
  assert.deepEqual(
    addCartItem([], { productId: product.id, sizeId: "50", quantity: -1 }, 2),
    [],
  );
  assert.deepEqual(
    addCartItem([], { productId: product.id, sizeId: "100", quantity: 1 }, 0),
    [],
  );
});
test("cart rejects stale products and stock; totals use catalog prices", () => {
  const lines = resolveCart(
    [
      { productId: product.id, sizeId: "50", quantity: 99 },
      { productId: product.id, sizeId: "100", quantity: 1 },
      { productId: "missing", sizeId: "50", quantity: 1 },
    ],
    [product],
  );
  assert.equal(lines.length, 1);
  assert.equal(lines[0].quantity, 2);
  assert.equal(lines[0].total, 4000);
});
test("quiz respects budget and provides concrete matching reasons", () => {
  const answers = {
    gender: "women",
    family: "woody",
    occasion: "evening",
    projection: "strong",
    budget: "2500",
  };
  const matches = recommend([product], answers);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].reasons.length, 3);
  assert.equal(recommend([product], { ...answers, budget: "1000" }).length, 0);
  assert.equal(recommend([], answers).length, 0);
});
test("Egypt checkout validates phone formats and required address fields", () => {
  const address = {
    name: "Test Shopper",
    phone: "01012345678",
    email: "test@example.com",
    governorate: "Cairo",
    city: "Nasr City",
    street: "Test Street",
    building: "1",
    floor: "",
    apartment: "",
    notes: "",
  };
  assert.equal(checkoutSchema.safeParse(address).success, true);
  for (const phone of ["٠١٠١٢٣٤٥٦٧٨", "۰۱۰۱۲۳۴۵۶۷۸"]) {
    assert.equal(
      checkoutSchema.parse({ ...address, phone }).phone,
      address.phone,
    );
  }
  assert.equal(
    checkoutSchema.safeParse({ ...address, phone: "+20 101 234 5678" }).success,
    true,
  );
  assert.equal(
    checkoutSchema.safeParse({ ...address, phone: "00201012345678" }).success,
    true,
  );
  assert.equal(
    checkoutSchema.safeParse({ ...address, phone: "01412345678" }).success,
    false,
  );
  assert.equal(
    checkoutSchema.safeParse({ ...address, governorate: "Invalid" }).success,
    false,
  );
  assert.equal(
    checkoutSchema.safeParse({ ...address, street: "" }).success,
    false,
  );
});
