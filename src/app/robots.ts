import type { MetadataRoute } from "next";
// Keep the unfinished store out of search engines until the owner approves launch.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
