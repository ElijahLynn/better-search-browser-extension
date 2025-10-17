import { SearchOverlay } from "./overlay";
import { matchesShortcut, shortcutToString, Shortcut } from "../shared/shortcuts";
import { getDefaultSettings, loadSettings, watchSettings } from "../shared/settings";

declare const chrome: typeof globalThis.chrome;

if (window.top === window) {
  bootstrap().catch((error) => {
    console.error("Failed to initialise Better Search content script", error);
  });
}

async function bootstrap(): Promise<void> {
  let settings = await loadSettings().catch(() => getDefaultSettings());

  const overlay = new SearchOverlay({
    onClose: () => {
      // Nothing yet; reserved for future cleanup hooks.
    }
  });

  updateShortcutLabel(settings.shortcut);

  document.addEventListener(
    "keydown",
    (event) => {
      if (shouldIgnoreEvent(event)) {
        return;
      }
      if (matchesShortcut(event, settings.shortcut)) {
        event.preventDefault();
        overlay.toggle();
      }
    },
    true
  );

  watchSettings((updated) => {
    settings = updated;
    updateShortcutLabel(settings.shortcut);
  });

  if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message: unknown) => {
      if (!isMessage(message)) return;
      if (message.type === "toggle-search") {
        overlay.toggle();
      } else if (message.type === "open-search") {
        overlay.open();
        if (message.query) {
          overlay.setQuery(message.query);
        }
      }
    });
  }

  function updateShortcutLabel(shortcut: Shortcut): void {
    overlay.setShortcutLabel(shortcutToString(shortcut));
  }
}

function shouldIgnoreEvent(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;
  const tag = target.tagName;
  return (
    target.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
}

interface RuntimeMessage {
  type: "toggle-search" | "open-search";
  query?: string;
}

function isMessage(message: unknown): message is RuntimeMessage {
  if (!message || typeof message !== "object") return false;
  const type = (message as RuntimeMessage).type;
  return type === "toggle-search" || type === "open-search";
}
