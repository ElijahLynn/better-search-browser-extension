import { getDefaultShortcut, normalizeShortcut, Shortcut } from "./shortcuts";

export interface BetterSearchSettings {
  shortcut: Shortcut;
}

const SETTINGS_KEY = "betterSearchSettings";

const DEFAULT_SETTINGS: BetterSearchSettings = {
  shortcut: getDefaultShortcut()
};

type StorageArea = chrome.storage.SyncStorageArea | chrome.storage.LocalStorageArea;

function resolveStorageArea(): StorageArea | null {
  if (typeof chrome === "undefined" || !chrome.storage) {
    return null;
  }
  if (chrome.storage.sync) {
    return chrome.storage.sync;
  }
  if (chrome.storage.local) {
    return chrome.storage.local;
  }
  return null;
}

export async function loadSettings(): Promise<BetterSearchSettings> {
  const storage = resolveStorageArea();
  if (!storage) {
    return DEFAULT_SETTINGS;
  }

  const stored = await new Promise<BetterSearchSettings | undefined>((resolve, reject) => {
    storage.get([SETTINGS_KEY], (items) => {
      const err = chrome.runtime?.lastError;
      if (err) {
        reject(new Error(err.message));
        return;
      }
      resolve(items[SETTINGS_KEY]);
    });
  }).catch(() => undefined);

  if (!stored?.shortcut) {
    return DEFAULT_SETTINGS;
  }

  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    shortcut: normalizeShortcut(stored.shortcut)
  };
}

export async function saveSettings(settings: BetterSearchSettings): Promise<void> {
  const storage = resolveStorageArea();
  if (!storage) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    storage.set({ [SETTINGS_KEY]: settings }, () => {
      const err = chrome.runtime?.lastError;
      if (err) {
        reject(new Error(err.message));
        return;
      }
      resolve();
    });
  }).catch(() => {});
}

export function watchSettings(callback: (settings: BetterSearchSettings) => void): () => void {
  if (typeof chrome === "undefined" || !chrome.storage?.onChanged) {
    return () => {};
  }

  const listener: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (changes, areaName) => {
    if (areaName !== "sync" && areaName !== "local") {
      return;
    }
    const change = changes[SETTINGS_KEY];
    if (!change?.newValue) {
      return;
    }
    callback({
      ...DEFAULT_SETTINGS,
      ...change.newValue,
      shortcut: normalizeShortcut(change.newValue.shortcut)
    });
  };

  chrome.storage.onChanged.addListener(listener);
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}

export function getDefaultSettings(): BetterSearchSettings {
  return DEFAULT_SETTINGS;
}
