import { expect, test } from "@playwright/test";

test("language and theme persist across refresh, navigation and returning to the store", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/en/perfumes?gender=women&sort=price-asc");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "التبديل إلى العربية" }).click();
  await expect(page).toHaveURL(/\/ar\/perfumes\?gender=women&sort=price-asc/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(
    page.getByRole("complementary").getByLabel("لها", { exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("combobox", { name: "ترتيب العطور" }),
  ).toHaveValue("price-asc");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  // The server renders the preference, before hydration can change the page.
  const response = await page.request.get("/ar");
  expect(await response.text()).toMatch(
    /<html[^>]*lang="ar"[^>]*dir="rtl"[^>]*data-theme="dark"/,
  );
  await page.goto("/");
  await expect(page).toHaveURL(/\/ar$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "حضور يترك أثرًا لا يُنسى.",
  );
  await page.getByRole("button", { name: "التبديل إلى الوضع الفاتح" }).click();
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
  expect(errors).toEqual([]);
});

test("Arabic search and the full fragrance quiz use translated controls", async ({
  page,
}) => {
  await page.goto("/ar");
  await page.getByRole("button", { name: "البحث عن عطر", exact: true }).click();
  const search = page.getByRole("dialog", { name: "ابحث عن عطر", exact: true });
  await search.getByRole("searchbox").fill("عطرغيرموجودللاختبار");
  await search.getByRole("button", { name: "تنفيذ البحث" }).click();
  await expect(page).toHaveURL(/\/ar\/search\?q=/);
  expect(new URL(page.url()).searchParams.get("q")).toBe("عطرغيرموجودللاختبار");
  await expect(
    page.getByRole("heading", { name: "لنجرب اختيارًا آخر؟" }),
  ).toBeVisible();
  await page.goto("/ar/discover");
  for (const [index, name] of [
    "كل الاختيارات",
    "أخشاب دافئة",
    "الخروج مساءً",
    "حضور واضح وقوي",
    "حتى ٥٬٠٠٠ جنيه",
  ].entries()) {
    await page.getByRole("radio", { name, exact: true }).check();
    await page
      .getByRole("button", {
        name: index === 4 ? "اكتشف ذوقي" : "التالي",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "عمق هادئ وشخصية دافئة." }),
  ).toBeVisible();
  await expect(
    page.getByText("لا يوجد حاليًا عطر يطابق تفضيلاتك.", { exact: false }),
  ).toBeVisible();
});

test("Arabic mobile preferences, menu and filters fit narrow screens in both themes", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/ar");
    for (const theme of ["dark", "light"]) {
      await page.locator(".theme-toggle").click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(
        page.getByRole("button", { name: "Switch to English" }),
      ).toBeInViewport();
    }
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.getByRole("button", { name: "فتح القائمة" }).click();
  await page
    .getByRole("navigation", { name: "قائمة الهاتف" })
    .getByRole("link", { name: "العطور", exact: true })
    .click();
  await page.getByRole("button", { name: "الفلاتر", exact: true }).click();
  await page
    .getByRole("dialog", { name: "تصفية العطور" })
    .getByLabel("له", { exact: true })
    .check();
  await expect(page).toHaveURL(/gender=men/);
  await page.getByRole("button", { name: /^عرض \d+ عطر$/ }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("Arabic information routes and unavailable products retain the language", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const path of [
    "brands",
    "notes",
    "wishlist",
    "cart",
    "checkout",
    "about",
    "contact",
    "shipping",
    "privacy",
    "terms",
    "account",
  ]) {
    const response = await page.goto(`/ar/${path}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /[\u0600-\u06ff]/,
    );
    expect(await page.title()).toMatch(/[\u0600-\u06ff]/);
  }
  await page.goto("/ar/perfumes/not-a-product");
  await expect(
    page.getByRole("heading", { name: "هذه الصفحة غير موجودة." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "العودة إلى أسيل" }),
  ).toHaveAttribute("href", "/ar");
});
