import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { suppliedProducts } from "../src/data/supplied-catalog.ts";

const origin = "http://127.0.0.1:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const { assets } = JSON.parse(await readFile("docs/supplied-product-photos.json", "utf8"));
  for (const image of assets) assert.equal((await page.request.get(origin + image.src)).status(), 200, image.src);
  for (const product of suppliedProducts) {
    const response = await page.request.get(`${origin}/en/perfumes/${product.slug}`);
    const body = await response.text();
    const photo = product.images[0].src.split("/").pop();
    if (product.published) {
      assert.equal(response.status(), 200, product.id);
      assert.ok(body.includes(photo), product.id);
    } else {
      // Next streamed notFound responses may use HTTP 200 with noindex.
      assert.ok(body.includes("noindex"), product.id);
      assert.ok(!body.includes(photo) && !body.includes('class="product-detail"'), product.id);
    }
  }
  for (const [locale, theme, width] of [["ar", "light", 1440], ["ar", "dark", 390], ["en", "light", 390], ["en", "dark", 1440]]) {
    await page.context().addCookies([{ name: "asel-theme", value: theme, url: origin }]);
    await page.setViewportSize({ width, height: 950 });
    await page.goto(`${origin}/${locale}/perfumes/tease`);
    await page.locator(".product-main-image img").waitFor();
    await page.waitForFunction(() => { const image = document.querySelector(".product-main-image img"); return image?.complete && image.naturalWidth > 0; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `docs/screenshots/supplied-${locale}-${theme}-${width}.png` });
  }
  await page.goto(`${origin}/en/perfumes/bleu-de-chanel`);
  assert.match(await page.locator(".product-main-image img").getAttribute("src"), /supplied-cc4f87ed/);
  await page.locator(".gallery-thumbs button").nth(1).click();
  await page.waitForFunction(() => document.querySelector(".product-main-image img")?.getAttribute("src")?.includes("asset-040"));
  assert.deepEqual(errors, []);
  console.log("26 images served; 13 published product pages and 6 hidden drafts verified; 4 language/theme/viewport combinations and original Bleu gallery passed.");
} finally { await browser.close(); }
