import { expect, test } from "@playwright/test";

test("home, navigation, search dialog and empty cart work without browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/en");
  await expect(
    page.getByRole("heading", { name: "The art of feeling unforgettable." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Search fragrances", exact: true })
    .click();
  const search = page.getByRole("dialog", { name: "Find a fragrance" });
  await expect(search).toBeVisible();
  await search.getByRole("searchbox").fill("no-matching-fragrance-xyz");
  await search.getByRole("button", { name: "Submit search" }).click();
  await expect(page).toHaveURL(/\/en\/search\?q=no-matching-fragrance-xyz/);
  await expect(
    page.getByRole("heading", { name: "A different direction, perhaps?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Shopping bag, 0 items" }).click();
  await expect(
    page.getByRole("dialog", { name: "Your shopping bag" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Your shopping bag" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Shopping bag, 0 items" }),
  ).toBeFocused();
  expect(errors).toEqual([]);
});

test("filters survive refresh and clear correctly", async ({ page }) => {
  await page.goto("/en/perfumes");
  await page
    .getByRole("complementary", { name: "Filter fragrances" })
    .getByLabel("For her", { exact: true })
    .check();
  await expect(page).toHaveURL(/gender=women/);
  await page
    .getByRole("combobox", { name: "Sort fragrances" })
    .selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);
  await page.reload();
  await expect(
    page
      .getByRole("complementary", { name: "Filter fragrances" })
      .getByLabel("For her", { exact: true }),
  ).toBeChecked();
  await page
    .getByRole("button", { name: "Remove gender: women filter" })
    .click();
  await expect(page).not.toHaveURL(/gender=/);
});

test("scent quiz finishes with honest recommendations for the empty catalog", async ({
  page,
}) => {
  await page.goto("/en/discover");
  for (const name of [
    "Keep it open",
    "Warm woods",
    "Evenings out",
    "A lasting impression",
    "Up to 5,000 EGP",
  ]) {
    await page.getByRole("radio", { name, exact: true }).check();
    await page
      .getByRole("button", {
        name: name === "Up to 5,000 EGP" ? "Discover my profile" : "Next",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Quiet depth. Warm character." }),
  ).toBeVisible();
  await expect(
    page.getByText("We don’t have a fragrance matching your preferences", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start again" }).click();
  await expect(
    page.getByRole("heading", { name: "Who is the fragrance for?" }),
  ).toBeVisible();
});

test("mobile navigation, filters, and layout fit small screens", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Perfumes", exact: true })
    .click();
  await expect(page).toHaveURL(/\/en\/perfumes/);
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Filter fragrances" })
    .getByLabel("For him", { exact: true })
    .check();
  await expect(page).toHaveURL(/gender=men/);
  await page.getByRole("button", { name: /^Show \d+ fragrances$/ }).click();
  await expect(
    page.getByRole("dialog", { name: "Filter fragrances" }),
  ).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("all published navigation targets load and missing products show a branded 404", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const path of [
    "/en/brands",
    "/en/notes",
    "/en/wishlist",
    "/en/cart",
    "/en/checkout",
    "/en/about",
    "/en/contact",
    "/en/shipping",
    "/en/privacy",
    "/en/terms",
    "/en/account",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  const response = await page.goto("/en/perfumes/not-a-product");
  // Next.js may already have streamed the layout (HTTP 200) before notFound().
  expect([200, 404]).toContain(response?.status());
  await expect(
    page.getByRole("heading", { name: "This scent trail ends here." }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
    "content",
    /noindex/,
  );
});
