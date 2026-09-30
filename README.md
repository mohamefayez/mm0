# Asel Cosmetics

Arabic/English fragrance store for Egypt, with light/dark themes, scroll-linked animation, a SQLite catalog, protected administration and orders handed off to the owner's WhatsApp.

## Local setup

Requires Node.js 24.19+ and npm. Use `npm.cmd` in Windows PowerShell if script execution policy blocks `npm`.

```sh
npm ci
npm run store:setup
npm run build
npm run start
```

- Store: http://127.0.0.1:3000/ar (or `/en`).
- Administration: http://127.0.0.1:3000/ar/admin.
- The setup command generates the private initial password in `.local/admin-access.txt`. Change it in administration settings after signing in. There is no default production password.
- `npm run dev` starts development mode. Product/settings edits in administration persist immediately and do not require rebuilding.

## What is included

- 40 visible products and eight drafts, with original photos, 15 transparent covers and 26 additional supplied photos. Source photographs are preserved.
- Editable temporary prices and stock. Unconfirmed sizes/notes remain visibly unconfirmed; no fabricated customer reviews or sales rankings.
- Products, brands, size variants, prices, stock, Arabic/English descriptions, cover/gallery selection and image uploads.
- Search, filters, product detail, favourites, cart and fragrance discovery.
- Persistent orders with server-validated totals, governorate shipping rates and a direct WhatsApp handoff to `201070332568` after saving.
- Idempotent order submission; live stock deductions and cancellation restocking in SQLite transactions.
- Protected product/order/settings APIs, hashed admin passwords, expiring server-side sessions, same-origin mutation checks and request limits.
- Contact details and editable shipping, returns, privacy and purchase terms.
- A private backup command: `npm run store:backup`.

## Store modes

The store initially runs in **test mode**: prices, stock and delivery rates are placeholders. Test orders are saved and can be managed, but do not reserve live stock or require delivery/payment.

**Paused** disables new orders. **Live** requires approved published products and completed contact, address, shipping and policy settings. Product approval requires a real size, positive price and confirmed concentration. Review the actual product identity and available stock before approving it.

There is no payment selection or payment gateway. The customer sends the prepared order message in WhatsApp; settlement is arranged with the owner. Historical cash-on-delivery orders remain supported. Accounts are not required to order.

Prices, stock and photos can be changed through `/ar/admin` without a rebuild or GitHub upload. These edits live in the hosting database, so the host must keep its data directory between deployments.

## GitHub and hosting

GitHub stores the source code. GitHub Pages cannot run this application's Node server, administration or SQLite orders. See [publication instructions](docs/GITHUB-PUBLISH.md) for the prepared source package and Docker/Node deployment. Keep test mode enabled while prices and business details are unfinished.

## Data and deployment

`data/asel.sqlite` stores products, orders, settings and administration credentials. Uploaded photos are in `data/uploads/`. Set `ASEL_DATA_DIR` to an absolute persistent directory on the hosting server. Never put these files under `public/` or commit them. `.local/`, database files, backups and uploaded files are ignored by Git.

This application requires a persistent Node server; it is not a static export or a stateless/serverless SQLite deployment. Public hosting, domain, HTTPS and real business details still need the owner's configuration. Search indexing remains disabled pending launch.

See [the Arabic admin guide](docs/ADMIN-GUIDE.md), [catalog handoff](docs/CATALOG-HANDOFF.md), [deployment guide](docs/DEPLOYMENT.md) and [validation notes](docs/VALIDATION.md).

## Validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Browser tests require installed Google Chrome and a production build. They start an isolated production server on port 3002 with `.local/e2e-data`, separate from the real store. The test-only password exists only in that fixture database. Do not point commerce tests at your real store server.

## Main files

| Path | Purpose |
| --- | --- |
| `src/data/seed-catalog.ts` | Initial photo/product mapping and temporary catalog |
| `src/lib/commerce-store.ts` | SQLite storage, order transactions and inventory |
| `src/lib/commerce-schema.ts` | Product/settings/order validation and delivery calculation |
| `src/lib/admin-auth.ts` | Password verification and admin sessions |
| `src/app/api` | Protected administration and public order endpoints |
| `src/components/admin` | Management interface |
| `src/components/checkout-form.tsx` | Customer checkout and confirmation |
| `src/data/ar.ts` | Storefront Arabic copy |
| `scripts/setup-store.mjs` | Copy source images and initialise the local store |
| `scripts/backup-store.mjs` | Consistent SQLite backup plus uploaded media |

The original AURÉA documents are references. Current owner instructions and **Asel Cosmetics** branding supersede their seeded-catalog and naming assumptions.
