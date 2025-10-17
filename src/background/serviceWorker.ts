import { getDefaultSettings, saveSettings } from "../shared/settings";

declare const chrome: typeof globalThis.chrome;

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await saveSettings(getDefaultSettings());
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-search") return;
  const tab = await getActiveTab();
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "toggle-search" });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Receiving end does not exist")) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content/index.js"]
      });
      await chrome.tabs.sendMessage(tab.id, { type: "toggle-search" });
    }
  }
});

async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}
