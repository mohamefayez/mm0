# Asel Cosmetics — validation

Validated on 29 September 2026 with Node.js 24.19.0 and installed Google Chrome.

- ESLint: passed, no warnings or errors.
- TypeScript / Next route types: passed.
- Production build: passed.
- Unit tests: 13 passed. Coverage includes catalog/search, cart/stock, recommendations, Egyptian phone validation, translations, authoritative order totals, duplicate/retried submissions, live stock deduction/cancellation, stale product/settings edits, rate limits and launch readiness.
- Browser coverage: 14 scenarios passed against production builds (`next start`), including focused reruns after corrections. Nine storefront/language scenarios cover search, filters, quizzes, navigation, language/theme persistence and missing products. Five commerce scenarios cover protected APIs, the complete COD test-order journey, administration edits, mobile/dark administration, and uploaded photos/new products/draft visibility.
- Browser tests use a separate SQLite database under `.local/e2e-data`; no test orders or fixture products are added to the owner's store.
- A test order was placed through the customer form, found in administration, confirmed and cancelled. Its temporary stock stayed unchanged. Live stock deduction and one-time cancellation restocking were tested in isolated database tests.
- Admin price/shipping changes persisted through reloads and appeared in the Arabic storefront. Unauthenticated access and cross-origin mutations were rejected. Invalid SVG uploads were rejected; a JPEG upload was served correctly and assigned to a new product.
- SQLite backup command completed successfully and included the store database; uploaded media is included when present.
- Language and theme persist through reloads and switching languages. Language switching preserves filters; the root URL respects the saved locale. The server response includes the selected document language, direction and theme before hydration.
- English/Arabic layouts checked at 320/390/768/1440px. Mobile preference controls and translated filter drawers work without horizontal overflow.
- Light/dark desktop and mobile screenshots reviewed at 1440px and 390px. The original logo appears without its paper rectangle; the gold artwork remains visible in both themes.

Current screenshots: `docs/screenshots/{en,ar}-{light,dark}-{desktop,mobile}.png`. Recreate them with `node scripts/check-appearance.mjs` while the local server is running. Set `PLAYWRIGHT_BASE_URL` to check another local port.

Commerce screenshots: `catalog-desktop.png`, `product-desktop.png`, `product-mobile-dark.png`, `admin-products-{320,390,1440}.png` and `admin-editor-mobile-dark.png` under `docs/screenshots/`.

The owner's database contains 27 visible products and two drafts, with the 45 supplied photographs available in the media library. Prices, stock, sizes and delivery rates still need owner review. The current mode is explicitly **test**: orders are persisted but not fulfilled or paid. The live COD path is implemented and gated by approved catalog and business settings. No electronic payment provider is connected.

No Lighthouse score or full WCAG certification is claimed. External hosting/domain/HTTPS, deployment smoke checks and approved business data remain launch work. Accounts and newsletters are not implemented and are not required for guest COD checkout.
