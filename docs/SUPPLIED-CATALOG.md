# Owner-supplied photo import — 2026-09-30

Imported all 26 new JPG files unchanged into `public/products/supplied-*.jpg`. Their original names, sizes, dimensions and SHA-256 hashes are recorded in `supplied-product-photos.json`. These are opaque JPEGs, mostly on light studio backgrounds; they are not transparent cutouts. No image generation or background processing was used.

The owner previously authorized temporary prices and inventory. Added 13 visible products with readable names and six drafts where the exact name, brand or version remains uncertain. Product definitions, Arabic names, photo mappings and temporary prices are in `src/data/supplied-catalog.ts`. Sizes, concentration and fragrance notes remain unconfirmed; no reviews or authenticity claims were invented.

Drafts: Scandal purple, Bahila, Si gold bottle, Narciso pink, Bahila burgundy, Narciso white. Group photos and alternate scene photographs remain in the media library instead of being represented as individual sale items.

Updated the existing generic Bleu de Chanel entry with the supplied studio photo. Original gallery photos remain accessible. Its exact edition still needs owner confirmation: the new photo says Parfum and the previous photo says L'Exclusif. The catalog concentration remains Unconfirmed.

Total catalog after this import: 40 visible products and eight drafts, including the two older unidentified bottles. WhatsApp remains `201070332568`; store mode remains test.

For an existing installation, run `npm run store:backup`, then `node --experimental-strip-types scripts/import-supplied-catalog.mjs`. The import requires test mode, adds only missing products/brands and does not overwrite existing owner edits on repeat runs. Fresh databases include the same data through the seed catalog.

Backup: `data/backups/2026-09-29T21-54-16.142Z`. Hash comparison verified all 26 copied images. Database comparison against that backup verified existing product fields, original galleries, orders and settings remained unchanged except the intentional Bleu cover/revision. A repeat import added zero products and changed zero covers. TypeScript and targeted lint passed.

Next: review uncertain product identities with the owner and supply or process covers for the 11 older visible products that still use scene photos. These new files do not contain matching replacements for those 11 products.

Browser verification passed: all 26 images served; all 13 new published pages rendered their corresponding image; six new drafts returned the not-found content with noindex and no product image. Next.js streaming can return HTTP 200 for not-found pages, so the test verifies non-disclosure rather than assuming a 404 response status. Four Arabic/English, light/dark, mobile/desktop combinations rendered without overflow or browser errors. The original Bleu gallery remains accessible. Production build passed. Reproduce with `node --experimental-strip-types scripts/check-supplied-catalog.mjs` while the local server is running. Screenshots: `docs/screenshots/supplied-*.png`.
