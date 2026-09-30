import { z } from "zod";
import { apiError, jsonBody, sameOrigin } from "@/lib/api";
import { requireAdmin } from "@/lib/admin-auth";
import { CommerceError, getStore } from "@/lib/commerce-store";
import { orderStatuses } from "@/lib/commerce-schema";
import { readdir } from "node:fs/promises";
import path from "node:path";
export const runtime = "nodejs";
export async function GET() {
  try {
    await requireAdmin();
    const store = getStore();
    const files = await readdir(
      path.join(process.cwd(), "public/products"),
    ).catch(() => []);
    const uploads = await readdir(
      path.join(process.env.ASEL_DATA_DIR || "data", "uploads"),
    ).catch(() => []);
    return Response.json(
      {
        products: store.products(true),
        brands: store.brands(),
        orders: store.orders(),
        settings: store.settings(),
        media: [
          ...files.map((f) => `/products/${f}`),
          ...uploads.map((f) => `/media/${f}`),
        ],
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const body = z.object({resource:z.string(),data:z.unknown()}).parse(await jsonBody(request));
    const store = getStore();
    if (body.resource === "product")
      return Response.json({ product: store.saveProduct(body.data) });
    if (body.resource === "settings")
      return Response.json({ settings: store.saveSettings(body.data) });
    if (body.resource === "order") {
      const d = z
        .object({
          id: z.string().max(80),
          status: z.enum(orderStatuses),
          expectedStatus: z.enum(orderStatuses),
        })
        .parse(body.data);
      return Response.json({
        order: store.updateOrder(d.id, d.status, d.expectedStatus),
      });
    }
    if (body.resource === "brand") {
      const brand = z
        .object({
          id: z.string().regex(/^[a-z0-9-]{1,80}$/),
          slug: z.string().regex(/^[a-z0-9-]{1,80}$/),
          name: z.string().trim().min(2).max(150),
          description: z.string().max(2000),
        })
        .parse(body.data);
      store.saveBrand(brand);
      return Response.json({ ok: true });
    }
    throw new CommerceError("INVALID_RESOURCE");
  } catch (error) {
    return apiError(error);
  }
}
