import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { getStore } from "../src/lib/commerce-store.ts";
import { cutoutProductIds } from "../src/data/product-cutouts.ts";

// Run store:backup first. Apply only covers, preserving all other owner data.
const store = getStore();
try {
  for (const id of cutoutProductIds) {
    await access(`public/products/${id}-cutout.png`);
  }
  let updated = 0;
  for (const id of cutoutProductIds) {
    const product = store.product(id);
    if (!product) continue;
    const src = `/products/${id}-cutout.png`;
    if (product.images[0]?.src === src) continue;
    const images = [
      { src, alt: product.name },
      ...product.images.filter((image) => image.src !== src),
    ];
    const saved = store.saveProduct({ ...product, images });
    assert.deepEqual(
      { ...saved, images: product.images, revision: product.revision },
      product,
      `Non-image data changed for ${id}`,
    );
    updated++;
  }
  console.log(`Applied ${updated} covers; all original gallery photos and other product data preserved.`);
} finally {
  store.db.close();
}
