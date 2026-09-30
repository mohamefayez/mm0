"use client";
import { useTranslation } from "@/components/preferences";
import { useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Dialog } from "@/components/dialog";
import { notes } from "@/data/catalog";
import type { Brand } from "@/types/catalog";

const sortOptions = [
  ["featured", "Featured"],
  ["newest", "Newest"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["bestselling", "Best selling"],
  ["rating", "Top rated"],
];
const groups = [
  {
    key: "gender",
    name: "For whom",
    values: [
      ["women", "For her"],
      ["men", "For him"],
      ["unisex", "Unisex"],
    ],
  },
  {
    key: "concentration",
    name: "Concentration",
    values: [
      ["EDP", "Eau de Parfum"],
      ["EDT", "Eau de Toilette"],
      ["Extrait", "Extrait de Parfum"],
      ["Parfum", "Parfum"],
      ["Cologne", "Cologne"],
    ],
  },
  {
    key: "family",
    name: "Scent family",
    values: [
      "fresh",
      "floral",
      "woody",
      "sweet",
      "amber",
      "oud",
      "musky",
      "leather",
    ].map((value) => [value, value.charAt(0).toUpperCase() + value.slice(1)]),
  },
  {
    key: "note",
    name: "Fragrance note",
    values: notes.map((note) => [note.slug, note.name]),
  },
  {
    key: "occasion",
    name: "Occasion",
    values: [
      ["daily", "Every day"],
      ["office", "At the office"],
      ["evening", "Evenings"],
      ["special", "Special occasions"],
    ],
  },
  {
    key: "season",
    name: "Season",
    values: [
      ["spring", "Spring"],
      ["summer", "Summer"],
      ["autumn", "Autumn"],
      ["winter", "Winter"],
    ],
  },
  {
    key: "size",
    name: "Size",
    values: ["30", "50", "75", "100", "150", "200"].map((value) => [
      value,
      `${value} ml`,
    ]),
  },
  { key: "stock", name: "Availability", values: [["in-stock", "In stock"]] },
];
function useFilters() {
  const urlSearch = useSearchParams();
  const [optimisticSearch, setOptimisticSearch] = useOptimistic(
    urlSearch.toString(),
  );
  const search = new URLSearchParams(optimisticSearch);
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const update = (key: string, value: string) => {
    const params = new URLSearchParams(search.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => {
      setOptimisticSearch(params.toString());
      router.push(`${pathname}${params.size ? `?${params}` : ""}`, {
        scroll: false,
      });
    });
  };
  return {
    search,
    update,
    pending,
    clear: () =>
      startTransition(() => {
        setOptimisticSearch("");
        router.push(pathname, { scroll: false });
      }),
  };
}
function FilterPanel({ brands, suffix }: { brands: Brand[]; suffix: string }) {
  const t = useTranslation();

  const { search, update, clear, pending } = useFilters();
  return (
    <div aria-busy={pending}>
      <button onClick={clear} className="text-link">
        {t("Clear all filters ")}
      </button>
      {[
        groups[0],
        {
          key: "brand",
          name: "Brand",
          values: brands.map((brand) => [brand.id, brand.name]),
        },
        ...groups.slice(1),
      ].map((group, index) => (
        <details
          className="filter-group"
          key={group.key}
          open={index < 2 || !!search.get(group.key)}
        >
          <summary>{t(group.name)}</summary>
          <div className="filter-options">
            {group.values.length ? (
              group.values.map(([value, label]) => (
                <label key={value} className="filter-option">
                  <input
                    type="checkbox"
                    name={`${suffix}-${group.key}`}
                    checked={search.get(group.key) === value}
                    onChange={(event) =>
                      update(group.key, event.target.checked ? value : "")
                    }
                  />
                  {t(label)}
                </label>
              ))
            ) : (
              <p className="muted small-text">
                {t(
                  "Our fragrance houses will be revealed with the collection. ",
                )}
              </p>
            )}
          </div>
        </details>
      ))}
      <details
        className="filter-group"
        open={!!search.get("min") || !!search.get("max")}
      >
        <summary>{t("Price in EGP")}</summary>
        <form
          className="filter-options"
          key={`${search.get("min")}-${search.get("max")}`}
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const min = String(data.get("min") ?? "");
            const max = String(data.get("max") ?? "");
            if (min && max && Number(min) > Number(max)) {
              const input = event.currentTarget.elements.namedItem(
                "max",
              ) as HTMLInputElement;
              input.setCustomValidity(
                t("Maximum price must be at least the minimum price."),
              );
              input.reportValidity();
              return;
            }
            const params = new URLSearchParams(search.toString());
            if (min) params.set("min", min);
            else params.delete("min");
            if (max) params.set("max", max);
            else params.delete("max");
            params.delete("page");
            window.location.search = params.toString();
          }}
        >
          <div className="price-filter">
            <label>
              {t("Min ")}
              <input
                name="min"
                type="number"
                min="0"
                defaultValue={search.get("min") ?? ""}
              />
            </label>
            <label>
              {t("Max ")}
              <input
                name="max"
                type="number"
                min="0"
                defaultValue={search.get("max") ?? ""}
                onInput={(event) => event.currentTarget.setCustomValidity("")}
              />
            </label>
          </div>
          <button className="button button-secondary">
            {t("Apply price")}
          </button>
        </form>
      </details>
    </div>
  );
}
export function FilterSidebar({ brands }: { brands: Brand[] }) {
  const t = useTranslation();

  return (
    <aside className="filter-sidebar" aria-label={t("Filter fragrances")}>
      <FilterPanel brands={brands} suffix="desktop" />
    </aside>
  );
}
export function CatalogToolbar({
  total,
  brands,
}: {
  total: number;
  brands: Brand[];
}) {
  const t = useTranslation();

  const { search, update, pending } = useFilters();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="catalog-toolbar">
        <span aria-live="polite">
          {t(
            pending
              ? "Updating…"
              : `${total} fragrance${total === 1 ? "" : "s"}`,
          )}
        </span>
        <button className="mobile-filter-toggle" onClick={() => setOpen(true)}>
          <SlidersHorizontal size={16} />
          {t("Filters ")}
        </button>
        <label className="catalog-sort">
          <span>{t("Sort by")}</span>
          <select
            aria-label={t("Sort fragrances")}
            value={search.get("sort") || "featured"}
            onChange={(event) => update("sort", event.target.value)}
          >
            {sortOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {t(label)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("Filter fragrances")}
        side
      >
        <FilterPanel brands={brands} suffix="mobile" />
        <button className="button full-width" onClick={() => setOpen(false)}>
          {t(`Show ${total} fragrances`)}
        </button>
      </Dialog>
    </>
  );
}
export function ActiveFilters({ brands }: { brands: Brand[] }) {
  const t = useTranslation();

  const { search, update, clear } = useFilters();
  const entries = [...search.entries()].filter(([key]) =>
    [
      "q",
      "gender",
      "brand",
      "concentration",
      "category",
      "family",
      "note",
      "occasion",
      "season",
      "size",
      "stock",
      "min",
      "max",
      "collection",
    ].includes(key),
  );
  return entries.length ? (
    <div className="chips active-filters" aria-label={t("Active filters")}>
      {entries.map(([key, value]) => (
        <button
          className="chip"
          key={key}
          onClick={() => update(key, "")}
          aria-label={t(`Remove ${t(key)}: ${t(value)} filter`)}
        >
          {t(
            key === "brand"
              ? (brands.find((brand) => brand.id === value)?.name ?? value)
              : `${t(key)}: ${t(value)}`,
          )}
          <X size={12} />
        </button>
      ))}
      <button className="text-link" onClick={clear}>
        {t("Clear all ")}
      </button>
    </div>
  ) : null;
}
