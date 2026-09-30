import { test, expect } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";

test("admin data and mutations require authentication and a same-origin request", async ({
  request,
  baseURL,
}) => {
  expect((await request.get("/api/admin/data")).status()).toBe(401);
  expect(
    (
      await request.post("/api/admin/data", {
        headers: { Origin: baseURL! },
        data: { resource: "settings", data: {} },
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.post("/api/admin/session", {
        headers: { Origin: "https://outside.example" },
        data: { password: "irrelevant" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/orders", {
        headers: { Origin: baseURL! },
        data: { items: [] },
      })
    ).status(),
  ).toBe(400);
});

test("customer can open a WhatsApp order and find it in protected administration", async ({
  page,
  baseURL,
}) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/en/perfumes/libre");
  await expect(
    page.getByRole("heading", { name: "Libre", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".product-main-image img")).toBeVisible();
  await page.getByRole("button", { name: "Buy now", exact: true }).click();
  await expect(page).toHaveURL(/\/checkout/);
  for (const [id, value] of Object.entries({
    name: "Browser Test Customer",
    phone: "01012345678",
    email: "browser-test@example.com",
    city: "Test City",
    street: "Test Street",
    building: "1",
  }))
    await page.locator(`#checkout-${id}`).fill(value);
  await page.locator("#checkout-governorate").selectOption("Cairo");
  await page.getByRole("button", { name: "Review details" }).click();
  await expect(page.locator('input[name="payment"]')).toHaveCount(0);
  let whatsappUrl = "";
  await page.route("https://wa.me/**", async (route) => {
    whatsappUrl = route.request().url();
    await route.fulfill({ contentType: "text/html", body: "<p>WhatsApp handoff intercepted</p>" });
  });
  await page
    .getByRole("button", { name: "Continue to WhatsApp", exact: true })
    .click();
  await expect.poll(() => whatsappUrl).toContain("https://wa.me/201000000000?text=");
  await expect(page.getByText("WhatsApp handoff intercepted")).toBeVisible();
  expect(decodeURIComponent(whatsappUrl)).toContain("Browser Test Customer");
  expect(decodeURIComponent(whatsappUrl)).toContain("Libre");
  const reference = decodeURIComponent(whatsappUrl).match(/ASL-\d{8}-[A-F0-9]{10}/)![0];
  await page.goto("/en/admin");
  await page
    .getByLabel("Admin password", { exact: true })
    .fill("Asel-Browser-Test-Only!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Store management" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Orders", exact: true }).click();
  await page.getByRole("button", { name: new RegExp(reference) }).click();
  const dialog = page.getByRole("dialog", { name: "Order details" });
  await expect(
    dialog.getByText("Browser Test Customer", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByText("Test order. No fulfilment or payment required."),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "confirmed", exact: true }).click();
  await expect(
    dialog.getByText("Status: confirmed", { exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "cancelled", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  const data = await (await page.request.get("/api/admin/data")).json();
  expect(
    data.orders.find((o: { id: string }) => o.id === reference).status,
  ).toBe("cancelled");
  expect(
    data.products.find((p: { id: string }) => p.id === "libre").sizes[0].stock,
  ).toBe(10);
  const csrf = await page.request.post("/api/admin/data", {
    headers: { Origin: "https://outside.example" },
    data: { resource: "settings", data: data.settings },
  });
  expect(csrf.status()).toBe(403);
  const invalidImage = await page.request.post("/api/admin/upload", {
    headers: { Origin: baseURL! },
    multipart: {
      file: {
        name: "script.svg",
        mimeType: "image/svg+xml",
        buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
      },
    },
  });
  expect(invalidImage.status()).toBe(400);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  expect((await page.request.get("/api/admin/data")).status()).toBe(401);
  expect(errors).toEqual([]);
});

test("product and shipping edits survive reload and appear in the Arabic storefront", async ({
  page,
  baseURL,
}) => {
  await page.goto("/ar/admin");
  await page
    .getByLabel("كلمة مرور الإدارة", { exact: true })
    .fill("Asel-Browser-Test-Only!");
  await page.getByRole("button", { name: "دخول", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "إدارة المتجر" }),
  ).toBeVisible();
  const initial = await (await page.request.get("/api/admin/data")).json();
  const old = initial.products.find((p: { id: string }) => p.id === "libre");
  await page.getByRole("button", { name: /ليبر Yves Saint Laurent/ }).click();
  const dialog = page.getByRole("dialog", { name: "بيانات المنتج" });
  await dialog.getByLabel("السعر بالجنيه", { exact: true }).fill("775");
  await dialog.getByRole("button", { name: "حفظ المنتج" }).click();
  await expect(dialog).not.toBeVisible();
  await page.reload();
  await page.goto("/ar/perfumes/libre");
  await expect(page.locator(".product-price")).toContainText("٧٧٥");
  const current = await (await page.request.get("/api/admin/data")).json();
  const stale = await page.request.post("/api/admin/data", {
    headers: { Origin: baseURL! },
    data: { resource: "product", data: old },
  });
  expect(stale.status()).toBe(409);
  await page.request.post("/api/admin/data", {
    headers: { Origin: baseURL! },
    data: {
      resource: "product",
      data: {
        ...old,
        revision: current.products.find((p: { id: string }) => p.id === "libre")
          .revision,
      },
    },
  });
  await page.goto("/ar/admin");
  await page.getByRole("button", { name: "الإعدادات", exact: true }).click();
  await page.getByLabel("رسوم الشحن القاهرة", { exact: true }).fill("70");
  await page
    .getByRole("button", { name: "حفظ الإعدادات", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("تم الحفظ");
  await page.goto("/ar/shipping");
  await expect(
    page.locator(".summary-row").filter({ hasText: "القاهرة" }),
  ).toContainText("٧٠");
  const after = await (await page.request.get("/api/admin/data")).json();
  await page.request.post("/api/admin/data", {
    headers: { Origin: baseURL! },
    data: {
      resource: "settings",
      data: { ...initial.settings, revision: after.settings.revision },
    },
  });
});

test("administration fits mobile screens, edits photos and respects dark mode", async ({ page }) => {
  await mkdir("docs/screenshots", { recursive: true });
  await page.goto("/ar/admin");
  await page.getByLabel("كلمة مرور الإدارة", { exact: true }).fill("Asel-Browser-Test-Only!");
  await page.getByRole("button", { name: "دخول", exact: true }).click();
  await expect(page.locator(".admin-product-row").first()).toBeVisible();
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `docs/screenshots/admin-products-${width}.png` });
  }
  await page.getByRole("button", { name: "الإعدادات", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "وضع المتجر", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "المنتجات", exact: true }).click();
  await page.locator(".theme-toggle").click();
  await page.locator(".admin-product-row").first().click();
  const editor=page.getByRole("dialog", { name: "بيانات المنتج" });
  await editor.getByRole("button", { name: "اختيار من المكتبة" }).click();
  await expect(editor.locator(".admin-photo-picker img").first()).toBeVisible();
  expect(await editor.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.screenshot({ path: "docs/screenshots/admin-editor-mobile-dark.png" });
});

test("uploaded photos can be assigned to a new product while drafts stay private", async ({ request, page, baseURL }) => {
  const headers={Origin:baseURL!};
  expect((await request.post("/api/admin/session", {headers,data:{password:"Asel-Browser-Test-Only!"}})).status()).toBe(200);
  const uploaded=await request.post("/api/admin/upload", {headers,multipart:{file:{name:"product.jpeg",mimeType:"image/jpeg",buffer:await readFile("public/products/asset-006.jpeg")}}});
  expect(uploaded.status()).toBe(200);
  const {src}=await uploaded.json();
  const image=await request.get(src);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toBe("image/jpeg");
  const data=await (await request.get("/api/admin/data")).json();
  const source=data.products.find((p:{id:string})=>p.id==="libre");
  const id=`browser-fixture-${Date.now()}`;
  const product={...source,id,slug:id,name:"Browser fixture fragrance",revision:0,published:false,images:[{src,alt:"Test product"}]};
  const saved=await request.post("/api/admin/data", {headers,data:{resource:"product",data:product}});
  expect(saved.status()).toBe(200);
  await page.goto(`/en/perfumes/${id}`);
  await expect(page.getByRole("heading",{name:"This scent trail ends here."})).toBeVisible();
  const {product:created}=await saved.json();
  expect((await request.post("/api/admin/data",{headers,data:{resource:"product",data:{...created,published:true}}})).status()).toBe(200);
  await page.goto(`/en/perfumes/${id}`);
  await expect(page.getByRole("heading",{name:"Browser fixture fragrance",exact:true})).toBeVisible();
  expect((await request.get("/api/admin/data")).status()).toBe(200);
});
