# Product cover integration

The first 15 covers were prepared with the built-in image editing tool (not the CLI/API fallback), then inspected and integrated. These are AI-assisted presentation images; the owner's untouched photographs remain in each product gallery as the reference for actual product details.

- Assets: `public/products/<product-id>-cutout.png` (15 PNG files).
- Input/output mapping and prompt specifications: `product-cutouts.json`.
- Included products: `src/data/product-cutouts.ts`.
- Existing SQLite catalog updated through `saveProduct`, preserving prices, stock, descriptions, publication state and all original gallery photos. Revision changes are intentional.
- Fresh installs receive the same covers through `seed-catalog.ts`.
- Shared product image component uses existing sizing and surfaces, with a subtle shadow for transparent covers only.
- Backup before migration: `data/backups/2026-09-29T12-19-31.014Z`.

To apply this reviewed batch to another existing installation, run `npm run store:backup`, then `node --experimental-strip-types scripts/apply-product-cutouts.mjs`. Repeating it when these covers are already first changes nothing. This is a manual migration, not a startup override of future administrator edits.

Validation: all 15 files contain actual transparency (57–83% fully transparent pixels), are 1254 × 1254 pixels, and are preserved without recompression. Migration assertions verified other product data remained unchanged, and a second run applied zero changes. TypeScript, lint and production build passed.

Browser validation passed in Arabic/light/1440px, Arabic/dark/390px, English/light/390px and English/dark/1440px. All 15 PNG URLs returned HTTP 200. Catalog images loaded, original gallery navigation and transparent-cover zoom worked, with no horizontal overflow or browser errors. The initial test used an explicit role-attribute selector for a native dialog; correcting the test to use its accessible role resolved that test-only timeout. Reproduce with `node scripts/check-product-cutouts.mjs` against the local production server. Screenshots are in `docs/screenshots/cutouts-*.png`.

Next step: prepare the remaining 12 visible product covers, including faithful treatment of products currently shown only in packaging. No additional image generation or launch work is included in this integration step.

## Remaining batch — attempted 2026-09-29

Confirmed the configured WhatsApp recipient remains `201070332568` and the store remains in test mode. Inspected sources 022, 030, 035 and 039. Source 022 contains a carton and a small visible bottle; preserve both at their original relative scale. Source 030 permits isolating one front Sense bottle. Sources 035 and 039 show cartons only; preserve the actual cartons rather than inventing bottles.

The four built-in image edit calls all returned HTTP 429 `usage_limit_reached`; no output assets were produced and no product records or cover mappings changed. Do not retry the remaining images until the image allowance is available. CLI/API fallback requires explicit owner selection and `OPENAI_API_KEY`. The next step remains completing and reviewing these 12 covers, not deployment or another feature.
