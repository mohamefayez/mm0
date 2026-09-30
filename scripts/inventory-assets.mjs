import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const root = process.cwd();
const directory = "صور المنتجات";
const files = (await readdir(path.join(root, directory)))
  .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
  .sort();
const seen = new Map();
const records = [];
for (const [index, name] of files.entries()) {
  const content = await readFile(path.join(root, directory, name));
  const hash = createHash("sha256").update(content).digest("hex");
  const id = `asset-${String(index + 1).padStart(3, "0")}`;
  records.push({
    id,
    source: `${directory}/${name}`,
    bytes: content.length,
    sha256: hash,
    duplicateOf: seen.get(hash) ?? null,
    status: "pending-review",
    productName: null,
    brand: null,
    sizeMl: null,
    priceEGP: null,
    stock: null,
  });
  if (!seen.has(hash)) seen.set(hash, id);
}
await mkdir(path.join(root, "docs"), { recursive: true });
await writeFile(
  path.join(root, "docs/product-assets.json"),
  JSON.stringify(
    {
      note: "Incoming assets only; not published product data. Confirm each product, size, price, and stock with the owner. Promotional artwork may contain unconfirmed offers/contact details.",
      assets: records,
    },
    null,
    2,
  ) + "\n",
);
const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const cards = records
  .map(
    (asset) =>
      `<figure><img loading="lazy" src="../${asset.source.split("/").map(encodeURIComponent).join("/")}" alt="${escape(asset.id)}"><figcaption><strong>${asset.id}</strong><br>${escape(asset.source)}${asset.duplicateOf ? `<br>Duplicate of ${asset.duplicateOf}` : ""}</figcaption></figure>`,
  )
  .join("\n");
await writeFile(
  path.join(root, "docs/product-assets.html"),
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Asel — incoming product images</title><style>body{margin:30px;background:#f8f5ee;color:#30271f;font:14px Arial}h1{font:36px Georgia}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:20px}figure{margin:0;background:#eee7db;padding:10px}img{width:100%;height:280px;object-fit:contain}figcaption{font-size:11px;overflow-wrap:anywhere;line-height:1.8;margin-top:10px}</style><h1>Asel Cosmetics — incoming images</h1><p>${records.length} images. These are review assets, not published catalog entries.</p><div class="grid">${cards}</div></html>`,
);
console.log(
  `Indexed ${records.length} images, ${records.filter((asset) => asset.duplicateOf).length} exact duplicates.`,
);
