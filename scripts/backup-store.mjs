import { backup, DatabaseSync } from "node:sqlite";
import { mkdir, cp } from "node:fs/promises";
import path from "node:path";
const directory = path.resolve(process.env.ASEL_DATA_DIR || "data");
const target = path.join(
  directory,
  "backups",
  new Date().toISOString().replaceAll(":", "-"),
);
await mkdir(target, { recursive: true });
const db = new DatabaseSync(path.join(directory, "asel.sqlite"));
try {
  await backup(db, path.join(target, "asel.sqlite"));
  await cp(path.join(directory, "uploads"), path.join(target, "uploads"), {
    recursive: true,
  }).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
  console.log(`Backup saved: ${target}`);
} finally {
  db.close();
}
