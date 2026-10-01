import { cp, mkdir, mkdtemp, readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const base = process.env.PAGES_BASE_PATH ?? "/mm0";
if (!/^\/[a-zA-Z0-9_-]+$/.test(base)) throw new Error("PAGES_BASE_PATH must be a single repository path");
await mkdir(".local", { recursive: true });
const stage = await mkdtemp(path.join(root, ".local", "pages-build-"));
const omitted = ["src/app/api", "src/app/media", "src/app/[locale]/admin", "src/components/admin", "src/lib/admin-auth.ts", "src/lib/api.ts", "src/proxy.ts"];
await cp("src", path.join(stage, "src"), { recursive: true, filter: (source) => !omitted.includes(source.replaceAll("\\", "/")) });
await cp("public", path.join(stage, "public"), { recursive: true });
for (const name of ["package.json", "postcss.config.mjs", "tsconfig.json"]) await cp(name, path.join(stage, name));
const read = (name) => readFile(path.join(stage, name), "utf8");
const write = (name, text) => writeFile(path.join(stage, name), text);
await write("next.config.ts", `export default { output: "export", trailingSlash: true, basePath: ${JSON.stringify(base)}, images: { unoptimized: true }, poweredByHeader: false, devIndicators: false };`);
await write("src/lib/commerce-store.ts", `import { seedProducts, seedBrands } from "@/data/seed-catalog";
import { defaultSettings } from "@/lib/commerce-schema";
const products = seedProducts.filter(p => p.published);
export function getStore() { return { products: () => products, brands: () => seedBrands, settings: () => ({ ...defaultSettings, whatsapp: "201070332568" }) }; }
`);
for (const [template, destination] of [["root-layout.tsx", "src/app/layout.tsx"], ["static-preferences.tsx", "src/components/static-preferences.tsx"], ["checkout-form.tsx", "src/components/checkout-form.tsx"]]) {
  await write(destination, await readFile(`scripts/pages-templates/${template}`, "utf8"));
}
await write("src/app/page.tsx", `"use client";
import Link from "next/link"; import { useEffect } from "react"; import { useRouter } from "next/navigation";
export default function Page() { const router = useRouter(); useEffect(() => { router.replace("/ar/"); }, [router]); return <Link href="/ar/">Asel Cosmetics — دخول المتجر</Link>; }
`);
await write("src/app/[locale]/layout.tsx", (await read("src/app/[locale]/layout.tsx")) + '\nexport function generateStaticParams() { return [{ locale: "ar" }, { locale: "en" }]; }\n');
await write("src/app/[locale]/perfumes/[slug]/page.tsx", (await read("src/app/[locale]/perfumes/[slug]/page.tsx")) + '\nexport async function generateStaticParams() { return (await catalog.all()).map(p => ({ slug: p.slug })); }\n');
await write("src/app/[locale]/brands/[slug]/page.tsx", (await read("src/app/[locale]/brands/[slug]/page.tsx")) + '\nexport async function generateStaticParams() { return (await catalog.brands()).map(b => ({ slug: b.slug })); }\n');
await write("src/app/[locale]/[section]/page.tsx", (await read("src/app/[locale]/[section]/page.tsx")) + '\nexport function generateStaticParams() { return Object.keys(pages).map(section => ({ section })); }\n');
await write("src/app/sitemap.ts", (await read("src/app/sitemap.ts")).replace('"force-dynamic"', '"force-static"'));
await write("src/app/robots.ts", (await read("src/app/robots.ts")) + '\nexport const dynamic = "force-static";\n');
for (const route of ["perfumes", "search", "brands/[slug]"]) {
  const name = `src/app/[locale]/${route}/page.tsx`;
  let text = await read(name);
  text = text.replace('  searchParams,\n', '').replace('params, searchParams }: Props', 'params }: Props');
  text = text.replace(/const \[\{ locale \}, query\] = await Promise\.all\(\[params, searchParams\]\);/, 'const { locale } = await params; const query: CatalogQuery = {};');
  text = text.replace(/const \[\{ locale, slug \}, query\] = await Promise\.all\(\[params, searchParams\]\);/, 'const { locale, slug } = await params; const query: CatalogQuery = {};');
  text = 'import { Suspense } from "react";\n' + text;
  text = text.replace(/(<CatalogView[\s\S]*?\/>)/g, '<Suspense fallback={<p>…</p>}>$1</Suspense>');
  await write(name, text);
}
let view = await read("src/components/catalog-view.tsx");
view = '"use client";\nimport { useSearchParams } from "next/navigation";\nimport { filterCatalog } from "@/lib/catalog-logic";\nimport { getStore } from "@/lib/commerce-store";\n' + view;
view = view.replace('import { catalog } from "@/lib/catalog";', '').replace('export async function CatalogView', 'export function CatalogView').replace('  query,', '  query: fixedQuery,');
view = view.replace('  const t = translator(locale);', '  const t = translator(locale);\n  const search = useSearchParams();\n  const query = { ...Object.fromEntries(search.entries()), ...fixedQuery };');
view = view.replace(/  const \[result, brands, all\] = await Promise\.all\(\[[\s\S]*?\]\);/, '  const all = getStore().products(); const brands = getStore().brands();\n  const result = filterCatalog(all, query, Object.fromEntries(brands.map(b => [b.id, b.name])));');
await write("src/components/catalog-view.tsx", view);
// Public image URLs need the project prefix; Next Link/router add it themselves.
async function patch(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, item.name);
    if (item.isDirectory()) await patch(filename);
    else if (/\.(ts|tsx)$/.test(item.name)) {
      let text = (await readFile(filename, "utf8")).replaceAll('\r\n', '\n');
      text = text.replace(/(["'`])\/(products|images)\//g, `$1${base}/$2/`);
      text = text.replace('url.pathname.replace(/^\\/(en|ar)(?=\\/|$)/,', 'url.pathname.replace(/\\/(en|ar)(?=\\/|$)/,');
      text = text.replace('action={`/${locale}/search`}', `action={\`${base}/\${locale}/search/\`}`);
      await writeFile(filename, text);
    }
  }
}
await patch(path.join(stage, "src"));
await write("src/app/motion.css", (await read("src/app/motion.css")) + '\n.pages-checkout form { display: grid; gap: 20px; max-width: 650px; }\n.pages-checkout label { display: grid; gap: 8px; }\n.pages-checkout input, .pages-checkout textarea { width: 100%; padding: 12px; border: 1px solid var(--line); color: var(--ink); background: var(--paper); border-radius: 6px; }\n');
console.log(`Building GitHub Pages at ${base} in ${stage}`);
const build = spawnSync(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "build", stage, "--webpack"], { stdio: "inherit", env: { ...process.env, NEXT_PUBLIC_SITE_URL: `https://mohamefayez.github.io${base}` } });
if (build.status !== 0) process.exit(build.status || 1);
await writeFile(path.join(stage, "out", ".nojekyll"), "");
await mkdir("pages-out", { recursive: true });
await cp(path.join(stage, "out"), "pages-out", { recursive: true });
console.log("GitHub Pages build ready in pages-out/");
