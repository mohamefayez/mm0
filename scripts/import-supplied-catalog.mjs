import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { getStore } from "../src/lib/commerce-store.ts";
import { suppliedBrands, suppliedProducts, suppliedCovers } from "../src/data/supplied-catalog.ts";

// Manual, repeatable import. Existing owner edits always win.
for (const src of [...suppliedProducts.flatMap(p => p.images.map(i => i.src)), ...Object.values(suppliedCovers)]) await access(`public${src}`);
const store = getStore();
try {
  assert.equal(store.settings().mode, "test", "Temporary catalog import requires test mode");
  for (const brand of suppliedBrands) if (!store.brands().some(b => b.id === brand.id)) store.saveBrand(brand);
  let added = 0;
  for (const product of suppliedProducts) if (!store.product(product.id)) { store.saveProduct(product); added++; }
  let covers = 0;
  for (const [id, src] of Object.entries(suppliedCovers)) {
    const old = store.product(id);
    if (!old || old.images.some(i => i.src === src)) continue;
    const saved = store.saveProduct({ ...old, images: [{ src, alt: old.name }, ...old.images] });
    assert.deepEqual({ ...saved, images: old.images, revision: old.revision }, old);
    covers++;
  }
  console.log(JSON.stringify({ added, covers, visible: store.products().length, drafts: store.products(true).filter(p => !p.published).length }));
} finally { store.db.close(); }
