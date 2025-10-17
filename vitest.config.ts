import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const rootDir = resolve(fileURLToPath(new URL(".", import.meta.url)));

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    coverage: {
      enabled: false
    }
  },
  resolve: {
    alias: {
      "@shared": resolve(rootDir, "src/shared")
    }
  }
});
