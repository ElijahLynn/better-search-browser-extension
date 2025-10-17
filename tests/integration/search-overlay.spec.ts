import { test, expect } from "@playwright/test";

const isMac = process.platform === "darwin";
const toggleShortcut = isMac ? "Meta+Shift+F" : "Control+Shift+F";

const demoPage = `data:text/html,<!DOCTYPE html><html><head><title>Better Search Test</title></head><body><main><p>Foo fighters find foo faster than FOO bar.</p></main></body></html>`;

test.describe.configure({ mode: "serial" });

test("opens overlay and highlights regex matches", async ({ page }) => {
  await page.goto(demoPage);
  await page.keyboard.press(toggleShortcut);
  const overlay = page.locator("#better-search-overlay");
  await expect(overlay).toBeVisible();

  await page.keyboard.type("foo");
  const highlights = page.locator(".better-search-highlight");
  await expect(highlights).toHaveCount(3);

  await page.keyboard.press("Enter");
  await expect(overlay.locator("[data-counter]")).toHaveText(/2 of 3/);
});
