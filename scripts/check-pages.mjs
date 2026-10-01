import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const base = "http://127.0.0.1:3004/mm0";
    await page.goto(`${base}/en/`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.waitForFunction(() => document.querySelector(".signature-bottle")?.naturalWidth > 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.theme === "dark");
    await page.getByRole("button", { name: "التبديل إلى العربية" }).click();
    await page.waitForURL(/\/mm0\/ar\/$/);
    await page.waitForFunction(() => document.documentElement.dir === "rtl");
    await page.screenshot({ path: `.local/pages-${mobile ? "mobile" : "desktop"}.png` });
    await page.goto(`${base}/en/perfumes/?q=libre`);
    await page.waitForFunction(() => document.querySelectorAll(".product-card").length === 1);
    await page.goto(`${base}/en/perfumes/libre/`);
    await page.getByRole("button", { name: /Add to bag/i }).first().click();
    await page.goto(`${base}/en/checkout/`);
    await page.getByLabel("Name", { exact: true }).fill("Pages Test");
    await page.getByLabel("Phone", { exact: true }).fill("01012345678");
    await page.getByLabel("Governorate and address").fill("Cairo, test street 10");
    await page.route("https://wa.me/**", (route) => route.fulfill({ body: "WhatsApp test intercepted" }));
    await page.getByRole("button", { name: "Continue to WhatsApp" }).click();
    await page.waitForURL("https://wa.me/**");
    const target = new URL(page.url());
    assert.equal(target.pathname, "/201070332568");
    assert.match(target.searchParams.get("text"), /Pages Test/);
    assert.match(target.searchParams.get("text"), /Libre/);
    assert.deepEqual(errors, []);
    console.log(`Static navigation, images, search, preferences and WhatsApp passed: ${mobile ? "mobile" : "desktop"}`);
    await context.close();
  }
} finally { await browser.close(); }
