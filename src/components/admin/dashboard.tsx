"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Package,
  ClipboardList,
  Settings,
  Images,
  Plus,
  LogOut,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { useLocale } from "@/components/preferences";
import { Dialog } from "@/components/dialog";
import { currency } from "@/lib/config";
import { ProductEditor } from "./product-editor";
import { SettingsEditor } from "./settings-editor";
import type { Brand, Product } from "@/types/catalog";
import type {
  OrderRecord,
  OrderStatus,
  StoreSettings,
} from "@/lib/commerce-schema";

export type AdminData = {
  products: Product[];
  brands: Brand[];
  orders: OrderRecord[];
  settings: StoreSettings;
  media: string[];
};
export const errorMessages: Record<string, string> = {
  UNAUTHORIZED: "انتهت الجلسة. سجّل الدخول مرة أخرى.",
  INVALID_CREDENTIALS: "كلمة المرور غير صحيحة.",
  LOGIN_RATE_LIMIT: "محاولات كثيرة. حاول بعد ١٥ دقيقة.",
  STALE_PRODUCT: "تم تعديل المنتج. حدّث القائمة قبل الحفظ.",
  STALE_SETTINGS: "تم تعديل الإعدادات. حدّث الصفحة قبل الحفظ.",
  STALE_ORDER: "تغيّرت حالة الطلب. حدّث القائمة.",
  DUPLICATE_SLUG: "رابط المنتج مستخدم بالفعل.",
  INCOMPLETE_PRODUCT: "أكمل الأحجام والأسعار والتركيز قبل اعتماد المنتج.",
  UNAPPROVED_PRODUCT: "اعتمد بيانات المنتج قبل عرضه في وضع البيع.",
  CATALOG_NOT_APPROVED: "راجع واعتمد كل المنتجات المعروضة أولًا.",
  LAUNCH_SETTINGS_INCOMPLETE:
    "أكمل بيانات التواصل والعنوان والسياسات واعتمد إعدادات الشحن قبل فتح البيع.",
  INVALID_INPUT: "راجع البيانات؛ بعض الحقول ناقصة أو غير صحيحة.",
  INVALID_IMAGE: "اختر صورة JPEG أو PNG أو WebP.",
  BODY_TOO_LARGE: "حجم الملف أكبر من ٨ ميجابايت.",
  VARIANT_IN_USE: "يوجد طلب نشط لهذا الحجم؛ لا يمكن حذفه الآن.",
};
export async function adminRequest(
  url: string,
  method = "GET",
  body?: unknown,
) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "SERVER_ERROR");
  return result;
}
export function useAdminText() {
  const locale = useLocale();
  return (en: string, ar: string) => (locale === "ar" ? ar : en);
}
export function AdminLogin() {
  const tr = useAdminText();
  const locale = useLocale();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="admin-login container">
      <span className="eyebrow">Asel Cosmetics</span>
      <h1>{tr("Your store, at a glance.", "متجرك، بين إيديك.")}</h1>
      <p className="muted">
        {tr(
          "Sign in to manage products, orders and delivery.",
          "سجّل الدخول لإدارة المنتجات والطلبات والشحن.",
        )}
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await adminRequest("/api/admin/session", "POST", { password });
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "SERVER_ERROR");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="field">
          {tr("Admin password", "كلمة مرور الإدارة")}
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="button" disabled={busy}>
          {busy ? tr("Signing in…", "جارٍ الدخول…") : tr("Sign in", "دخول")}
        </button>
        <p role="alert" className="field-error">
          {locale === "ar"
            ? errorMessages[error] || error
            : error.replaceAll("_", " ")}
        </p>
      </form>
    </section>
  );
}
export function AdminDashboard() {
  const tr = useAdminText();
  const locale = useLocale();
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState("products");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function refresh() {
    try {
      setData(await adminRequest("/api/admin/data"));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "SERVER_ERROR");
    }
  }
  useEffect(() => {
    let active = true;
    adminRequest("/api/admin/data")
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function save(resource: string, value: unknown) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await adminRequest("/api/admin/data", "POST", { resource, data: value });
      await refresh();
      setNotice(tr("Saved successfully.", "تم الحفظ بنجاح."));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "SERVER_ERROR");
      return false;
    } finally {
      setBusy(false);
    }
  }
  function newProduct() {
    if (!data) return;
    const id = `product-${crypto.randomUUID().slice(0, 8)}`;
    setEditing({
      id,
      slug: id,
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      brandId: data.brands[0].id,
      gender: "unisex",
      concentration: "Unconfirmed",
      scentFamilies: [],
      topNotes: [],
      heartNotes: [],
      baseNotes: [],
      occasions: [],
      seasons: [],
      projection: "moderate",
      categories: [],
      sizes: [{ id: "standard", label: "100 ml", ml: 100, price: 0, stock: 0 }],
      images: [],
      published: false,
      approved: false,
      revision: 0,
      createdAt: new Date().toISOString(),
    });
  }
  const filtered =
    data?.products.filter((p) =>
      `${p.name} ${p.nameAr} ${p.id}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    ) || [];
  const statusName = (status: string) =>
    locale === "ar"
      ? {
          new: "جديد",
          confirmed: "مؤكد",
          shipped: "تم الشحن",
          delivered: "تم التسليم",
          cancelled: "ملغي",
        }[status] || status
      : status;
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    new: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };
  return (
    <section className="admin-shell container">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">Asel Cosmetics</span>
          <h1>{tr("Store management", "إدارة المتجر")}</h1>
          <p className="muted">
            {tr(
              "The details that keep your store moving.",
              "كل تفاصيل متجرك في مكان واحد.",
            )}
          </p>
        </div>
        <div className="admin-heading-actions">
          <a
            className="text-link"
            href={`/${locale}/perfumes`}
            target="_blank"
            rel="noreferrer"
          >
            {tr("View store", "عرض المتجر")}
            <ArrowUpRight size={16} />
          </a>
          <button
            className="button button-secondary"
            onClick={async () => {
              await adminRequest("/api/admin/session", "DELETE");
              router.refresh();
            }}
          >
            <LogOut size={16} />
            {tr("Sign out", "خروج")}
          </button>
        </div>
      </div>
      {data && (
        <div className="admin-overview">
          <div>
            <strong>{data.products.filter((p) => p.published).length}</strong>
            <span>{tr("Published products", "منتج معروض")}</span>
          </div>
          <div>
            <strong>
              {data.orders.filter((o) => o.status === "new" && !o.test).length}
            </strong>
            <span>{tr("New orders", "طلب جديد")}</span>
          </div>
          <div>
            <strong>{data.products.filter((p) => !p.approved).length}</strong>
            <span>{tr("Need review", "منتج يحتاج مراجعة")}</span>
          </div>
          <div>
            <strong>
              {data.settings.mode === "test"
                ? tr("Test", "تجربة")
                : data.settings.mode === "live"
                  ? tr("Live", "بيع مباشر")
                  : tr("Paused", "متوقف")}
            </strong>
            <span>{tr("Store mode", "حالة المتجر")}</span>
          </div>
        </div>
      )}
      <nav
        className="admin-tabs"
        aria-label={tr("Management sections", "أقسام الإدارة")}
      >
        {[
          ["products", Package, tr("Products", "المنتجات")],
          ["orders", ClipboardList, tr("Orders", "الطلبات")],
          ["media", Images, tr("Photos", "الصور")],
          ["settings", Settings, tr("Settings", "الإعدادات")],
        ].map(([id, Icon, label]) => {
          const Symbol = Icon as typeof Package;
          return (
            <button
              key={String(id)}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => {
                setTab(String(id));
                setError("");
                setNotice("");
              }}
            >
              <Symbol size={18} />
              {String(label)}
            </button>
          );
        })}
        <button onClick={refresh}>{tr("Refresh", "تحديث")}</button>
      </nav>
      <div role="alert" className={error ? "notice admin-error" : ""}>
        {locale === "ar"
          ? errorMessages[error] || error
          : error.replaceAll("_", " ")}
      </div>
      <p role="status" className="admin-notice">
        {notice}
      </p>
      {!data ? (
        <p>{tr("Loading…", "جارٍ التحميل…")}</p>
      ) : (
        <>
          {tab === "products" && (
            <>
              <div className="admin-toolbar">
                <label className="admin-search">
                  <Search size={18} />
                  <input
                    aria-label={tr("Search products", "ابحث عن منتج")}
                    placeholder={tr("Search by name…", "ابحث بالاسم…")}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <button className="button" onClick={newProduct}>
                  <Plus size={18} />
                  {tr("Add product", "إضافة منتج")}
                </button>
              </div>
              <p className="muted small-text">
                {tr(
                  "Prices and stock imported with the photos are temporary. Open a product to edit and approve its details.",
                  "الأسعار والمخزون المضافين مع الصور مؤقتين. افتح أي منتج لتعديل بياناته واعتمادها.",
                )}
              </p>
              <div className="admin-product-list">
                {filtered.map((p) => (
                  <button
                    className="admin-product-row"
                    key={p.id}
                    onClick={() => setEditing(structuredClone(p))}
                  >
                    <Image
                      src={p.images[0]?.src || "/images/asel-logo.jpeg"}
                      alt=""
                      width={64}
                      height={80}
                      unoptimized
                    />
                    <span className="admin-product-name">
                      <strong>
                        {locale === "ar" ? p.nameAr || p.name : p.name}
                      </strong>
                      <small>
                        {data.brands.find((b) => b.id === p.brandId)?.name}
                      </small>
                    </span>
                    <span>
                      {currency(
                        Math.min(...p.sizes.map((s) => s.price)),
                        locale,
                      )}
                    </span>
                    <span className="admin-stock">
                      {p.sizes.reduce((n, s) => n + s.stock, 0)}{" "}
                      {tr("units", "قطعة")}
                    </span>
                    <span
                      className={`admin-tag ${p.approved ? "approved" : ""}`}
                    >
                      {!p.published
                        ? tr("Draft", "مسودة")
                        : p.approved
                          ? tr("Approved", "معتمد")
                          : tr("Review", "للمراجعة")}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          {tab === "orders" && (
            <>
              <div className="admin-toolbar">
                <h2>{tr("Order book", "سجل الطلبات")}</h2>
                <span className="muted">
                  {tr("Latest 500 orders", "آخر ٥٠٠ طلب")}
                </span>
              </div>
              {!data.orders.length ? (
                <div className="empty-state">
                  <ClipboardList />
                  <h2>
                    {tr("Your first order starts here.", "أول طلب هيظهر هنا.")}
                  </h2>
                  <p>
                    {tr(
                      "Place a test order from the store to try the full journey.",
                      "اعمل طلب تجريبي من المتجر لتجربة الرحلة كاملة.",
                    )}
                  </p>
                </div>
              ) : (
                <div className="admin-order-list">
                  {data.orders.map((o) => (
                    <button
                      key={o.id}
                      className="admin-order-row"
                      onClick={() => setOrder(o)}
                    >
                      <span>
                        <strong dir="ltr">{o.id}</strong>
                        <small>
                          {new Date(o.createdAt).toLocaleString(
                            locale === "ar" ? "ar-EG" : "en-GB",
                          )}
                        </small>
                      </span>
                      <span>
                        {o.customer.name}
                        <small>{o.customer.governorate}</small>
                      </span>
                      <span>{currency(o.total, locale)}</span>
                      <span className="admin-tag">
                        {o.test ? tr("Test · ", "تجربة · ") : ""}
                        {statusName(o.status)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {tab === "media" && (
            <>
              <div className="admin-toolbar">
                <h2>{tr("Photo library", "مكتبة الصور")}</h2>
                <label className="button">
                  {tr("Upload photo", "رفع صورة")}
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const form = new FormData();
                      form.append("file", file);
                      try {
                        const r = await fetch("/api/admin/upload", {
                          method: "POST",
                          body: form,
                        });
                        const result = await r.json();
                        if (!r.ok) throw new Error(result.error);
                        await refresh();
                        setNotice(
                          tr(
                            "Photo added. You can select it in the product editor.",
                            "تمت إضافة الصورة. تقدر تختارها من تعديل المنتج.",
                          ),
                        );
                      } catch (err) {
                        setError(
                          err instanceof Error ? err.message : "SERVER_ERROR",
                        );
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="admin-media-grid">
                {data.media.map((src) => (
                  <figure key={src}>
                    <Image
                      src={src}
                      width={220}
                      height={260}
                      alt={src.split("/").pop() || ""}
                      unoptimized
                    />
                    <figcaption dir="ltr">{src.split("/").pop()}</figcaption>
                  </figure>
                ))}
              </div>
            </>
          )}
          {tab === "settings" && (
            <SettingsEditor
              key={data.settings.revision}
              settings={data.settings}
              busy={busy}
              onSave={(value) => save("settings", value)}
            />
          )}
          <Dialog
            open={!!editing}
            onClose={() => {
              if (!busy) setEditing(null);
            }}
            title={tr("Product details", "بيانات المنتج")}
          >
            <>
              {error && (
                <p role="alert" className="notice">
                  {locale === "ar"
                    ? errorMessages[error] || error
                    : error.replaceAll("_", " ")}
                </p>
              )}
              {editing && (
                <ProductEditor
                  key={editing.id}
                  product={editing}
                  brands={data.brands}
                  media={data.media}
                  busy={busy}
                  onSave={async (value) => {
                    if (await save("product", value)) setEditing(null);
                  }}
                  onBrand={async (b) => {
                    return await save("brand", b);
                  }}
                />
              )}
            </>
          </Dialog>
          <Dialog
            open={!!order}
            onClose={() => setOrder(null)}
            title={tr("Order details", "تفاصيل الطلب")}
          >
            {order && (
              <div className="admin-order-detail">
                <h3 dir="ltr">{order.id}</h3>
                {order.test && (
                  <p className="notice">
                    {tr(
                      "Test order. No fulfilment or payment required.",
                      "طلب تجريبي، لا يتطلب شحن أو تحصيل أموال.",
                    )}
                  </p>
                )}
                <p>
                  <strong>{order.customer.name}</strong>
                  <br />
                  <a href={`tel:${order.customer.phone}`} dir="ltr">
                    {order.customer.phone}
                  </a>
                  <br />
                  {order.customer.email}
                </p>
                <p>
                  {[
                    order.customer.building,
                    order.customer.street,
                    order.customer.floor,
                    order.customer.apartment,
                    order.customer.city,
                    order.customer.governorate,
                  ]
                    .filter(Boolean)
                    .join("، ")}
                </p>
                <p>{order.customer.notes}</p>
                {order.items.map((i) => (
                  <div
                    className="summary-row"
                    key={`${i.productId}/${i.sizeId}`}
                  >
                    <span>
                      {i.name} · {i.label} × {i.quantity}
                    </span>
                    <strong>{currency(i.total, locale)}</strong>
                  </div>
                ))}
                <div className="summary-row">
                  <span>{tr("Delivery", "الشحن")}</span>
                  <strong>{currency(order.shipping, locale)}</strong>
                </div>
                <div className="summary-row">
                  <span>
                    {tr(
                      "Total · cash on delivery",
                      "الإجمالي · دفع عند الاستلام",
                    )}
                  </span>
                  <strong>{currency(order.total, locale)}</strong>
                </div>
                <p>
                  {tr("Status: ", "الحالة: ")}
                  {statusName(order.status)}
                </p>
                <div className="form-actions">
                  {transitions[order.status].map((status) => (
                    <button
                      className="button button-secondary"
                      key={status}
                      disabled={busy}
                      onClick={async () => {
                        if (
                          await save("order", {
                            id: order.id,
                            status,
                            expectedStatus: order.status,
                          })
                        )
                          setOrder(current => current?.id === order.id ? { ...current, status } : current);
                      }}
                    >
                      {statusName(status)}
                    </button>
                  ))}
                </div>
                {error && (
                  <p role="alert" className="field-error">
                    {locale === "ar" ? errorMessages[error] || error : error}
                  </p>
                )}
              </div>
            )}
          </Dialog>
        </>
      )}
    </section>
  );
}
