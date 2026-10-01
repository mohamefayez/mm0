# GitHub Pages preview

Build: `npm run build:pages`. This copies the storefront into a fresh private staging directory, swaps only the server-dependent adapters, and exports HTML/CSS/JavaScript into `pages-out`. The original Node/SQLite store and administration remain available through the normal build.

The preview supports Arabic/English, RTL, dark/light preference, product pages, galleries, search, filtering, favourites, cart and a WhatsApp enquiry form. It does not save orders, reserve stock or accept payments. Prices and availability are provisional; final delivery and price are confirmed with the owner. Customer form fields remain in memory until explicitly handed to WhatsApp.

GitHub workflow: `.github/workflows/pages.yml`. It uses Node 24, builds the static export and uploads a Pages artifact. If the repository requires initial manual enablement, set Settings → Pages → Source to GitHub Actions, then rerun the workflow. Publishing source is separate from the connected app's code-write permissions.

Default project path is `/mm0`; change `PAGES_BASE_PATH` in the workflow if the repository name changes. Product/brand images and language changes preserve that prefix. Static pages contain only published seed products; drafts are not generated.

Prices: edit the seed/supplied catalog source and push to GitHub. Administration edits in a separate Node installation are not synchronized to this preview.

Local browser check: run `node scripts/preview-pages.mjs`, then `node scripts/check-pages.mjs`. WhatsApp navigation is intercepted during this test; no messages are sent.
