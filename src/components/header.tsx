"use client";
import { useTranslation } from "@/components/preferences";
import { BrandMark } from "@/components/brand-mark";
import { PreferenceControls } from "@/components/preferences";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Heart,
  ShoppingBag,
  UserRound,
  ArrowRight,
} from "lucide-react";
import { Dialog } from "@/components/dialog";
import { useShop } from "@/store/shop-store";
import { CartContent } from "@/components/shop";
import { site } from "@/lib/config";
import { filterCatalog } from "@/lib/catalog-logic";
import type { Brand, Product } from "@/types/catalog";

const navigation = [
  ["Perfumes", "/perfumes"],
  ["Brands", "/brands"],
  ["For her", "/perfumes?gender=women"],
  ["For him", "/perfumes?gender=men"],
  ["Unisex", "/perfumes?gender=unisex"],
  ["Niche", "/perfumes?category=niche"],
  ["Gifts", "/perfumes?category=gifts"],
  ["Discover", "/discover"],
];
export function Header({
  locale,
  products,
  brands,
  storeMode,
}: {
  locale: string;
  products: Product[];
  brands: Brand[];
  storeMode: "test" | "live" | "paused";
}) {
  const t = useTranslation();

  const [overlay, setOverlay] = useState<"menu" | "search" | null>(null);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const cartOpen = useShop((state) => state.cartOpen);
  const setCartOpen = useShop((state) => state.setCartOpen);
  const items = useShop((state) => state.items);
  const wishlist = useShop((state) => state.wishlist);
  const cartCount = items
    .filter((item) => products.some((product) => product.id === item.productId))
    .reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => {
    void useShop.persist.rehydrate();
  }, []);
  const close = () => setOverlay(null);
  const searchResults = filterCatalog(
    products,
    { q: query },
    Object.fromEntries(brands.map((brand) => [brand.id, brand.name])),
  ).products.slice(0, 4);
  return (
    <>
      <div className="announcement">
        {t(
          storeMode === "test"
            ? "Store preview · Temporary prices · Test orders only"
            : storeMode === "paused"
              ? "Ordering is temporarily paused."
              : site.announcement,
        )}
      </div>
      <header className="header">
        <div className="masthead container">
          <div className="header-left">
            <button
              className="icon-button mobile-menu"
              aria-label={t("Open menu")}
              onClick={() => setOverlay("menu")}
            >
              <Menu size={22} />
            </button>
            <span className="location-label">
              {t("A little luxury, every day.")}
            </span>
            <PreferenceControls />
          </div>
          <Link
            href={`/${locale}`}
            aria-label={t("Asel Cosmetics home")}
            className="brand-logo"
          >
            <BrandMark />
          </Link>
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label={t("Search fragrances")}
              onClick={() => setOverlay("search")}
            >
              <Search size={21} />
            </button>
            <Link
              className="icon-button account-link"
              href={`/${locale}/account`}
              aria-label={t("My account")}
            >
              <UserRound size={21} />
            </Link>
            <Link
              className="icon-button wishlist-link"
              href={`/${locale}/wishlist`}
              aria-label={t(`Wishlist, ${wishlist.length} items`)}
            >
              <Heart size={21} />
              {wishlist.length > 0 && (
                <span className="count">{wishlist.length}</span>
              )}
            </Link>
            <button
              className="icon-button"
              aria-label={t(`Shopping bag, ${cartCount} items`)}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag size={21} />
              {cartCount > 0 && <span className="count">{cartCount}</span>}
            </button>
          </div>
        </div>
        <nav className="desktop-nav" aria-label={t("Main navigation")}>
          {navigation.map(([name, path]) => (
            <Link
              key={name}
              href={`/${locale}${path}`}
              aria-current={
                !path.includes("?") && pathname === `/${locale}${path}`
                  ? "page"
                  : undefined
              }
            >
              {t(name)}
            </Link>
          ))}
        </nav>
      </header>
      <Dialog
        open={overlay === "menu"}
        onClose={close}
        title={t("Explore Asel")}
        side
      >
        <nav className="mobile-nav" aria-label={t("Mobile navigation")}>
          {navigation.map(([name, path]) => (
            <Link key={name} href={`/${locale}${path}`} onClick={close}>
              {t(name)}
              <ArrowRight size={18} />
            </Link>
          ))}
          <Link href={`/${locale}/wishlist`} onClick={close}>
            {t("Wishlist ")}
            <Heart size={18} />
          </Link>
          <Link href={`/${locale}/account`} onClick={close}>
            {t("My account ")}
            <UserRound size={18} />
          </Link>
        </nav>
      </Dialog>
      <Dialog
        open={overlay === "search"}
        onClose={close}
        title={t("Find a fragrance")}
      >
        <form
          action={`/${locale}/search`}
          onSubmit={close}
          className="search-form"
        >
          <label htmlFor="header-search" className="sr-only">
            {t("Search products, brands or notes ")}
          </label>
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder={t("Try oud, rose or your favourite house…")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="icon-button" aria-label={t("Submit search")}>
            <Search size={21} />
          </button>
        </form>
        <p className="muted small-text">{t("Explore by note")}</p>
        <div className="chips">
          {["Oud", "Rose", "Vanilla", "Citrus"].map((note) => (
            <Link
              className="chip"
              key={note}
              href={`/${locale}/perfumes?note=${note.toLowerCase()}`}
              onClick={close}
            >
              {t(note)}
            </Link>
          ))}
        </div>
        {t(
          query.trim() && (
            <div className="search-suggestions" aria-live="polite">
              {searchResults.length ? (
                searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/${locale}/perfumes/${product.slug}`}
                    onClick={close}
                  >
                    {t(product.name)}
                    <ArrowRight size={16} />
                  </Link>
                ))
              ) : (
                <p>
                  {t(
                    products.length
                      ? "No matches yet. Try another name or note."
                      : "Our first collection is coming soon. Explore fragrance notes in the meantime.",
                  )}
                </p>
              )}
            </div>
          ),
        )}
      </Dialog>
      <Dialog
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        title={t("Your shopping bag")}
        side
      >
        <CartContent products={products} locale={locale} drawer />
      </Dialog>
    </>
  );
}
