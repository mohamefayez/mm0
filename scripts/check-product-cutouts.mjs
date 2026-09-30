import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";

const origin = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
const manifest = JSON.parse(await readFile("docs/product-cutouts.json", "utf8"));
await mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const { src } of manifest) {
    const response = await page.request.get(origin + src);
    assert.equal(response.status(), 200, src);
    assert.match(response.headers()["content-type"], /image\/png/);
  }
  for (const [locale, theme, width] of [
    ["ar", "light", 1440], ["ar", "dark", 390],
    ["en", "light", 390], ["en", "dark", 1440],
  ]) {
    await page.context().addCookies([{ name: "asel-theme", value: theme, url: origin }]);
    await page.setViewportSize({ width, height: 950 });
    await page.goto(`${origin}/${locale}/perfumes`);
    const cutouts = page.locator(".product-card .product-image-cutout");
    await cutouts.first().waitFor();
    await page.locator("img").evaluateAll((images) => images.forEach((img) => { img.loading = "eager"; }));
    await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `docs/screenshots/cutouts-${locale}-${theme}-${width}.png` });
    await page.goto(`${origin}/${locale}/perfumes/libre`);
    const main = page.locator(".product-main-image img");
    await main.waitFor();
    assert.match(await main.getAttribute("src"), /libre-cutout/);
    await page.locator(".gallery-thumbs button").nth(1).click();
    await page.waitForFunction(() => document.querySelector(".product-main-image img")?.getAttribute("src")?.includes("asset-026"));
    await page.locator(".gallery-thumbs button").first().click();
    await page.locator(".zoom-button").click();
    await page.getByRole("dialog").locator("img").waitFor();
    assert.match(await page.getByRole("dialog").locator("img").getAttribute("src"), /libre-cutout/);
    await page.keyboard.press("Escape");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    console.log(`${locale}/${theme}/${width}: catalog, original gallery, cutout cover, zoom and overflow passed`);
  }
  assert.deepEqual(errors, []);
  console.log(`${manifest.length} PNG assets served successfully; no browser errors.`);
} finally {
  await browser.close();
}
