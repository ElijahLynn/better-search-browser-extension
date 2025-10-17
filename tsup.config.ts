import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "background/serviceWorker": "src/background/serviceWorker.ts",
    "content/index": "src/content/index.ts",
    "options/options": "src/options/options.ts"
  },
  format: ["esm"],
  target: "es2020",
  outDir: "dist",
  sourcemap: true,
  clean: true,
  dts: false
});
