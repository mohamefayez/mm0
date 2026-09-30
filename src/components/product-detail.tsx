"use client";
import { useTranslation } from "@/components/preferences";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Plus, ZoomIn } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/product-card";
import { Quantity } from "@/components/shop";
import { Dialog } from "@/components/dialog";
import { useShop } from "@/store/shop-store";
import { currency } from "@/lib/config";
import { productName, productDescription } from "@/lib/product-copy";
import type { Brand, Product } from "@/types/catalog";
export function ProductDetail({
  product,
  brand,
  locale,
}: {
  product: Product;
  brand?: Brand;
  locale: string;
}) {
  const t = useTranslation();

  const [imageIndex, setImageIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [selectedId, setSelectedId] = useState(
    product.sizes.find((size) => size.stock > 0)?.id ??
      product.sizes[0]?.id ??
      "",
  );
  const [quantity, setQuantity] = useState(1);
  const touch = useRef<number | null>(null);
  const selected = product.sizes.find((size) => size.id === selectedId);
  const saved = useShop((state) => state.wishlist.includes(product.id));
  const toggle = useShop((state) => state.toggleWishlist);
  const add = useShop((state) => state.add);
  const view = useShop((state) => state.view);
  const close = useShop((state) => state.setCartOpen);
  const router = useRouter();
  useEffect(() => {
    const record = () => view(product.id);
    if (useShop.persist.hasHydrated()) record();
    return useShop.persist.onFinishHydration(record);
  }, [product.id, view]);
  function addSelected(buyNow = false) {
    if (!selected || selected.stock < 1) return;
    add(
      { productId: product.id, sizeId: selected.id, quantity },
      selected.stock,
    );
    if (buyNow) {
      close(false);
      router.push(`/${locale}/checkout`);
    }
  }
  return (
    <div className="product-detail">
      <div className="product-gallery">
        <div
          className="product-main-image"
          onTouchStart={(event) => {
            touch.current = event.touches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (touch.current !== null && product.images.length > 1) {
              const delta = event.changedTouches[0].clientX - touch.current;
              if (Math.abs(delta) > 45)
                setImageIndex(
                  (index) =>
                    (index + (delta < 0 ? 1 : -1) + product.images.length) %
                    product.images.length,
                );
            }
            touch.current = null;
          }}
        >
          <ProductImage
            key={imageIndex}
            product={product}
            index={imageIndex}
            sizes="(max-width: 767px) 100vw, 50vw"
            priority
          />
          <button
            className="icon-button zoom-button"
            aria-label={t("Enlarge product image")}
            onClick={() => setZoom(true)}
          >
            <ZoomIn size={20} />
          </button>
        </div>
        <div className="gallery-thumbs">
          {product.images.map((image, index) => (
            <button
              key={image.src}
              aria-label={t(`View image ${index + 1}`)}
              aria-pressed={imageIndex === index}
              onClick={() => setImageIndex(index)}
            >
              <ProductImage product={product} index={index} sizes="70px" />
            </button>
          ))}
        </div>
      </div>
      <div className="product-info">
        {brand && (
          <Link href={`/${locale}/brands/${brand.slug}`} className="text-link">
            {t(brand.name)}
          </Link>
        )}
        <h1>{productName(product, locale)}</h1>
        <p>
          {t(product.concentration)}
          {t(" · ")}
          {t(product.gender)}
        </p>
        {product.rating !== undefined && (product.reviewCount ?? 0) > 0 && (
          <p>
            {t("★ ")}
            {product.rating}
            {t(" · ")}
            {product.reviewCount}
            {t(" reviews ")}
          </p>
        )}
        <p>{productDescription(product, locale)}</p>
        <p className="product-price">
          {t(
            selected
              ? currency(selected.price, locale)
              : "Currently unavailable",
          )}
        </p>
        <p id="size-label">{t("Choose your size")}</p>
        <div className="size-buttons" role="group" aria-labelledby="size-label">
          {product.sizes.map((size) => (
            <button
              key={size.id}
              disabled={size.stock < 1}
              aria-pressed={selectedId === size.id}
              onClick={() => {
                setSelectedId(size.id);
                setQuantity(1);
              }}
            >
              {t(size.label)}
              {t(size.stock < 1 ? " · Sold out" : "")}
            </button>
          ))}
        </div>
        <div className="purchase-row">
          <Quantity
            value={quantity}
            max={Math.min(selected?.stock ?? 0, 99)}
            onChange={setQuantity}
          />
          <button
            className="button"
            disabled={!selected || selected.stock < 1}
            onClick={() => addSelected()}
          >
            {t(selected && selected.stock > 0 ? "Add to bag" : "Out of stock")}
            <Plus size={18} />
          </button>
          <button
            className="icon-button"
            aria-label={t(`${saved ? "Remove from" : "Save to"} wishlist`)}
            aria-pressed={saved}
            onClick={() => toggle(product.id)}
          >
            <Heart size={21} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
        <button
          className="button button-secondary full-width"
          disabled={!selected || selected.stock < 1}
          onClick={() => addSelected(true)}
        >
          {t("Buy now ")}
        </button>
        <details open>
          <summary>{t("About the fragrance")}</summary>
          <p>
            {product.story
              ? t(product.story)
              : productDescription(product, locale)}
          </p>
        </details>
        <details>
          <summary>{t("Fragrance details")}</summary>
          <p>
            {t("Family: ")}
            {t(product.scentFamilies.join(", "))}
            <br />
            {t("Concentration: ")}
            {t(product.concentration)}
            <br />
            {t("Reference: ")}
            {t(product.id)}
          </p>
        </details>
        <details>
          <summary>{t("Delivery & returns")}</summary>
          <p>
            {t(
              "Delivery rates and return terms will be published before ordering opens.",
            )}
            {t(" ")}
            <Link className="text-link" href={`/${locale}/shipping`}>
              {t("View delivery information ")}
            </Link>
          </p>
        </details>
      </div>
      <Dialog
        open={zoom}
        onClose={() => setZoom(false)}
        title={productName(product, locale)}
      >
        <div className="zoom-image">
          <ProductImage product={product} index={imageIndex} sizes="90vw" />
        </div>
      </Dialog>
    </div>
  );
}
