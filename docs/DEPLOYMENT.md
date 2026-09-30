# Deploying Asel Cosmetics

The current local application saves orders and opens the owner's WhatsApp chat. It has not been published to an external host. The owner will supply the domain, hosting and official contact details later. GitHub publication is separate from running a hosted store.

## Runtime

Use a Node.js 24.19+ server with a persistent local disk and one application instance. `node:sqlite` stores the catalog, settings, orders, sessions and admin password hash. The database uses WAL and write transactions. Keep SQLite and its WAL/SHM files on the same local disk; do not run the live database in OneDrive, a shared network drive, or an ephemeral serverless filesystem. For multiple application instances, replace the storage adapter with a shared database before scaling.

The development copy remains in the owner's existing workspace. For production, place the writable data directory outside the release/build directory.

## Provisioning sequence

1. Copy the project to a private application directory on the host. Do not include `.local/`, `data/`, local environment files, test results or local admin credentials in a public repository or web directory.
2. Install dependencies with `npm ci`, then build with `npm run build`.
3. Set `ASEL_DATA_DIR` to the absolute persistent data directory. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin before building, and `ASEL_PUBLIC_ORIGIN` to the same HTTPS origin at runtime.
4. For a new store, run `npm run store:setup` with that same data-directory environment. This creates a fresh random admin password in the host's private `.local/admin-access.txt`. Existing data and administrator are preserved on subsequent setup runs. To migrate the local catalog instead, restore its backup as described below and skip generating a second catalog.
5. Start with `npm run start`. Put an HTTPS reverse proxy in front of `127.0.0.1:3000`, forwarding the original host. The `ASEL_PUBLIC_ORIGIN` value makes same-origin checks and secure admin cookies work behind TLS termination. Do not expose the internal Node port directly.
6. Sign in to the hosted administrator, change the initial password, and verify photos, product edits, login/logout, shipping totals and an actual test-mode checkout on the deployed origin.
7. Supply and approve real product data, contact details and policies. Enable live mode only after that review. Keep search indexing disabled until public launch; then update `src/app/robots.ts` and root metadata deliberately.

The example systemd unit is in `deploy/asel.service.example`. Replace the directory, service account and origin placeholders with the real host configuration before installing it. It is a template, not an installed service. No hosting account or domain changes have been made.

## Backups and restore

Run `npm run store:backup` with the same `ASEL_DATA_DIR` as the application. The backup command uses SQLite's backup API, then copies uploaded media. Keep backups outside the web root and copy them to separate protected storage. Automate a daily schedule on the chosen host and retain an appropriate history.

To restore: stop the application; save the current data directory as a rollback copy; put the backup `asel.sqlite` and its `uploads/` directory in a fresh persistent directory; point `ASEL_DATA_DIR` there; invalidate restored sessions with `DELETE FROM sessions` using a private SQLite administration tool; restart and verify products, media and orders. Never copy an active WAL-mode database file by itself as a backup.

## Operational limits

- Checkout opens WhatsApp after saving the order; no payment gateway is connected. No payment processing keys or card data are stored.
- No automatic email, SMS, WhatsApp or courier dispatch is configured. The administrator follows up on saved orders.
- Administration displays the latest 500 orders. A larger order history requires pagination/reporting work.
- Initial product descriptions and prices require owner approval. Group photographs do not prove product authenticity or stock availability.
- Credentials, data backups and `.local/admin-access.txt` must remain private. Database-backed rate limits supplement, but do not replace, host-level traffic controls.

Implementation references: [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting) and [Node.js SQLite](https://nodejs.org/api/sqlite.html).
