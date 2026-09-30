# Asel Cosmetics — implementation plan

Use **Asel Cosmetics** and the supplied logo. The owner initially deferred products, then authorised adding supplied photos with temporary prices and implementing administration and orders. The owner selected cash on delivery and will provide official contact/domain details later.

## Design plan

- Palette: ivory #f8f5ee, paper #fffcf7, ink #30271f, muted #766957, antique gold #96733e, sage #626a51.
- Typography: Georgia editorial headings and a system sans-serif interface, keeping fonts local and rendering independent of external services.
- Layout: centered brand masthead; quiet horizontal navigation; asymmetric hero with left-aligned typography and an original decorative fragrance still life; generous category and note grids; darker editorial and scent-finder panels.
- Preserve the original logo file; render it through a transparent mask so its gold artwork fits both light and dark surfaces. Decorative CSS glass bottles are visual artwork, not catalog entries.
- Review against brief: warm luxury follows the supplied brand and brief; avoid generic promotional badges, invented reviews, shipping promises, or fake products. No copyrighted retailer imagery.

## Work sequence

1. Foundation: Next.js App Router, strict TypeScript, Tailwind, reusable tokens, typed empty catalog, config, locale-aware /en routes.
2. Homepage and shell: logo, navigation, search, mobile menu, hero, categories, notes, collection status, editorial, scent finder, footer.
3. Discovery: URL-driven filters/sorting/pagination, brands, product detail template, wishlist, search, fragrance quiz.
4. Commerce: validated persisted cart, drawer, variant and stock rules, cart totals, Egyptian checkout form. No live payments or orders until configured.
5. Polish: loading/empty/error states, metadata, sitemap, robots, keyboard behavior, responsive checks, unit/browser tests, lint, typecheck, production build.
6. Commerce implementation: import reviewed photos with editable temporary prices, persist the catalog in SQLite, add protected administration, transactional orders, cash on delivery, configurable shipping and backups.
7. External launch prerequisites: owner-approved prices/stock/policies, official contact details, hosting, domain and HTTPS. Electronic payments, accounts and newsletters remain optional future scope.

## Progress

- [x] Read project documents and inspect supplied logo.
- [x] Confirm name and defer real products.
- [x] Foundation and homepage.
- [x] Discovery and commerce templates.
- [x] Initial unit/browser validation, production build and catalog handoff.
- [x] Arabic/English translation, RTL layout, persistent light/dark appearance and transparent logo rendering.
- [x] Photo-based catalog: 27 visible products, two drafts and all 45 images in the library.
- [x] Protected product, media, order and settings management.
- [x] Saved COD orders, server-priced totals, transaction-protected stock and cancellation restocking.
- [x] Shipping/contact/policy settings, backup command, administration and deployment guides.

## Current result

The owner's latest checkout instruction replaces payment selection with a direct WhatsApp handoff after saving the order. See `docs/WHATSAPP-ORDERS.md`. The owner-confirmed recipient `201070332568` is configured and the generated order link verified. The store remains in test mode. This checkout change takes precedence over the earlier COD preference.

### Product photography follow-up requested by the owner

1. [x] Prepare and inspect the first 15 transparent product covers using built-in image editing.
2. [x] Integrate this ready batch into existing and fresh catalogs, retain original gallery photos, and verify storefront display. See `docs/PRODUCT-CUTOUTS.md`.
3. [ ] Process and review the remaining 11 older visible product covers. Keep carton-only products faithful to the supplied photography; request bottle photos where needed.
4. [x] Integrate the owner's additional JPG batch: 26 library images, 13 new visible products, six new drafts and one updated Bleu cover. See `docs/SUPPLIED-CATALOG.md`. This batch contains mostly different products and does not complete the remaining 11 covers.

This follow-up is performed one step at a time at the owner's request. External launch prerequisites remain pending.

Responsive Arabic/English storefront, search/filter routes, product galleries, favourites/cart, scent quiz, database-backed COD checkout and protected administration are implemented. The validation log records current test results. The storefront starts in explicit test mode; administrators approve product and business data before enabling actual sales.

The owner supplied 45 images while implementation was in progress. Originals remain untouched. The review inventory is in `docs/product-assets.html` and `docs/product-assets.json`; one group photograph is used as homepage artwork. Promotional prices and contact details in images are not treated as approved business settings.

Products are visible using the supplied photos and temporary prices. Test orders are saved without stock deductions or fulfilment; live orders deduct real stock atomically. External publication is pending hosting/domain details and owner approval of commercial data. No electronic payment provider or messaging service is connected.
