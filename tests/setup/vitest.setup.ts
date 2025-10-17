import { vi } from "vitest";

type ChangeListener = Parameters<typeof chrome.storage.onChanged.addListener>[0];

interface MemoryStorageArea extends chrome.storage.SyncStorageArea {
  _data: Record<string, any>;
}

const onChangedListeners = new Set<ChangeListener>();

function createMemoryStorageArea(): MemoryStorageArea {
  const area = {
    _data: {} as Record<string, any>,
    get(keys: string[] | string | null, callback: (items: Record<string, any>) => void) {
      if (keys === null) {
        callback({ ...area._data });
        return;
      }
      const keyArray = Array.isArray(keys) ? keys : [keys];
      const result: Record<string, any> = {};
      keyArray.forEach((key) => {
        result[key] = area._data[key];
      });
      callback(result);
    },
    set(items: Record<string, any>, callback?: () => void) {
      const changes: Record<string, chrome.storage.StorageChange> = {};
      Object.entries(items).forEach(([key, value]) => {
        changes[key] = { newValue: value, oldValue: area._data[key] };
        area._data[key] = value;
      });
      queueMicrotask(() => {
        onChangedListeners.forEach((listener) => listener(changes, "sync"));
      });
      callback?.();
    },
    remove(keys: string | string[], callback?: () => void) {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      keyArray.forEach((key) => {
        delete area._data[key];
      });
      callback?.();
    },
    clear(callback?: () => void) {
      area._data = {};
      callback?.();
    }
  } as MemoryStorageArea;
  return area;
}

const memoryStorage = createMemoryStorageArea();

// @ts-expect-error assign to global for tests
globalThis.chrome = {
  runtime: {
    lastError: undefined,
    onInstalled: { addListener: vi.fn() }
  },
  storage: {
    sync: memoryStorage,
    local: memoryStorage,
    onChanged: {
      addListener(listener: ChangeListener) {
        onChangedListeners.add(listener);
      },
      removeListener(listener: ChangeListener) {
        onChangedListeners.delete(listener);
      }
    }
  }
} satisfies typeof chrome;

vi.stubGlobal("chrome", globalThis.chrome);
