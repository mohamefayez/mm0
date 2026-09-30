import type { CartItem, Product } from "../types/catalog.ts";

export function resolveCart(items: CartItem[], products: Product[]) {
  return items.flatMap((item) => {
    const product = products.find((product) => product.id === item.productId);
    const size = product?.sizes.find((size) => size.id === item.sizeId);
    if (
      !product ||
      !size ||
      size.stock < 1 ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    )
      return [];
    const quantity = Math.min(item.quantity, size.stock, 99);
    return [{ product, size, quantity, total: size.price * quantity }];
  });
}
export function addCartItem(
  items: CartItem[],
  item: CartItem,
  stock: number,
): CartItem[] {
  if (!Number.isInteger(item.quantity) || item.quantity < 1 || stock < 1)
    return items;
  const existing = items.find(
    (line) => line.productId === item.productId && line.sizeId === item.sizeId,
  );
  if (existing)
    return items.map((line) =>
      line === existing
        ? {
            ...line,
            quantity: Math.min(stock, 99, line.quantity + item.quantity),
          }
        : line,
    );
  return [...items, { ...item, quantity: Math.min(stock, 99, item.quantity) }];
}
