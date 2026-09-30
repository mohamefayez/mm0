import { readFile } from "node:fs/promises";
import path from "node:path";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (!/^[a-f0-9-]{36}\.(jpeg|png|webp)$/.test(file))
    return new Response(null, { status: 404 });
  try {
    const body = await readFile(
      path.join(process.env.ASEL_DATA_DIR || "data", "uploads", file),
    );
    return new Response(body, {
      headers: {
        "Content-Type": file.endsWith("png")
          ? "image/png"
          : file.endsWith("webp")
            ? "image/webp"
            : "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
