import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
await mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(15_000);
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["mobile", 390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("http://127.0.0.1:3000/en");
    await page.locator(".hero-photo").waitFor();
    await page
      .getByRole("button", { name: "Search fragrances", exact: true })
      .click();
    await page.getByRole("dialog", { name: "Find a fragrance" }).waitFor();
    await page.keyboard.press("Escape");
    await page.locator("img").evaluateAll((images) =>
      images.forEach((image) => {
        image.loading = "eager";
      }),
    );
    await page.waitForFunction(() => {
      const image = document.querySelector(".hero-photo");
      return image?.complete && image.naturalWidth > 0;
    });
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete),
    );
    await page.screenshot({
      path: `docs/screenshots/home-${name}.png`,
      fullPage: true,
      caret: "initial",
    });
    console.log(
      `${name}: ${await page.title()}, overflow=${await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)}`,
    );
  }
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto(pathToFileURL(path.resolve("docs/product-assets.html")).href);
  await page.locator("img").evaluateAll((images) =>
    images.forEach((image) => {
      image.loading = "eager";
    }),
  );
  await page.waitForFunction(() =>
    [...document.images].every((image) => image.complete),
  );
  await page.screenshot({
    path: "docs/screenshots/incoming-assets.png",
    fullPage: true,
  });
} finally {
  await browser.close();
}
