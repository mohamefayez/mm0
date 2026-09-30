import { mkdir } from "node:fs/promises";
import { randomBytes, scryptSync } from "node:crypto";
import path from "node:path";
import { CommerceStore } from "../src/lib/commerce-store.ts";
const directory = path.resolve(".local/e2e-data");
if (path.resolve(process.env.ASEL_DATA_DIR || "") !== directory)
  throw new Error("E2E database directory must be .local/e2e-data");
await mkdir(directory, { recursive: true });
const filename = path.join(directory, "asel.sqlite");
const store = new CommerceStore(filename);
store.db.exec(
  "DELETE FROM products; DELETE FROM brands; DELETE FROM orders; DELETE FROM metadata; DELETE FROM admin; DELETE FROM sessions; DELETE FROM limits; DELETE FROM audit;",
);
store.db.close();
const fresh = new CommerceStore(filename);
fresh.saveSettings({ ...fresh.settings(), whatsapp: "201000000000" });
const salt = randomBytes(16).toString("hex");
fresh.db
  .prepare("INSERT INTO admin VALUES(1,?)")
  .run(
    `${salt}:${scryptSync("Asel-Browser-Test-Only!", salt, 64).toString("hex")}`,
  );
fresh.db.close();
console.log("Prepared isolated browser test database.");
