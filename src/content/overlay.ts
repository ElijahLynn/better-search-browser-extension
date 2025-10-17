import { Highlighter, injectHighlightStyles } from "./highlighter";

const OVERLAY_ID = "better-search-overlay";

interface OverlayOptions {
  onClose: () => void;
}

interface SearchResult {
  count: number;
  currentIndex: number;
}

export class SearchOverlay {
  private readonly root: HTMLElement;
  private readonly input: HTMLInputElement;
  private readonly counter: HTMLElement;
  private readonly error: HTMLElement;
  private readonly prevButton: HTMLButtonElement;
  private readonly nextButton: HTMLButtonElement;
  private readonly closeButton: HTMLButtonElement;
  private readonly shortcutLabel: HTMLElement;
  private readonly highlighter: Highlighter;
  private readonly documentKeydownHandler: (event: KeyboardEvent) => void;

  private openState = false;
  private currentPattern: RegExp | null = null;
  private currentResult: SearchResult = { count: 0, currentIndex: -1 };
  private readonly onClose: () => void;

  constructor(options: OverlayOptions) {
    this.onClose = options.onClose;
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) {
      existing.remove();
    }
    this.root = this.createOverlay();
    document.body.appendChild(this.root);
    injectHighlightStyles(document);

    this.input = this.root.querySelector<HTMLInputElement>("[data-input]")!;
    this.counter = this.root.querySelector<HTMLElement>("[data-counter]")!;
    this.error = this.root.querySelector<HTMLElement>("[data-error]")!;
    this.prevButton = this.root.querySelector<HTMLButtonElement>("[data-prev]")!;
    this.nextButton = this.root.querySelector<HTMLButtonElement>("[data-next]")!;
    this.closeButton = this.root.querySelector<HTMLButtonElement>("[data-close]")!;
    this.shortcutLabel = this.root.querySelector<HTMLElement>("[data-shortcut]")!;
    this.highlighter = new Highlighter(this.root);
    this.documentKeydownHandler = (event: KeyboardEvent) => {
      if (!this.isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
      }
    };

