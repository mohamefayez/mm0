import type { OrderRecord } from "./commerce-schema.ts";

export function validWhatsAppNumber(number: string) {
  return /^[1-9]\d{7,14}$/.test(number) &&
    (!number.startsWith("20") || /^201[0125]\d{8}$/.test(number));
}

export function whatsappOrderUrl(number: string, order: OrderRecord) {
  if (!validWhatsAppNumber(number)) throw new Error("Invalid WhatsApp number");
  const c = order.customer;
  const money = (value: number) => `${value.toFixed(2)} EGP`;
  const message = [
    `Asel Cosmetics — طلب / Order ${order.id}`,
    ...(order.test ? ["طلب تجريبي فقط / TEST ORDER — no fulfilment"] : []),
    "",
    ...order.items.map((item) => `${item.name} (${item.label}) × ${item.quantity} — ${money(item.unitPrice)} / وحدة — ${money(item.total)}`),
    "",
    `المنتجات / Subtotal: ${money(order.subtotal)}`,
    `الشحن / Delivery: ${money(order.shipping)}`,
    `الإجمالي / Total: ${money(order.total)}`,
    "",
    `الاسم / Name: ${c.name}`,
    `الهاتف / Phone: ${c.phone}`,
    `Email: ${c.email}`,
    `العنوان / Address: ${c.governorate}, ${c.city}, ${c.street}, ${c.building}`,
    ...(c.floor ? [`الدور / Floor: ${c.floor}`] : []),
    ...(c.apartment ? [`الشقة / Apartment: ${c.apartment}`] : []),
    ...(c.notes ? [`ملاحظات / Notes: ${c.notes}`] : []),
    "",
    "برجاء تأكيد الطلب والتوصيل / Please confirm the order and delivery.",
  ].join("\n");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
