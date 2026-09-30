"use client";
import { useState } from "react";
import Image from "next/image";
import { useAdminText } from "./dashboard";
import type { Product, Brand } from "@/types/catalog";
export function ProductEditor({
  product,
  brands,
  media,
  busy,
  onSave,
  onBrand,
}: {
  product: Product;
  brands: Brand[];
  media: string[];
  busy: boolean;
  onSave: (p: Product) => Promise<void>;
  onBrand: (b: Brand) => Promise<boolean>;
}) {
  const tr = useAdminText();
  const [p, setP] = useState(product);
  const [showPhotos, setShowPhotos] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [showBrand, setShowBrand] = useState(false);
  function update<K extends keyof Product>(key: K, value: Product[K]) {
    setP((old) => ({ ...old, [key]: value }));
  }
  return (
    <form
      className="admin-editor"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave(p);
      }}
    >
      <div className="form-grid">
        <label className="field">
          {tr("English name", "الاسم بالإنجليزي")}
          <input
            required
            value={p.name}
            maxLength={150}
            onChange={(e) => update("name", e.target.value)}
          />
        </label>
        <label className="field">
          {tr("Arabic name", "الاسم بالعربي")}
          <input
            value={p.nameAr || ""}
            onChange={(e) => update("nameAr", e.target.value)}
          />
        </label>
        <label className="field">
          {tr("Page slug", "رابط المنتج")}
          <input
            required
            dir="ltr"
            pattern="[a-z0-9-]+"
            value={p.slug}
            onChange={(e) => update("slug", e.target.value)}
          />
        </label>
        <label className="field">
          {tr("Brand", "الماركة")}
          <select
            value={p.brandId}
            onChange={(e) => update("brandId", e.target.value)}
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="button"
        className="text-link"
        onClick={() => setShowBrand(!showBrand)}
      >
        {tr("Add a brand", "إضافة ماركة")}
      </button>
      {showBrand && (
        <div className="form-actions">
          <input
            aria-label={tr("New brand name", "اسم الماركة الجديدة")}
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
          <button
            type="button"
            className="button button-secondary"
            disabled={busy || brandName.trim().length < 2}
            onClick={async () => {
              const id = `brand-${crypto.randomUUID().slice(0, 8)}`;
              if (
                await onBrand({
                  id,
                  slug: id,
                  name: brandName,
                  description: "",
                })
              ) {
                update("brandId", id);
                setShowBrand(false);
                setBrandName("");
              }
            }}
          >
            {tr("Save brand", "حفظ الماركة")}
          </button>
        </div>
      )}
      <div className="form-grid">
        <label className="field">
          {tr("Gender", "التصنيف")}
          <select
            value={p.gender}
            onChange={(e) =>
              update("gender", e.target.value as Product["gender"])
            }
          >
            <option value="women">{tr("For her", "نسائي")}</option>
            <option value="men">{tr("For him", "رجالي")}</option>
            <option value="unisex">{tr("Unisex", "للجميع")}</option>
          </select>
        </label>
        <label className="field">
          {tr("Concentration", "التركيز")}
          <select
            value={p.concentration}
            onChange={(e) =>
              update(
                "concentration",
                e.target.value as Product["concentration"],
              )
            }
          >
            {["Unconfirmed", "EDP", "EDT", "Extrait", "Cologne", "Parfum"].map(
              (c) => (
                <option key={c} value={c}>
                  {c === "Unconfirmed" ? tr("Not confirmed", "قيد التأكيد") : c}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="field span-2">
          {tr("English description", "الوصف بالإنجليزي")}
          <textarea
            rows={3}
            value={p.description}
            maxLength={4000}
            onChange={(e) => update("description", e.target.value)}
          />
        </label>
        <label className="field span-2">
          {tr("Arabic description", "الوصف بالعربي")}
          <textarea
            rows={3}
            value={p.descriptionAr || ""}
            maxLength={4000}
            onChange={(e) => update("descriptionAr", e.target.value)}
          />
        </label>
      </div>
      <h3>{tr("Sizes, prices and stock", "الأحجام والأسعار والمخزون")}</h3>
      {p.sizes.map((s, index) => (
        <fieldset className="admin-variant" key={s.id}>
          <legend>
            {tr("Size", "حجم")} {index + 1}
          </legend>
          <div className="form-grid">
            {(
              [
                ["label", tr("Label", "الاسم")],
                ["ml", tr("Volume (ml)", "الحجم بالمل")],
                ["price", tr("Price (EGP)", "السعر بالجنيه")],
                ["stock", tr("Stock", "المخزون")],
              ] as const
            ).map(([key, label]) => (
              <label className="field" key={key}>
                {label}
                <input
                  type={key === "label" ? "text" : "number"}
                  min={0}
                  step={key === "price" ? "0.01" : "1"}
                  required
                  value={s[key]}
                  onChange={(e) =>
                    update(
                      "sizes",
                      p.sizes.map((size, i) =>
                        i === index
                          ? {
                              ...size,
                              [key]:
                                key === "label"
                                  ? e.target.value
                                  : Number(e.target.value),
                            }
                          : size,
                      ),
                    )
                  }
                />
              </label>
            ))}
          </div>
          {p.sizes.length > 1 && (
            <button
              type="button"
              className="text-link"
              onClick={() =>
                update(
                  "sizes",
                  p.sizes.filter((_, i) => i !== index),
                )
              }
            >
              {tr("Remove size", "حذف الحجم")}
            </button>
          )}
        </fieldset>
      ))}
      <button
        type="button"
        className="button button-secondary"
        onClick={() =>
          update("sizes", [
            ...p.sizes,
            {
              id: `size-${crypto.randomUUID().slice(0, 8)}`,
              label: "50 ml",
              ml: 50,
              price: 0,
              stock: 0,
            },
          ])
        }
      >
        {tr("Add size", "إضافة حجم")}
      </button>
      <h3>{tr("Product photos", "صور المنتج")}</h3>
      <p className="small-text muted">
        {tr(
          "The first photo is the cover. Select photos in the order you want them to appear.",
          "أول صورة هي الغلاف. اختار الصور بالترتيب اللي تحب تظهر به.",
        )}
      </p>
      <div className="admin-selected-photos">
        {p.images.map((img, i) => (
          <button
            type="button"
            key={img.src}
            onClick={() =>
              update(
                "images",
                p.images.filter((x) => x.src !== img.src),
              )
            }
            aria-label={`${tr("Remove photo", "إزالة الصورة")} ${i + 1}`}
          >
            <Image src={img.src} width={80} height={100} alt="" unoptimized />
            <span>{i + 1} ×</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="text-link"
        onClick={() => setShowPhotos(!showPhotos)}
      >
        {tr("Choose from library", "اختيار من المكتبة")}
      </button>
      {showPhotos && (
        <div className="admin-photo-picker">
          {media.map((src) => (
            <button
              type="button"
              key={src}
              aria-label={src.split("/").pop()}
              aria-pressed={p.images.some((i) => i.src === src)}
              onClick={() =>
                update(
                  "images",
                  p.images.some((i) => i.src === src)
                    ? p.images.filter((i) => i.src !== src)
                    : [...p.images, { src, alt: p.name }],
                )
              }
            >
              <Image src={src} width={90} height={110} alt="" unoptimized />
            </button>
          ))}
        </div>
      )}
      <details>
        <summary>
          {tr("Notes and discovery filters", "المكوّنات وفلاتر البحث")}
        </summary>
        <p className="muted small-text">
          {tr(
            "Use comma-separated keys: rose, oud, vanilla; woody, floral; daily, evening. Only enter verified notes.",
            "استخدم مفاتيح مفصولة بفاصلة: rose, oud, vanilla؛ woody, floral؛ daily, evening. أضف المكوّنات المؤكدة فقط.",
          )}
        </p>
        <div className="form-grid">
          {(
            [
              ["topNotes", tr("Top notes", "المقدمة")],
              ["heartNotes", tr("Heart notes", "القلب")],
              ["baseNotes", tr("Base notes", "القاعدة")],
              ["scentFamilies", tr("Scent families", "العائلات العطرية")],
              ["occasions", tr("Occasions", "المناسبات")],
              ["seasons", tr("Seasons", "المواسم")],
              [
                "categories",
                tr(
                  "Categories (arabic, gifts, niche)",
                  "الأقسام (arabic, gifts, niche)",
                ),
              ],
            ] as const
          ).map(([key, label]) => (
            <label className="field" key={key}>
              {label}
              <input
                defaultValue={p[key].join(", ")}
                onBlur={(e) =>
                  update(
                    key,
                    e.target.value
                      .split(/[,،]/)
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
              />
            </label>
          ))}
          <label className="field">
            {tr("Projection", "الانتشار")}
            <select
              value={p.projection}
              onChange={(e) =>
                update("projection", e.target.value as Product["projection"])
              }
            >
              <option value="soft">{tr("Soft", "هادئ")}</option>
              <option value="moderate">{tr("Moderate", "متوسط")}</option>
              <option value="strong">{tr("Strong", "قوي")}</option>
            </select>
          </label>
        </div>
      </details>
      <div className="admin-checks">
        {(
          [
            ["published", tr("Visible in the store", "ظاهر في المتجر")],
            ["isFeatured", tr("Featured on homepage", "مميز في الرئيسية")],
            ["isNew", tr("New arrival", "وصل حديثًا")],
            [
              "isBestSeller",
              tr("Bestseller (only if verified)", "الأكثر مبيعًا (لو مؤكد)"),
            ],
            [
              "approved",
              tr(
                "I verified this product’s identity, size, price and real stock",
                "راجعت اسم المنتج وحجمه وسعره ومخزونه الفعلي",
              ),
            ],
          ] as const
        ).map(([key, label]) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={Boolean(p[key])}
              onChange={(e) => update(key, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>
      <button className="button full-width" disabled={busy || !p.images.length}>
        {busy ? tr("Saving…", "جارٍ الحفظ…") : tr("Save product", "حفظ المنتج")}
      </button>
    </form>
  );
}
