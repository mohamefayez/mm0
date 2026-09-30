import { cookies } from "next/headers";
import { z } from "zod";
import { apiError, jsonBody, sameOrigin, requestOrigin } from "@/lib/api";
import {
  createSession,
  isAdmin,
  passwordHash,
  requireAdmin,
  sessionCookie,
  verifyPassword,
} from "@/lib/admin-auth";
import { CommerceError, digest, getStore } from "@/lib/commerce-store";
export const runtime = "nodejs";
export async function GET() {
  return Response.json(
    { authenticated: await isAdmin() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { password } = z
      .object({ password: z.string().min(1).max(200) })
      .parse(await jsonBody(request, 2000));
    const store = getStore();
    if (!store.consumeLimit("admin-login", 10, 900))
      throw new CommerceError("LOGIN_RATE_LIMIT", 429);
    const row = store.db.prepare("SELECT password FROM admin WHERE id=1").get();
    if (!row || !(await verifyPassword(password, String(row.password))))
      throw new CommerceError("INVALID_CREDENTIALS", 401);
    store.db.prepare("DELETE FROM limits WHERE key='admin-login'").run();
    const token = await createSession();
    (await cookies()).set(sessionCookie, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: requestOrigin(request).startsWith("https:"),
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    const jar = await cookies();
    const token = jar.get(sessionCookie)?.value;
    if (token)
      getStore()
        .db.prepare("DELETE FROM sessions WHERE token=?")
        .run(digest(token));
    jar.delete(sessionCookie);
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const { currentPassword, newPassword } = z
      .object({
        currentPassword: z.string().max(200),
        newPassword: z.string().min(12).max(200),
      })
      .parse(await jsonBody(request, 2000));
    const store = getStore();
    if (!store.consumeLimit("admin-password", 5, 900))
      throw new CommerceError("LOGIN_RATE_LIMIT", 429);
    const row = store.db.prepare("SELECT password FROM admin WHERE id=1").get();
    if (!row || !(await verifyPassword(currentPassword, String(row.password))))
      throw new CommerceError("INVALID_CREDENTIALS", 401);
    const hash = await passwordHash(newPassword);
    store.transaction(() => {
      store.db.prepare("UPDATE admin SET password=? WHERE id=1").run(hash);
      store.db.prepare("DELETE FROM sessions").run();
      store.log("admin.password-changed", "admin");
    });
    (await cookies()).delete(sessionCookie);
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
