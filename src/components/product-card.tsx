"use client";
import { useTranslation } from "@/components/preferences";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Plus, ShoppingBag } from "lucide-react";
import { useShop } from "@/store/shop-store";
import { Dialog } from "@/components/dialog";
import { currency } from "@/lib/config";
import { productPrice } from "@/lib/catalog-logic";
import { productName, productDescription } from "@/lib/product-copy";
import type { Brand, Product } from "@/types/catalog";

export function ProductImage({
  product,
  index = 0,
  sizes = "(max-width: 640px) 50vw, 25vw",
  priority = false,
}: {
  product: Product;
  index?: number;
  sizes?: string;
  priority?: boolean;
}) {
  const t = useTranslation();

  const [failed, setFailed] = useState(false);
  const image = product.images[index] ?? product.images[0];
  return image && !failed ? (
    <Image
      src={image.src}
      alt={t(image.alt)}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={`product-image${image.src.endsWith("-cutout.png") ? " product-image-cutout" : ""}`}
    />
  ) : (
    <div className="image-placeholder">
      <ShoppingBag size={36} strokeWidth={1} />
      <span>{t("Image coming soon")}</span>
    </div>
  );
}
export function ProductCard({
  product,
  brand,
  locale,
}: {
  product: Product;
  brand?: Brand;
  locale: string;
}) {
  const t = useTranslation();

  const [quickView, setQuickView] = useState(false);
  const saved = useShop((state) => state.wishlist.includes(product.id));
  const toggle = useShop((state) => state.toggleWishlist);
  const add = useShop((state) => state.add);
  const available = product.sizes.find((size) => size.stock > 0);
  const [selectedId, setSelectedId] = useState(
    available?.id ?? product.sizes[0]?.id ?? "",
  );
  const selected = product.sizes.find((size) => size.id === selectedId);
  const addSelected = () => {
    if (selected && selected.stock > 0) {
      setQuickView(false);
      add(
        { productId: product.id, sizeId: selected.id, quantity: 1 },
        selected.stock,
      );
    }
  };
  return (
    <article className="product-card">
      <div className="product-card-media">
        <Link
          href={`/${locale}/perfumes/${product.slug}`}
          aria-label={t(`View ${product.name}`)}
        >
          <ProductImage product={product} />
        </Link>
        {t(
          product.badges?.[0] && (
            <span className="product-badge">{t(product.badges[0])}</span>
          ),
        )}
        <button
          className="icon-button save-button"
          aria-label={t(
            `${saved ? "Remove" : "Save"} ${product.name} ${saved ? "from" : "to"} wishlist`,
          )}
          aria-pressed={saved}
          onClick={() => toggle(product.id)}
        >
          <Heart size={20} fill={saved ? "currentColor" : "none"} />
        </button>
        <button className="quick-view" onClick={() => setQuickView(true)}>
          {t("Quick view ")}
          <Plus size={16} />
        </button>
      </div>
      <div className="product-card-info">
        <p className="muted small-text">{t(brand?.name)}</p>
        <Link href={`/${locale}/perfumes/${product.slug}`}>
          <h3>{productName(product, locale)}</h3>
        </Link>
        <p className="muted small-text">{t(product.concentration)}</p>
        {product.rating !== undefined && (product.reviewCount ?? 0) > 0 && (
          <p className="small-text">
            {t("★ ")}
            {product.rating}
            {t(" (")}
            {product.reviewCount}
            {t(") ")}
          </p>
        )}
        <div className="price-row">
          <span>{t(currency(productPrice(product), locale))}</span>
          {product.compareAtPrice !== undefined &&
            product.compareAtPrice > productPrice(product) && (
              <s className="muted">
                {t(currency(product.compareAtPrice, locale))}
              </s>
            )}
        </div>
        <button
          className="button button-secondary"
          disabled={!available}
          onClick={() => {
            if (product.sizes.length === 1 && available)
              add(
                { productId: product.id, sizeId: available.id, quantity: 1 },
                available.stock,
              );
            else setQuickView(true);
          }}
        >
          {t(
            available
              ? product.sizes.length > 1
                ? "Choose size"
                : "Add to bag"
              : "Out of stock",
          )}
          <Plus size={16} />
        </button>
      </div>
      <Dialog
        open={quickView}
        onClose={() => setQuickView(false)}
        title={productName(product, locale)}
      >
        <div className="quick-product-image">
          <ProductImage product={product} sizes="400px" />
        </div>
        <p>{productDescription(product, locale)}</p>
        <label className="field">
          {t("Size ")}
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {product.sizes.map((size) => (
              <option value={size.id} key={size.id} disabled={size.stock === 0}>
                {t(size.label)}
                {t(" — ")}
                {t(currency(size.price, locale))}
                {t(size.stock === 0 ? " (out of stock)" : "")}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button full-width"
          disabled={!selected || selected.stock < 1}
          onClick={addSelected}
        >
          {t("Add to bag ")}
          <Plus size={17} />
        </button>
        <Link
          href={`/${locale}/perfumes/${product.slug}`}
          onClick={() => setQuickView(false)}
          className="text-link"
        >
          {t("View full details ")}
        </Link>
      </Dialog>
    </article>
  );
}
export function ProductGrid({
  products,
  brands,
  locale,
}: {
  products: Product[];
  brands: Brand[];
  locale: string;
}) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          brand={brands.find((brand) => brand.id === product.brandId)}
          locale={locale}
        />
      ))}
    </div>
  );
}
