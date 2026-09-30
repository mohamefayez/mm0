import { NextResponse, type NextRequest } from "next/server";
export function proxy(request: NextRequest) {
  const locale = request.nextUrl.pathname.split("/")[1] === "ar" ? "ar" : "en";
  const headers = new Headers(request.headers);
  headers.set("x-asel-locale", locale);
  return NextResponse.next({ request: { headers } });
}
export const config = {
  matcher: [
    "/((?!_next|api|media|products|images|icon.svg|robots.txt|sitemap.xml|favicon.ico).*)",
  ],
};
