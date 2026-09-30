import { access, mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { randomBytes, scryptSync } from "node:crypto";
import path from "node:path";
import { getStore } from "../src/lib/commerce-store.ts";
await mkdir("public/products", { recursive: true });
const { assets } = JSON.parse(
  await readFile("docs/product-assets.json", "utf8"),
);
for (const asset of assets) {
  const destination = `public/products/${asset.id}.jpeg`;
  try {
    await access(destination);
  } catch {
    await copyFile(asset.source, destination);
  }
}
const store = getStore();
// Fresh deployments receive the owner's confirmed contact, without replacing edits.
if (!store.settings().whatsapp) {
  store.saveSettings({ ...store.settings(), whatsapp: "201070332568" });
}
if (!store.db.prepare("SELECT id FROM admin WHERE id=1").get()) {
  const password = randomBytes(18).toString("base64url");
  const salt = randomBytes(16).toString("hex");
  store.db
    .prepare("INSERT INTO admin VALUES(1,?)")
    .run(`${salt}:${scryptSync(password, salt, 64).toString("hex")}`);
  await mkdir(".local", { recursive: true });
  await writeFile(
    ".local/admin-access.txt",
    `Asel Cosmetics — local admin access\nURL: http://127.0.0.1:3000/ar/admin\nPassword: ${password}\n\nChange this password in Admin > Settings after signing in.\nThis file is private and excluded from Git. Never upload it to public hosting.\n`,
    { mode: 0o600 },
  );
  console.log(
    "Admin created. Open .local/admin-access.txt for your private login.",
  );
} else console.log("Existing admin and catalog preserved.");
console.log(
  `${assets.length} source photos copied; ${store.products().length} published products, ${store.products(true).filter((p) => !p.published).length} drafts. Database: ${path.resolve(process.env.ASEL_DATA_DIR || "data", "asel.sqlite")}`,
);
store.db.close();
