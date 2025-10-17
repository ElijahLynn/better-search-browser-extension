import { describe, expect, it } from "vitest";
import {
  eventToShortcut,
  getDefaultShortcut,
  isValidShortcut,
  matchesShortcut,
  normalizeShortcut,
  shortcutToString
} from "../../src/shared/shortcuts";

describe("shortcuts utilities", () => {
  it("normalises shortcuts to uppercase keys", () => {
    const shortcut = normalizeShortcut({ key: "f", ctrlKey: true, altKey: false, metaKey: false, shiftKey: true });
    expect(shortcut.key).toBe("F");
  });

  it("produces a readable string representation", () => {
    const text = shortcutToString(
      normalizeShortcut({ key: "F", ctrlKey: true, altKey: false, metaKey: false, shiftKey: true })
    );
    expect(text).toContain("Ctrl");
    expect(text).toContain("Shift");
    expect(text.endsWith("F")).toBe(true);
  });

  it("rejects shortcuts without modifier keys", () => {
    const shortcut = normalizeShortcut({ key: "A", ctrlKey: false, altKey: false, metaKey: false, shiftKey: false });
    expect(isValidShortcut(shortcut)).toBe(false);
  });

  it("detects matches from keyboard events", () => {
    const shortcut = getDefaultShortcut();
    const event = new KeyboardEvent("keydown", {
      key: shortcut.key,
      ctrlKey: shortcut.ctrlKey,
      metaKey: shortcut.metaKey,
      shiftKey: shortcut.shiftKey,
      altKey: shortcut.altKey
    });
    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  it("captures shortcuts from keyboard events", () => {
    const event = new KeyboardEvent("keydown", { key: "f", metaKey: true, shiftKey: true });
    const captured = eventToShortcut(event);
    expect(captured.metaKey).toBe(true);
    expect(captured.key).toBe("F");
  });
});
