import { ZodError } from "zod";
import { CommerceError } from "./commerce-store";
export function requestOrigin(request: Request) {
  if (process.env.ASEL_PUBLIC_ORIGIN) return new URL(process.env.ASEL_PUBLIC_ORIGIN).origin;
  const url = new URL(request.url);
  return `${url.protocol}//${request.headers.get("host") || url.host}`;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== requestOrigin(request))
    throw new CommerceError("INVALID_ORIGIN", 403);
}
export async function jsonBody(request: Request, limit = 150_000) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new CommerceError("INVALID_CONTENT_TYPE", 415);
  const body = await bytesBody(request, limit);
  try {
    return JSON.parse(body.toString("utf8"));
  } catch {
    throw new CommerceError("INVALID_JSON");
  }
}
export async function bytesBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length") || 0) > limit)
    throw new CommerceError("BODY_TOO_LARGE", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new CommerceError("INVALID_BODY");
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > limit) {
      await reader.cancel();
      throw new CommerceError("BODY_TOO_LARGE", 413);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export function apiError(error: unknown) {
  // Next route bundles can share a cached store created by a different bundle.
  // Match the stable error name as well as its local class identity.
  if (error instanceof CommerceError || (error instanceof Error && error.name === "CommerceError" && "code" in error && "status" in error)) {
    const failure = error as CommerceError;
    return Response.json(
      { error: failure.code },
      { status: failure.status, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (error instanceof ZodError || (error instanceof Error && error.name === "ZodError" && "issues" in error && Array.isArray(error.issues))) {
    const failure = error as ZodError;
    return Response.json(
      {
        error: "INVALID_INPUT",
        fields: failure.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }
  console.error(
    "Commerce request failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return Response.json({ error: "SERVER_ERROR" }, { status: 500 });
}
