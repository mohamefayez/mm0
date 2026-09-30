import { z } from "zod";
import { checkoutSchema, governorates } from "./checkout.ts";
import { validWhatsAppNumber } from "./whatsapp-order.ts";

const money = z
  .number()
  .min(0)
  .max(1_000_000)
  .refine(
    (n) => Number.isInteger(Math.round(n * 10000) / 100),
    "Use at most two decimal places.",
  );
const text = z.string().trim().max(4000);
export const productSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,80}$/),
  slug: z.string().regex(/^[a-z0-9-]{1,100}$/),
  name: z.string().trim().min(2).max(150),
  nameAr: text.default(""),
  brandId: z.string().regex(/^[a-z0-9-]{1,80}$/),
  gender: z.enum(["men", "women", "unisex"]),
  concentration: z.enum([
    "EDP",
    "EDT",
    "Extrait",
    "Cologne",
    "Parfum",
    "Unconfirmed",
  ]),
  description: text,
  descriptionAr: text.default(""),
  story: text.optional(),
  scentFamilies: z.array(z.string().max(50)).max(15),
  topNotes: z.array(z.string().max(50)).max(15),
  heartNotes: z.array(z.string().max(50)).max(15),
  baseNotes: z.array(z.string().max(50)).max(15),
  occasions: z.array(z.string().max(50)).max(15),
  seasons: z.array(z.string().max(50)).max(15),
  projection: z.enum(["soft", "moderate", "strong"]),
  categories: z.array(z.string().max(50)).max(15),
  sizes: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]{1,60}$/),
        label: z.string().trim().min(1).max(80),
        ml: z.number().int().min(0).max(5000),
        price: money,
        stock: z.number().int().min(0).max(100000),
      }),
    )
    .min(1)
    .max(20)
    .refine(
      (a) => new Set(a.map((s) => s.id)).size === a.length,
      "Size IDs must be unique.",
    ),
  images: z
    .array(
      z.object({
        src: z.string().regex(/^\/(products|media)\/[a-zA-Z0-9._-]+$/),
        alt: z.string().max(250),
      }),
    )
    .min(1)
    .max(12),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  published: z.boolean(),
  approved: z.boolean(),
  revision: z.number().int().min(0),
  createdAt: z.string().max(40),
});
export const settingsSchema = z.object({
  mode: z.enum(["test", "live", "paused"]),
  codEnabled: z.boolean(),
  phone: z
    .string()
    .max(30)
    .regex(/^[+\d\s()-]*$/),
  whatsapp: z.string().refine((value) => value === "" || validWhatsAppNumber(value)),
  email: z.union([z.literal(""), z.email()]),
  address: text,
  shippingText: text,
  shippingTextAr: text,
  returnsText: text,
  returnsTextAr: text,
  privacyText: text,
  privacyTextAr: text,
  termsText: text,
  termsTextAr: text,
  businessConfirmed: z.boolean(),
  freeShippingThreshold: money.nullable(),
  shippingRates: z
    .array(
      z.object({
        governorate: z.enum(governorates),
        fee: money,
        enabled: z.boolean(),
      }),
    )
    .length(governorates.length)
    .refine(
      (a) => new Set(a.map((r) => r.governorate)).size === governorates.length,
    ),
  revision: z.number().int().min(0),
});
export type StoreSettings = z.infer<typeof settingsSchema>;
export const orderSchema = z.object({
  customer: checkoutSchema,
  items: z
    .array(
      z.object({
        productId: z.string().max(80),
        sizeId: z.string().max(60),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
  idempotencyKey: z.uuid(),
  expectedTotal: money,
  expectedMode: z.enum(["test", "live"]),
  payment: z.enum(["cod", "whatsapp"]),
});
export type OrderInput = z.infer<typeof orderSchema>;
export const orderStatuses = [
  "new",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];
export type OrderRecord = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  test: boolean;
  payment: "cod" | "whatsapp";
  customer: OrderInput["customer"];
  items: {
    productId: string;
    sizeId: string;
    name: string;
    label: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
};
export const defaultSettings: StoreSettings = {
  mode: "test",
  codEnabled: true,
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  shippingText: "",
  shippingTextAr: "",
  returnsText: "",
  returnsTextAr: "",
  privacyText: "",
  privacyTextAr: "",
  termsText: "",
  termsTextAr: "",
  businessConfirmed: false,
  freeShippingThreshold: null,
  shippingRates: governorates.map((governorate) => ({
    governorate,
    fee: ["Cairo", "Giza"].includes(governorate)
      ? 65
      : governorate === "Alexandria"
        ? 85
        : 100,
    enabled: true,
  })),
  revision: 0,
};
export function deliveryFee(
  settings: StoreSettings,
  governorate: string,
  subtotal: number,
) {
  const rate = settings.shippingRates.find(
    (r) => r.governorate === governorate && r.enabled,
  );
  if (!rate) return null;
  return settings.freeShippingThreshold !== null &&
    subtotal >= settings.freeShippingThreshold
    ? 0
    : rate.fee;
}
