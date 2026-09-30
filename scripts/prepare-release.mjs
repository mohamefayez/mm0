import { mkdir, readdir, copyFile, readFile, writeFile, lstat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const target = path.join(root, ".local", `github-release-${Date.now()}`);
const folders = ["src", "public", "scripts", "tests", "deploy", "docs"];
const files = ["package.json", "package-lock.json", "next.config.ts", "next-env.d.ts", "tsconfig.json", "postcss.config.mjs", "eslint.config.mjs", "playwright.config.ts", ".gitignore", ".dockerignore", ".env.example", "Dockerfile", "compose.yaml", "README.md", "AGENTS.md", "IMPLEMENTATION-PLAN.md"];
async function collect(directory) {
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = `${directory}/${entry.name}`;
    if (relative === "docs/screenshots") continue;
    if (entry.isSymbolicLink()) throw new Error(`Refusing symbolic link: ${relative}`);
    if (entry.isDirectory()) await collect(relative);
    else files.push(relative);
  }
}
for (const directory of folders) await collect(directory);
for (const file of files) {
  if (/^data\//.test(file) || /(^|\/)(\.local|node_modules|\.next|\.git)(\/|$)|\.sqlite|admin-access|\.log$/.test(file)) {
    throw new Error(`Private path in release: ${file}`);
  }
  const source = path.join(root, file);
  if ((await lstat(source)).isSymbolicLink()) throw new Error(`Refusing symbolic link: ${file}`);
  if (/\.(tsx?|mjs|json|md|ya?ml)$/.test(file)) {
    const content = await readFile(source, "utf8");
    if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{30,}/.test(content)) {
      throw new Error(`Possible credential in ${file}; review before publishing.`);
    }
  }
  const destination = path.join(target, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}
await writeFile(path.join(root, ".local", "github-release.json"), JSON.stringify({ directory: target, files }, null, 2));
console.log(`Prepared ${files.length} files without local databases or administrator credentials.\n${target}`);
