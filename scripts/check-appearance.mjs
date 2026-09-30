import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
await mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  page.on("pageerror", (error) => console.error(error.message));
  for (const locale of ["en", "ar"]) {
    for (const theme of ["light", "dark"]) {
      await page
        .context()
        .addCookies([{ name: "asel-theme", value: theme, url: baseURL }]);
      for (const [device, width, height] of [
        ["desktop", 1440, 1000],
        ["mobile", 390, 844],
      ]) {
        await page.setViewportSize({ width, height });
        await page.goto(`${baseURL}/${locale}`);
        await page.locator(".hero-photo").waitFor();
        await page.locator(".theme-toggle").click();
        await page.locator(".theme-toggle").click();
        await page.locator("img").evaluateAll((images) =>
          images.forEach((img) => {
            img.loading = "eager";
          }),
        );
        await page.waitForFunction(() =>
          [...document.images].every(
            (img) => img.complete && img.naturalWidth > 0,
          ),
        );
        await page.locator(".hero-photo").evaluate((img) => img.decode());
        await page.screenshot({
          path: `docs/screenshots/${locale}-${theme}-${device}.png`,
        });
        console.log(
          `${locale}/${theme}/${device}: overflow=${await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)}`,
        );
      }
    }
  }
} finally {
  await browser.close();
}
