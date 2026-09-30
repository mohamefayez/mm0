"use client";
import { useTranslation } from "@/components/preferences";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useShop } from "@/store/shop-store";
import { resolveCart } from "@/lib/cart-logic";
import { currency, site } from "@/lib/config";
import { EmptyState, ButtonLink } from "@/components/ui";
import { ProductImage, ProductGrid } from "@/components/product-card";
import { productName } from "@/lib/product-copy";
import type { Brand, Product } from "@/types/catalog";
import Link from "next/link";

export function Quantity({
  value,
  max,
  onChange,
  label = "Quantity",
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
}) {
  const t = useTranslation();

  return (
    <div className="quantity" role="group" aria-label={t(label)}>
      <button
        className="icon-button"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        aria-label={t(`Decrease ${label.toLowerCase()}`)}
      >
        <Minus size={15} />
      </button>
      <output aria-live="polite">{value}</output>
      <button
        className="icon-button"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        aria-label={t(`Increase ${label.toLowerCase()}`)}
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
export function CartContent({
  products,
  locale,
  drawer = false,
}: {
  products: Product[];
  locale: string;
  drawer?: boolean;
}) {
  const t = useTranslation();

  const items = useShop((state) => state.items);
  const update = useShop((state) => state.update);
  const remove = useShop((state) => state.remove);
  const close = useShop((state) => state.setCartOpen);
  const lines = resolveCart(items, products);
  const subtotal = lines.reduce((total, line) => total + line.total, 0);
  if (!lines.length)
    return (
      <div
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) close(false);
        }}
      >
        <EmptyState
          title={t("A little room for something lovely.")}
          description={t(
            "Your bag is empty. Explore the collection and find a fragrance to make your own.",
          )}
          href={`/${locale}/perfumes`}
          action={t("Explore fragrances")}
          compact={drawer}
        />
      </div>
    );
  return (
    <div className={drawer ? "cart-drawer-content" : "cart-layout"}>
      <div className="cart-lines">
        {lines.map(({ product, size, quantity, total }) => (
          <article key={`${product.id}-${size.id}`} className="cart-line">
            <Link
              href={`/${locale}/perfumes/${product.slug}`}
              className="cart-image"
              onClick={() => close(false)}
            >
              <ProductImage product={product} sizes="96px" />
            </Link>
            <div>
              <Link
                href={`/${locale}/perfumes/${product.slug}`}
                onClick={() => close(false)}
              >
                <h3>{productName(product, locale)}</h3>
              </Link>
              <p className="muted small-text">
                {t(size.label)}
                {t(" · ")}
                {t(product.concentration)}
              </p>
              <Quantity
                value={quantity}
                max={Math.min(size.stock, 99)}
                label={t(`${product.name} quantity`)}
                onChange={(value) =>
                  update(product.id, size.id, value, size.stock)
                }
              />
            </div>
            <div className="cart-line-end">
              <span>{t(currency(total, locale))}</span>
              <button
                className="icon-button"
                aria-label={t(`Remove ${product.name} ${size.label}`)}
                onClick={() => remove(product.id, size.id)}
              >
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <aside className="order-summary">
        <h2>{t("Your order")}</h2>
        <div className="summary-row">
          <span>{t("Subtotal")}</span>
          <strong>{t(currency(subtotal, locale))}</strong>
        </div>
        <div className="summary-row">
          <span>{t("Delivery")}</span>
          <span>
            {t(
              site.shippingFee === null
                ? "To be confirmed"
                : currency(site.shippingFee, locale),
            )}
          </span>
        </div>
        {site.freeShippingThreshold !== null && (
          <p className="small-text">
            {t(
              subtotal >= site.freeShippingThreshold
                ? "Your order qualifies for free delivery."
                : `${currency(site.freeShippingThreshold - subtotal, locale)} away from free delivery.`,
            )}
          </p>
        )}
        <p className="muted small-text">
          {t(
            "Delivery is calculated at checkout. Your bag is saved on this device.",
          )}
        </p>
        <div onClick={() => close(false)}>
          <ButtonLink href={`/${locale}/checkout`}>
            {t("Continue to checkout ")}
          </ButtonLink>
          {drawer && (
            <Link href={`/${locale}/cart`} className="text-link">
              {t("View shopping bag ")}
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
export function Wishlist({
  products,
  brands,
  locale,
}: {
  products: Product[];
  brands: Brand[];
  locale: string;
}) {
  const t = useTranslation();

  const ids = useShop((state) => state.wishlist);
  const saved = products.filter((product) => ids.includes(product.id));
  return saved.length ? (
    <ProductGrid products={saved} brands={brands} locale={locale} />
  ) : (
    <EmptyState
      title={t("Keep the scents you love close.")}
      description={t(
        "Tap the heart on a fragrance to save it here. Your favourites stay on this device, with no account needed.",
      )}
      href={`/${locale}/perfumes`}
      action={t("Explore fragrances")}
    />
  );
}
export function RecentlyViewed({
  products,
  brands,
  locale,
}: {
  products: Product[];
  brands: Brand[];
  locale: string;
}) {
  const t = useTranslation();

  const ids = useShop((state) => state.recent);
  const viewed = ids
    .flatMap((id) => {
      const product = products.find((product) => product.id === id);
      return product ? [product] : [];
    })
    .slice(0, 4);
  return viewed.length > 0 ? (
    <section className="section container">
      <h2 className="section-title">{t("A second look")}</h2>
      <ProductGrid products={viewed} brands={brands} locale={locale} />
    </section>
  ) : null;
}
