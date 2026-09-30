# Asel Cosmetics — product catalog

The owner authorised adding supplied photos with temporary prices on 28 September 2026. This supersedes the earlier instruction to defer all products.

`src/data/seed-catalog.ts` maps the reviewed photographs to 29 initial records: 27 visible products and two unpublished drafts whose names could not be read confidently. All 45 source photos are copied unchanged to the media library. Group/promotional photographs remain available for review; they are not all treated as distinct products. Repeated views of the same fragrance share one product gallery.

Prices are temporary (450–900 EGP), initial stock is 10 per variant, and bottle sizes are marked **Size to confirm**. These are test data, not verified commercial availability. Notes and fragrance families are left empty until confirmed. Test mode displays a persistent notice and never fulfils an order or collects payment.

## Edit products

Use `/ar/admin` → Products. Edit names/descriptions in both languages, brand, classification, photos, sizes, prices and stock. The first selected photo is the cover. The Photos tab accepts JPEG, PNG and WebP uploads up to 8 MB.

Use the visibility checkbox to archive a product without removing order history. Confirm identity, size, concentration, price and actual stock before ticking the approval checkbox. Unknown sizes and concentrations cannot be approved. Product revisions prevent a stale editor from overwriting a recent inventory update.

Catalog edits are stored in SQLite. Editing the seed file does not overwrite an existing database. `npm run store:setup` preserves an existing catalog and administrator.

## More photos

Upload through the Photos tab, or add files to `صور المنتجات` and refresh the source inventory with `npm run assets:inventory`. Inventory records are for review; they do not automatically create products. Do not infer approved contact information or promotions from text embedded in photographs.

Before changing the source file list, retain a copy of the existing inventory. Asset IDs are generated in filename order and may shift if earlier-sorting filenames are added; the admin upload workflow avoids this issue.
