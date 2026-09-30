import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { seedBrands, seedProducts } from "../data/seed-catalog.ts";
import {
  defaultSettings,
  deliveryFee,
  orderSchema,
  productSchema,
  settingsSchema,
  type OrderRecord,
  type OrderStatus,
  type StoreSettings,
} from "./commerce-schema.ts";
import type { Brand, Product } from "../types/catalog.ts";
import { validWhatsAppNumber, whatsappOrderUrl } from "./whatsapp-order.ts";

export class CommerceError extends Error {
  code: string;
  status: number;
  constructor(code: string, status = 400) {
    super(code);
    this.name = "CommerceError";
    this.code = code;
    this.status = status;
  }
}
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export class CommerceStore {
  db: DatabaseSync;
  constructor(filename: string) {
    if (filename !== ":memory:")
      mkdirSync(path.dirname(filename), { recursive: true });
    this.db = new DatabaseSync(filename);
    this.db
      .exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, document TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS brands (id TEXT PRIMARY KEY, document TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, idempotency TEXT UNIQUE NOT NULL, fingerprint TEXT NOT NULL, document TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS admin (id INTEGER PRIMARY KEY CHECK(id=1), password TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, at TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL);
    `);
    this.transaction(() => {
      if (
        !this.db.prepare("SELECT value FROM metadata WHERE key='seeded'").get()
      ) {
        for (const p of seedProducts)
          this.db
            .prepare("INSERT OR IGNORE INTO products VALUES (?,?,?)")
            .run(p.id, p.slug, JSON.stringify(p));
        for (const b of seedBrands)
          this.db
            .prepare("INSERT OR IGNORE INTO brands VALUES (?,?)")
            .run(b.id, JSON.stringify(b));
        this.db
          .prepare("INSERT INTO metadata VALUES ('settings',?)")
          .run(JSON.stringify(defaultSettings));
        this.db.prepare("INSERT INTO metadata VALUES ('seeded','1')").run();
      }
    });
  }
  transaction<T>(action: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = action();
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  products(includeDrafts = false): Product[] {
    return this.db
      .prepare("SELECT document FROM products ORDER BY rowid")
      .all()
      .map((r) => JSON.parse(String(r.document)) as Product)
      .filter((p) => includeDrafts || p.published);
  }
  product(id: string): Product | undefined {
    const row = this.db
      .prepare("SELECT document FROM products WHERE id=?")
      .get(id);
    return row ? JSON.parse(String(row.document)) : undefined;
  }
  brands(): Brand[] {
    return this.db
      .prepare("SELECT document FROM brands ORDER BY rowid")
      .all()
      .map((r) => JSON.parse(String(r.document)));
  }
  settings(): StoreSettings {
    return JSON.parse(
      String(
        this.db
          .prepare("SELECT value FROM metadata WHERE key='settings'")
          .get()!.value,
      ),
    );
  }
  log(action: string, target: string) {
    this.db
      .prepare("INSERT INTO audit(at,action,target) VALUES (?,?,?)")
      .run(new Date().toISOString(), action, target);
  }
  saveProduct(input: unknown) {
    const product = productSchema.parse(input);
    return this.transaction(() => {
      const old = this.product(product.id);
      if (old && (old.revision ?? 0) !== product.revision)
        throw new CommerceError("STALE_PRODUCT", 409);
      if (
        old &&
        old.sizes.some(
          (size) =>
            !product.sizes.some((s) => s.id === size.id) &&
            this.orders().some(
              (o) =>
                !o.test &&
                ["new", "confirmed"].includes(o.status) &&
                o.items.some(
                  (i) => i.productId === old.id && i.sizeId === size.id,
                ),
            ),
        )
      )
        throw new CommerceError("VARIANT_IN_USE", 409);
      if (!this.brands().some((b) => b.id === product.brandId))
        throw new CommerceError("INVALID_BRAND");
      if (
        product.approved &&
        (product.sizes.some((s) => s.ml === 0 || s.price <= 0) ||
          product.concentration === "Unconfirmed")
      )
        throw new CommerceError("INCOMPLETE_PRODUCT");
      if (
        this.settings().mode === "live" &&
        product.published &&
        !product.approved
      )
        throw new CommerceError("UNAPPROVED_PRODUCT");
      const duplicate = this.db
        .prepare("SELECT id FROM products WHERE slug=? AND id!=?")
        .get(product.slug, product.id);
      if (duplicate) throw new CommerceError("DUPLICATE_SLUG", 409);
      product.revision = (old?.revision ?? 0) + 1;
      this.db
        .prepare(
          "INSERT INTO products VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,document=excluded.document",
        )
        .run(product.id, product.slug, JSON.stringify(product));
      this.log("product.saved", product.id);
      return product;
    });
  }
  saveBrand(brand: Brand) {
    this.db
      .prepare(
        "INSERT INTO brands VALUES(?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document",
      )
      .run(brand.id, JSON.stringify(brand));
    this.log("brand.saved", brand.id);
  }
  saveSettings(input: unknown) {
    const settings = settingsSchema.parse(input);
    return this.transaction(() => {
      if (settings.revision !== this.settings().revision)
        throw new CommerceError("STALE_SETTINGS", 409);
      if (settings.mode === "live") {
        if (
          !settings.businessConfirmed ||
          !validWhatsAppNumber(settings.whatsapp) ||
          !settings.phone ||
          !settings.address ||
          !settings.returnsTextAr ||
          !settings.shippingTextAr ||
          !settings.privacyTextAr ||
          !settings.termsTextAr ||
          !settings.shippingRates.some((r) => r.enabled)
        )
          throw new CommerceError("LAUNCH_SETTINGS_INCOMPLETE");
        const products = this.products();
        if (!products.length || products.some((p) => !p.approved))
          throw new CommerceError("CATALOG_NOT_APPROVED");
      }
      settings.revision++;
      this.db
        .prepare("UPDATE metadata SET value=? WHERE key='settings'")
        .run(JSON.stringify(settings));
      this.log("settings.saved", settings.mode);
      return settings;
    });
  }
  createOrder(input: unknown): { id: string; total: number; test: boolean; whatsappUrl?: string } {
    const data = orderSchema.parse(input);
    const fingerprint = digest(JSON.stringify(data));
    return this.transaction(() => {
      const settings = this.settings();
      if (data.payment === "whatsapp" && !validWhatsAppNumber(settings.whatsapp))
        throw new CommerceError("WHATSAPP_UNAVAILABLE", 409);
      const receipt = (o: OrderRecord) => ({
        id: o.id, total: o.total, test: o.test,
        ...(o.payment === "whatsapp" ? { whatsappUrl: whatsappOrderUrl(settings.whatsapp, o) } : {}),
      });
      const previous = this.db
        .prepare("SELECT document,fingerprint FROM orders WHERE idempotency=?")
        .get(data.idempotencyKey);
      if (previous) {
        if (previous.fingerprint !== fingerprint)
          throw new CommerceError("IDEMPOTENCY_CONFLICT", 409);
        const o = JSON.parse(String(previous.document)) as OrderRecord;
        return receipt(o);
      }
      if (settings.mode === "paused" || (data.payment === "cod" && !settings.codEnabled))
        throw new CommerceError("ORDERING_PAUSED", 409);
      if (settings.mode !== data.expectedMode)
        throw new CommerceError("CHECKOUT_CHANGED", 409);
      const seen = new Set<string>();
      const items = data.items.map((item) => {
        const key = `${item.productId}/${item.sizeId}`;
        if (seen.has(key)) throw new CommerceError("DUPLICATE_ITEM");
        seen.add(key);
        const product = this.product(item.productId);
        const size = product?.sizes.find((s) => s.id === item.sizeId);
        if (!product?.published || !size || size.stock < item.quantity)
          throw new CommerceError("STOCK_CHANGED", 409);
        if (settings.mode === "live" && !product.approved)
          throw new CommerceError("UNAPPROVED_PRODUCT", 409);
        return {
          ...item,
          name: product.name,
          label: size.label,
          unitPrice: size.price,
          total: (Math.round(size.price * 100) * item.quantity) / 100,
        };
      });
      const subtotal =
        items.reduce((n, item) => n + Math.round(item.total * 100), 0) / 100;
      const shipping = deliveryFee(
        settings,
        data.customer.governorate,
        subtotal,
      );
      if (shipping === null) throw new CommerceError("UNSUPPORTED_DELIVERY");
      const total = Math.round((subtotal + shipping) * 100) / 100;
      if (Math.round(data.expectedTotal * 100) !== Math.round(total * 100))
        throw new CommerceError("PRICE_CHANGED", 409);
      // Persist only the minimum customer details needed to fulfil this order.
      const order: OrderRecord = {
        id: `ASL-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(5).toString("hex").toUpperCase()}`,
        createdAt: new Date().toISOString(),
        status: "new",
        test: settings.mode === "test",
        payment: data.payment,
        customer: data.customer,
        items,
        subtotal,
        shipping,
        total,
      };
      if (!order.test) {
        for (const item of items) {
          const p = this.product(item.productId)!;
          p.sizes.find((s) => s.id === item.sizeId)!.stock -= item.quantity;
          p.revision = (p.revision ?? 0) + 1;
          this.db
            .prepare("UPDATE products SET document=? WHERE id=?")
            .run(JSON.stringify(p), p.id);
        }
      }
      this.db
        .prepare("INSERT INTO orders VALUES(?,?,?,?)")
        .run(order.id, data.idempotencyKey, fingerprint, JSON.stringify(order));
      this.log("order.created", order.id);
      return receipt(order);
    });
  }
  orders(): OrderRecord[] {
    return this.db
      .prepare("SELECT document FROM orders ORDER BY rowid DESC LIMIT 500")
      .all()
      .map((r) => JSON.parse(String(r.document)));
  }
  updateOrder(id: string, status: OrderStatus, expectedStatus: OrderStatus) {
    return this.transaction(() => {
      const row = this.db
        .prepare("SELECT document FROM orders WHERE id=?")
        .get(id);
      if (!row) throw new CommerceError("ORDER_NOT_FOUND", 404);
      const order = JSON.parse(String(row.document)) as OrderRecord;
      if (order.status !== expectedStatus)
        throw new CommerceError("STALE_ORDER", 409);
      const allowed: Record<OrderStatus, OrderStatus[]> = {
        new: ["confirmed", "cancelled"],
        confirmed: ["shipped", "cancelled"],
        shipped: ["delivered"],
        delivered: [],
        cancelled: [],
      };
      if (!allowed[order.status].includes(status))
        throw new CommerceError("INVALID_STATUS");
      if (status === "cancelled" && !order.test) {
        for (const item of order.items) {
          const p = this.product(item.productId);
          const size = p?.sizes.find((s) => s.id === item.sizeId);
          if (p && size) {
            size.stock += item.quantity;
            p.revision = (p.revision ?? 0) + 1;
            this.db
              .prepare("UPDATE products SET document=? WHERE id=?")
              .run(JSON.stringify(p), p.id);
          }
        }
      }
      order.status = status;
      this.db
        .prepare("UPDATE orders SET document=? WHERE id=?")
        .run(JSON.stringify(order), id);
      this.log(`order.${status}`, id);
      return order;
    });
  }
  consumeLimit(key: string, max: number, seconds: number) {
    return this.transaction(() => {
      const now = Date.now();
      this.db.prepare("DELETE FROM limits WHERE expires < ?").run(now);
      const row = this.db
        .prepare("SELECT count FROM limits WHERE key=?")
        .get(key);
      if (row && Number(row.count) >= max) return false;
      this.db
        .prepare(
          "INSERT INTO limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1",
        )
        .run(key, now + seconds * 1000);
      return true;
    });
  }
}
const globalStore = globalThis as typeof globalThis & {
  aselStore?: CommerceStore;
};
export function getStore() {
  return (globalStore.aselStore ??= new CommerceStore(
    path.join(
      process.env.ASEL_DATA_DIR || path.join(process.cwd(), "data"),
      "asel.sqlite",
    ),
  ));
}
