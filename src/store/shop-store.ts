"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { addCartItem } from "@/lib/cart-logic";
import type { CartItem } from "@/types/catalog";

type ShopState = {
  items: CartItem[];
  wishlist: string[];
  recent: string[];
  cartOpen: boolean;
  add: (item: CartItem, stock: number) => void;
  update: (
    productId: string,
    sizeId: string,
    quantity: number,
    stock: number,
  ) => void;
  remove: (productId: string, sizeId: string) => void;
  toggleWishlist: (id: string) => void;
  view: (id: string) => void;
  setCartOpen: (open: boolean) => void;
  clearCart: () => void;
};
export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      items: [],
      wishlist: [],
      recent: [],
      cartOpen: false,
      add: (item, stock) =>
        set((state) => ({
          items: addCartItem(state.items, item, stock),
          cartOpen: stock > 0,
        })),
      update: (productId, sizeId, quantity, stock) =>
        set((state) => ({
          items:
            Number.isInteger(quantity) && quantity > 0
              ? state.items.map((item) =>
                  item.productId === productId && item.sizeId === sizeId
                    ? { ...item, quantity: Math.min(quantity, stock, 99) }
                    : item,
                )
              : state.items,
        })),
      remove: (productId, sizeId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.productId !== productId || item.sizeId !== sizeId,
          ),
        })),
      toggleWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.includes(id)
            ? state.wishlist.filter((value) => value !== id)
            : [...state.wishlist, id],
        })),
      view: (id) =>
        set((state) => ({
          recent: [id, ...state.recent.filter((value) => value !== id)].slice(
            0,
            8,
          ),
        })),
      setCartOpen: (cartOpen) => set({ cartOpen }),
      clearCart: () => set({ items: [], cartOpen: false }),
    }),
    {
      name: "asel-shop-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ items, wishlist, recent }) => ({
        items,
        wishlist,
        recent,
      }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const raw = persisted as Record<string, unknown>;
        const stringList = (value: unknown) =>
          Array.isArray(value)
            ? value
                .filter((id): id is string => typeof id === "string")
                .slice(0, 100)
            : [];
        const items: CartItem[] = Array.isArray(raw.items)
          ? raw.items
              .filter(
                (item): item is CartItem =>
                  item &&
                  typeof item === "object" &&
                  typeof item.productId === "string" &&
                  typeof item.sizeId === "string" &&
                  Number.isInteger(item.quantity) &&
                  item.quantity > 0 &&
                  item.quantity <= 99,
              )
              .slice(0, 100)
          : [];
        const uniqueItems = items.filter(
          (item, index) =>
            items.findIndex(
              (other) =>
                other.productId === item.productId &&
                other.sizeId === item.sizeId,
            ) === index,
        );
        return {
          ...current,
          items: uniqueItems,
          wishlist: [...new Set(stringList(raw.wishlist))],
          recent: [...new Set(stringList(raw.recent))].slice(0, 8),
        };
      },
    },
  ),
);
