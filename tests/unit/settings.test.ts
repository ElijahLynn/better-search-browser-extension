import { describe, expect, it } from "vitest";
import { getDefaultSettings, loadSettings, saveSettings } from "../../src/shared/settings";
import { normalizeShortcut } from "../../src/shared/shortcuts";

describe("settings storage", () => {
  it("returns default settings when storage empty", async () => {
    const settings = await loadSettings();
    expect(settings.shortcut).toEqual(getDefaultSettings().shortcut);
  });

  it("persists and retrieves updated shortcut", async () => {
    const custom = normalizeShortcut({ key: "G", ctrlKey: true, altKey: false, metaKey: false, shiftKey: true });
    await saveSettings({ shortcut: custom });
    const settings = await loadSettings();
    expect(settings.shortcut).toEqual(custom);
  });
});
