import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError, bytesBody, sameOrigin } from "@/lib/api";
import { CommerceError } from "@/lib/commerce-store";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const type = request.headers.get("content-type") || "";
    if (!type.startsWith("multipart/form-data"))
      throw new CommerceError("INVALID_CONTENT_TYPE", 415);
    const bytes = await bytesBody(request, 8 * 1024 * 1024);
    const form = await new Response(new Uint8Array(bytes), {
      headers: { "Content-Type": type },
    }).formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new CommerceError("INVALID_IMAGE");
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
      ? "jpeg"
      : buffer
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        ? "png"
        : buffer.toString("ascii", 0, 4) === "RIFF" &&
            buffer.toString("ascii", 8, 12) === "WEBP"
          ? "webp"
          : null;
    if (!ext) throw new CommerceError("INVALID_IMAGE");
    const filename = `${randomUUID()}.${ext}`;
    const directory = path.join(process.env.ASEL_DATA_DIR || "data", "uploads");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), buffer, { flag: "wx" });
    return Response.json({ src: `/media/${filename}` });
  } catch (error) {
    return apiError(error);
  }
}
