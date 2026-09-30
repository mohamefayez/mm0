import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { CommerceStore, CommerceError } from "../src/lib/commerce-store.ts";
import type { OrderInput } from "../src/lib/commerce-schema.ts";
function request(overrides: Partial<OrderInput> = {}): OrderInput {
  return {
    customer: {
      name: "Test Shopper",
      phone: "01012345678",
      email: "test@example.com",
      governorate: "Cairo",
      city: "Test City",
      street: "Test Street",
      building: "1",
      floor: "",
      apartment: "",
      notes: "Test order",
    },
    items: [{ productId: "libre", sizeId: "standard", quantity: 1 }],
    payment: "cod",
    expectedTotal: 815,
    expectedMode: "test",
    idempotencyKey: randomUUID(),
    ...overrides,
  };
}
function rejects(code: string) {
  return (error: unknown) =>
    error instanceof CommerceError && error.code === code;
}
test("WhatsApp handoff requires configuration, uses saved totals, and retries without duplicate orders", () => {
  const store = new CommerceStore(":memory:");
  try {
    const input = request({ payment: "whatsapp" });
    assert.throws(() => store.createOrder(input), rejects("WHATSAPP_UNAVAILABLE"));
    assert.equal(store.orders().length, 0);
    store.saveSettings({ ...store.settings(), whatsapp: "201000000000", codEnabled: false });
    const result = store.createOrder(input);
    const url = new URL(result.whatsappUrl!);
    assert.equal(url.origin + url.pathname, "https://wa.me/201000000000");
    const text = url.searchParams.get("text")!;
    for (const expected of ["Libre", "750.00 EGP", "65.00 EGP", "815.00 EGP", "Test Shopper", "Test Street", "TEST ORDER", result.id])
      assert.ok(text.includes(expected), expected);
    assert.deepEqual(store.createOrder(input), result);
    assert.equal(store.orders().length, 1);
    assert.equal(store.orders()[0].payment, "whatsapp");
    assert.equal(store.product("libre")!.sizes[0].stock, 10);
    assert.throws(() => store.createOrder(request({ payment: "whatsapp", expectedTotal: 1 })), rejects("PRICE_CHANGED"));
    store.saveSettings({ ...store.settings(), mode: "paused" });
    assert.throws(() => store.createOrder(request({ payment: "whatsapp" })), rejects("ORDERING_PAUSED"));
  } finally { store.db.close(); }
});
test("orders use authoritative prices, reject stale quantities and duplicate lines", () => {
  const store = new CommerceStore(":memory:");
  try {
    assert.throws(
      () => store.createOrder(request({ expectedTotal: 1 })),
      rejects("PRICE_CHANGED"),
    );
    assert.throws(
      () =>
        store.createOrder(
          request({
            items: [{ productId: "libre", sizeId: "standard", quantity: 11 }],
          }),
        ),
      rejects("STOCK_CHANGED"),
    );
    assert.throws(
      () =>
        store.createOrder(
          request({ items: [...request().items, ...request().items] }),
        ),
      rejects("DUPLICATE_ITEM"),
    );
    assert.equal(store.orders().length, 0);
  } finally {
    store.db.close();
  }
});
test("retries return the same order while different content cannot reuse its key", () => {
  const store = new CommerceStore(":memory:");
  try {
    const input = request();
    const first = store.createOrder(input);
    assert.deepEqual(store.createOrder(input), first);
    assert.equal(store.orders().length, 1);
    assert.throws(
      () =>
        store.createOrder({
          ...input,
          customer: { ...input.customer, name: "Another Shopper" },
        }),
      rejects("IDEMPOTENCY_CONFLICT"),
    );
    assert.equal(store.product("libre")!.sizes[0].stock, 10);
  } finally {
    store.db.close();
  }
});
test("live launch requires approved data and live inventory is restored only once on cancellation", () => {
  const store = new CommerceStore(":memory:");
  try {
    assert.throws(
      () => store.saveSettings({ ...store.settings(), mode: "live" }),
      rejects("LAUNCH_SETTINGS_INCOMPLETE"),
    );
    for (const p of store.products(true)) {
      p.published = p.id === "libre";
      if (p.published) {
        p.approved = true;
        p.concentration = "EDP";
        p.sizes[0].ml = 100;
        p.sizes[0].label = "100 ml";
      }
      store.saveProduct(p);
    }
    store.saveSettings({
      ...store.settings(),
      mode: "live",
      businessConfirmed: true,
      phone: "01012345678",
      address: "Test business",
      whatsapp: "201000000000",
      shippingTextAr: "Test shipping",
      returnsTextAr: "Test returns",
      privacyTextAr: "Test privacy",
      termsTextAr: "Test terms",
    });
    const old = store.product("libre")!;
    const placed = store.createOrder(request({ expectedMode: "live" }));
    assert.equal(placed.test, false);
    assert.equal(store.product("libre")!.sizes[0].stock, 9);
    assert.throws(() => store.saveProduct(old), rejects("STALE_PRODUCT"));
    store.updateOrder(placed.id, "cancelled", "new");
    assert.equal(store.product("libre")!.sizes[0].stock, 10);
    assert.throws(
      () => store.updateOrder(placed.id, "cancelled", "cancelled"),
      rejects("INVALID_STATUS"),
    );
    assert.equal(store.product("libre")!.sizes[0].stock, 10);
  } finally {
    store.db.close();
  }
});
test("shipping restrictions, changed store mode and settings revision are enforced", () => {
  const store = new CommerceStore(":memory:");
  try {
    const settings = store.settings();
    store.saveSettings({
      ...settings,
      shippingRates: settings.shippingRates.map((r) => ({
        ...r,
        enabled: r.governorate !== "Cairo",
      })),
    });
    assert.throws(
      () => store.createOrder(request()),
      rejects("UNSUPPORTED_DELIVERY"),
    );
    assert.throws(
      () => store.saveSettings(settings),
      rejects("STALE_SETTINGS"),
    );
    store.saveSettings({ ...store.settings(), mode: "paused" });
    assert.throws(
      () => store.createOrder(request()),
      rejects("ORDERING_PAUSED"),
    );
  } finally {
    store.db.close();
  }
});
test("last units cannot be oversold and failed orders do not partially mutate stock", () => {
  const store = new CommerceStore(":memory:");
  try {
    for (const p of store.products(true)) {
      p.published = p.id === "libre";
      if (p.published) {
        p.approved = true;
        p.concentration = "EDP";
        p.sizes[0].ml = 100;
        p.sizes[0].stock = 1;
      }
      store.saveProduct(p);
    }
    store.saveSettings({
      ...store.settings(),
      mode: "live",
      businessConfirmed: true,
      phone: "01012345678",
      address: "Test",
      whatsapp: "201000000000",
      shippingTextAr: "Test",
      returnsTextAr: "Test",
      privacyTextAr: "Test",
      termsTextAr: "Test",
    });
    store.createOrder(request({ expectedMode: "live" }));
    assert.throws(
      () => store.createOrder(request({ expectedMode: "live" })),
      rejects("STOCK_CHANGED"),
    );
    assert.equal(store.product("libre")!.sizes[0].stock, 0);
    assert.equal(store.orders().length, 1);
  } finally {
    store.db.close();
  }
});
test("rate limits survive repeated checks and product edits are versioned", () => {
  const store = new CommerceStore(":memory:");
  try {
    assert.equal(store.consumeLimit("example", 2, 60), true);
    assert.equal(store.consumeLimit("example", 2, 60), true);
    assert.equal(store.consumeLimit("example", 2, 60), false);
    const p = store.product("libre")!;
    const saved = store.saveProduct({ ...p, name: "Updated Libre" });
    assert.equal(saved.revision, 1);
    assert.throws(() => store.saveProduct(p), rejects("STALE_PRODUCT"));
    assert.equal(store.product("libre")!.name, "Updated Libre");
  } finally {
    store.db.close();
  }
});
