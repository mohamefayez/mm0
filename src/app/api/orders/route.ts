import { apiError, jsonBody, sameOrigin } from "@/lib/api";
import { CommerceError, digest, getStore } from "@/lib/commerce-store";
import { orderSchema } from "@/lib/commerce-schema";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const input = orderSchema.parse(await jsonBody(request, 20000));
    const store = getStore();
    const exists = store.db
      .prepare("SELECT id FROM orders WHERE idempotency=?")
      .get(input.idempotencyKey);
    if(!exists&&!store.consumeLimit("orders-global",100,600))throw new CommerceError("TOO_MANY_ORDERS",429);
    if (
      !exists &&
      !store.consumeLimit(`order:${digest(input.customer.phone)}`, 5, 3600)
    )
      throw new CommerceError("TOO_MANY_ORDERS", 429);
    return Response.json(store.createOrder(input), {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
