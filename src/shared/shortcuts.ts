export interface Shortcut {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

const MAC_PLATFORM_REGEX = /mac/i;

export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  const platform = (navigator as any).userAgentData?.platform ?? navigator.platform ?? "";
  return MAC_PLATFORM_REGEX.test(platform);
}

export function getDefaultShortcut(): Shortcut {
  return normalizeShortcut({
    key: "F",
    shiftKey: true,
    metaKey: isMacPlatform(),
    ctrlKey: !isMacPlatform(),
    altKey: false
  });
}

export function normalizeShortcut(partial: Partial<Shortcut> & { key: string }): Shortcut {
  const key = partial.key.length === 1 ? partial.key.toUpperCase() : partial.key;
  return {
    key,
    altKey: Boolean(partial.altKey),
    ctrlKey: Boolean(partial.ctrlKey),
    metaKey: Boolean(partial.metaKey),
    shiftKey: Boolean(partial.shiftKey)
  };
}

export function isValidShortcut(shortcut: Shortcut): boolean {
  if (!shortcut.key || shortcut.key === "Unidentified") {
    return false;
  }
  const hasModifier = shortcut.altKey || shortcut.ctrlKey || shortcut.metaKey || shortcut.shiftKey;
  return hasModifier;
}

export function shortcutToString(shortcut: Shortcut): string {
  const parts: string[] = [];
  if (shortcut.ctrlKey) parts.push("Ctrl");
  if (shortcut.metaKey) parts.push(isMacPlatform() ? "Command" : "Meta");
  if (shortcut.altKey) parts.push(isMacPlatform() ? "Option" : "Alt");
  if (shortcut.shiftKey) parts.push("Shift");
  parts.push(shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key);
  return parts.join(" + ");
}

export function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  return (
    key === shortcut.key &&
    event.altKey === shortcut.altKey &&
    event.ctrlKey === shortcut.ctrlKey &&
    event.metaKey === shortcut.metaKey &&
    event.shiftKey === shortcut.shiftKey
  );
}

export function eventToShortcut(event: KeyboardEvent): Shortcut {
  return normalizeShortcut({
    key: event.key.length === 1 ? event.key.toUpperCase() : event.key,
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey
  });
}

export function shortcutsEqual(a: Shortcut, b: Shortcut): boolean {
  return (
    a.key === b.key &&
    a.altKey === b.altKey &&
    a.ctrlKey === b.ctrlKey &&
    a.metaKey === b.metaKey &&
    a.shiftKey === b.shiftKey
  );
}
