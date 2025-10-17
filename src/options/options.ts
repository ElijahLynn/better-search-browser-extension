import { getDefaultSettings, loadSettings, saveSettings } from "../shared/settings";
import {
  eventToShortcut,
  getDefaultShortcut,
  isValidShortcut,
  shortcutToString,
  Shortcut,
  shortcutsEqual
} from "../shared/shortcuts";

const form = document.getElementById("shortcut-form") as HTMLFormElement | null;
const input = document.getElementById("shortcut-capture") as HTMLInputElement | null;
const errorElement = document.getElementById("shortcut-error") as HTMLElement | null;
const resetButton = document.getElementById("reset-shortcut") as HTMLButtonElement | null;
const submitButton = form?.querySelector<HTMLButtonElement>("button[type='submit']") ?? null;

let currentShortcut: Shortcut = getDefaultShortcut();
let initialShortcut: Shortcut = currentShortcut;

if (!form || !input || !errorElement || !resetButton || !submitButton) {
  throw new Error("Options page missing required elements");
}

initialise().catch((error) => {
  console.error("Failed to load Better Search settings", error);
  showError("Unable to load settings. Try re-opening the options page.");
});

function initialise(): Promise<void> {
  input.value = "";
  input.placeholder = shortcutToString(getDefaultShortcut());

  form.addEventListener("submit", handleSubmit);
  input.addEventListener("keydown", handleCapture);
  input.addEventListener("focus", () => input.select());
  resetButton.addEventListener("click", handleReset);

  return loadSettings()
    .then((settings) => {
      currentShortcut = settings.shortcut;
      initialShortcut = settings.shortcut;
      renderShortcut();
    })
    .catch(() => {
      currentShortcut = getDefaultSettings().shortcut;
      initialShortcut = currentShortcut;
      renderShortcut();
    });
}

function handleCapture(event: KeyboardEvent): void {
  event.preventDefault();
  const captured = eventToShortcut(event);
  if (!isValidShortcut(captured)) {
    showError("Include at least one modifier key (Ctrl, Command, Alt, or Shift).");
    return;
  }

  hideError();
  currentShortcut = captured;
  renderShortcut();
}

function handleSubmit(event: SubmitEvent): void {
  event.preventDefault();
  if (!isValidShortcut(currentShortcut)) {
    showError("Shortcut is not valid.");
    return;
  }
  hideError();
  saveSettings({ shortcut: currentShortcut })
    .then(() => {
      initialShortcut = currentShortcut;
      renderShortcut();
    })
    .catch((error) => {
      console.error("Failed to save Better Search shortcut", error);
      showError("Could not save shortcut. Please try again.");
    });
}

function handleReset(): void {
  currentShortcut = getDefaultShortcut();
  hideError();
  renderShortcut();
}

function renderShortcut(): void {
  input.value = shortcutToString(currentShortcut);
  submitButton.toggleAttribute("disabled", shortcutsEqual(currentShortcut, initialShortcut));
}

function showError(message: string): void {
  if (!errorElement) return;
  errorElement.hidden = false;
  errorElement.textContent = message;
}

function hideError(): void {
  if (!errorElement) return;
  errorElement.hidden = true;
  errorElement.textContent = "";
}
