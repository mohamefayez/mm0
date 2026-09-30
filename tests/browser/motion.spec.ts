import { expect, test } from "@playwright/test";

for (const locale of ["en", "ar"]) {
  for (const mobile of [false, true]) {
    test(`fragrance scene scrolls naturally: ${locale}, ${mobile ? "mobile" : "desktop"}`, async ({ page }) => {
      await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`/${locale}`);
      const bottle = page.locator(".signature-bottle");
      await expect(bottle).toBeVisible();
      await expect.poll(() => bottle.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      await expect.poll(() => page.locator(".signature-scene").evaluate((element) => element.style.getPropertyValue("--scene-shift"))).toBe("0px");
      const halo = page.locator(".signature-halo");
      await expect(halo).toHaveCSS("animation-play-state", "running");
      const initialRotation = await halo.evaluate((element) => getComputedStyle(element).rotate);
      await expect.poll(() => halo.evaluate((element) => getComputedStyle(element).rotate)).not.toBe(initialRotation);
      // Even a small first scroll must visibly affect the perfume, before the hero reaches the viewport top.
      await page.mouse.wheel(0, 70);
      await expect.poll(() => page.locator(".signature-scene").evaluate((element) => parseFloat(element.style.getPropertyValue("--scene-shift")))).toBeGreaterThan(0);
      await page.screenshot({ path: `.local/motion-${locale}-${mobile ? "mobile" : "desktop"}.png` });
      await page.mouse.wheel(0, 650);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
      await expect.poll(() => page.locator(".signature-scene").evaluate((element) => parseFloat(element.style.getPropertyValue("--scene-shift")))).toBeGreaterThan(0);
      await page.locator(".category-card").first().scrollIntoViewIfNeeded();
      const card = page.locator(".product-card").first();
      await expect(card).toHaveClass(/scroll-reveal/);
      const cardTop = await card.evaluate((element) => {
        const shift = parseFloat(getComputedStyle(element).getPropertyValue("--reveal-y")) || 0;
        return element.getBoundingClientRect().top + scrollY - shift;
      });
      await page.evaluate((top) => window.scrollTo({ top: top - innerHeight * .82, behavior: "instant" }), cardTop);
      await expect.poll(() => card.evaluate((element) => parseFloat(getComputedStyle(element).opacity))).toBeLessThan(.6);
      const before = await card.evaluate((element) => getComputedStyle(element).translate);
      await page.mouse.wheel(0, 240);
      await expect.poll(() => card.evaluate((element) => parseFloat(getComputedStyle(element).opacity))).toBeGreaterThan(.8);
      expect(await card.evaluate((element) => getComputedStyle(element).translate)).not.toBe(before);
      // Returning upwards reverses the effect; this is tied to scroll, not a timed entrance.
      await page.evaluate((top) => window.scrollTo({ top: top - innerHeight * .82, behavior: "instant" }), cardTop);
      await expect.poll(() => card.evaluate((element) => parseFloat(getComputedStyle(element).opacity))).toBeLessThan(.6);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(bottle).toHaveCSS("transform", "none");
      await expect(halo).toHaveCSS("animation-name", "none");
      await expect(page.locator(".scroll-reveal")).toHaveCount(0);
      await expect(card).toHaveCSS("opacity", "1");
      await page.locator("html").evaluate((element) => element.setAttribute("data-theme", "dark"));
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: `.local/motion-${locale}-${mobile ? "mobile" : "desktop"}-dark.png` });
      expect(errors).toEqual([]);
    });
  }
}
