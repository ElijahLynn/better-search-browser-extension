import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const rootDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
const extensionPath = resolve(rootDir, "dist");

export default defineConfig({
  testDir: "./tests/integration",
  fullyParallel: false,
  reporter: "list",
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: "on-first-retry",
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium-extension",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`
          ]
        }
      }
    }
  ]
});