    this.bindEvents();
  }

  public get isOpen(): boolean {
    return this.openState;
  }

  open(): void {
    if (this.openState) {
      this.focusInput();
      return;
    }
    this.openState = true;
    this.root.hidden = false;
    this.root.setAttribute("data-state", "open");
    this.focusInput();
    this.applySearch(this.input.value);
  }

  close(): void {
    if (!this.openState) return;
    this.openState = false;
    this.root.hidden = true;
    this.root.setAttribute("data-state", "closed");
    this.highlighter.clear();
    this.currentPattern = null;
    this.currentResult = { count: 0, currentIndex: -1 };
    this.renderResult();
    this.onClose();
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  setShortcutLabel(label: string): void {
    this.shortcutLabel.textContent = label;
  }

  setQuery(value: string): void {
    this.input.value = value;
    this.applySearch(value);
  }

  private bindEvents(): void {
    this.input.addEventListener("input", (event) => {
      const target = event.currentTarget as HTMLInputElement;
      this.applySearch(target.value);
    });

    this.input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        if (event.shiftKey) {
          this.navigate(-1);
        } else {
          this.navigate(1);
        }
      }
    });

    this.prevButton.addEventListener("click", () => this.navigate(-1));
    this.nextButton.addEventListener("click", () => this.navigate(1));
    this.closeButton.addEventListener("click", () => this.close());
    document.addEventListener("keydown", this.documentKeydownHandler, true);

    document.addEventListener(
      "mousedown",
      (event) => {
        if (!this.isOpen) return;
        if (event.target instanceof Node && this.root.contains(event.target)) {
          return;
        }
        this.close();
      },
      true
    );
  }

  private focusInput(): void {
    requestAnimationFrame(() => {
      this.input.select();
      this.input.focus();
    });
  }

  private applySearch(rawQuery: string): void {
    const trimmed = rawQuery.trim();
    if (!trimmed) {
      this.highlighter.clear();
      this.currentPattern = null;
      this.currentResult = { count: 0, currentIndex: -1 };
      this.renderResult();
      this.hideError();
      return;
    }
    const pattern = this.compilePattern(trimmed);
    if (!pattern) {
      this.highlighter.clear();
      this.currentResult = { count: 0, currentIndex: -1 };
      this.renderResult();
      return;
    }

    this.currentPattern = pattern;
    const count = this.highlighter.search(pattern);
    this.currentResult = {
      count,
      currentIndex: count > 0 ? 0 : -1
    };
    if (count > 0) {
      this.highlighter.setActive(0);
    }
    this.renderResult();
  }

  private compilePattern(value: string): RegExp | null {
    try {
      const pattern = new RegExp(value, "gi");
      this.hideError();
      return pattern;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown regex error";
      this.showError(message);
      return null;
    }
  }

  private navigate(direction: number): void {
    const { count, currentIndex } = this.currentResult;
    if (count === 0) return;

    const nextIndex = (currentIndex + direction + count) % count;
    this.currentResult = { count, currentIndex: nextIndex };
    this.highlighter.setActive(nextIndex);
    this.renderResult();
  }

  private renderResult(): void {
    const { count, currentIndex } = this.currentResult;
    if (count === 0) {
      this.counter.textContent = "No matches";
      this.prevButton.disabled = true;
      this.nextButton.disabled = true;
    } else {
      this.counter.textContent = `${currentIndex + 1} of ${count}`;
      this.prevButton.disabled = false;
      this.nextButton.disabled = false;
    }
  }

  private showError(message: string): void {
    this.error.hidden = false;
    this.error.textContent = message;
  }

  private hideError(): void {
    this.error.hidden = true;
    this.error.textContent = "";
  }

  private createOverlay(): HTMLElement {
    const container = document.createElement("section");
    container.id = OVERLAY_ID;
    container.hidden = true;
    container.dataset.betterSearchSkip = "true";
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", "Better Search");

    container.innerHTML = `
      <style>
        #${OVERLAY_ID} {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 2147483646;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #111827;
        }

        #${OVERLAY_ID}[hidden] {
          display: none !important;
        }

        #${OVERLAY_ID} [data-panel] {
          width: 320px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.22);
          padding: 16px;
          display: grid;
          gap: 12px;
        }

        #${OVERLAY_ID} [data-input] {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          font-size: 15px;
        }

        #${OVERLAY_ID} [data-input]:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.28);
        }

        #${OVERLAY_ID} [data-meta] {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          color: #475569;
        }

        #${OVERLAY_ID} [data-error] {
          color: #dc2626;
          font-size: 13px;
        }

        #${OVERLAY_ID} [data-controls] {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        #${OVERLAY_ID} button {
          cursor: pointer;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: #1d4ed8;
          color: white;
          transition: transform 120ms ease, box-shadow 120ms ease;
        }

        #${OVERLAY_ID} button[data-close] {
          background: transparent;
          color: #1f2937;
          font-size: 18px;
          padding: 4px 0 4px 8px;
        }

        #${OVERLAY_ID} button:disabled {
          background: rgba(148, 163, 184, 0.5);
          cursor: default;
        }

        #${OVERLAY_ID} button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 30px rgba(37, 99, 235, 0.25);
        }

        @media (prefers-color-scheme: dark) {
          #${OVERLAY_ID} {
            color: #e2e8f0;
          }

          #${OVERLAY_ID} [data-panel] {
            background: rgba(30, 41, 59, 0.92);
            border: 1px solid rgba(148, 163, 184, 0.32);
          }

          #${OVERLAY_ID} [data-input] {
            background: rgba(15, 23, 42, 0.85);
            color: inherit;
            border-color: rgba(100, 116, 139, 0.6);
          }

          #${OVERLAY_ID} button[data-close] {
            color: inherit;
          }
        }
      </style>
      <div data-panel>
        <input
          data-input
          type="text"
          placeholder="Enter regex…"
          aria-label="Better Search regex input"
          autocomplete="off"
          spellcheck="false"
        />
        <div data-meta>
          <span data-counter>No matches</span>
          <span data-shortcut></span>
        </div>
        <p data-error hidden></p>
        <div data-controls>
          <div>
            <button type="button" data-prev>◀ Previous</button>
            <button type="button" data-next>Next ▶</button>
          </div>
          <button type="button" aria-label="Close search overlay" data-close>&times;</button>
        </div>
      </div>
    `;

    return container;
  }
}
