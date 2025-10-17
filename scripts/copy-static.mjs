import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");
const distDir = resolve(root, "dist");

if (!existsSync(publicDir)) {
  console.error("public directory not found, skipping static copy");
  process.exit(0);
}

mkdirSync(distDir, { recursive: true });
cpSync(publicDir, distDir, { recursive: true });
console.info("Copied static assets from public/ to dist/");
