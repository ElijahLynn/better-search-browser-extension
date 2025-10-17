const HIGHLIGHT_CLASS = "better-search-highlight";
const HIGHLIGHT_ACTIVE_CLASS = "better-search-highlight--active";

export class Highlighter {
  private highlights: HTMLElement[] = [];
  private readonly overlayContainer: HTMLElement;

  constructor(overlayContainer: HTMLElement) {
    this.overlayContainer = overlayContainer;
  }

  search(pattern: RegExp): number {
    this.clear();
    if (!pattern.source) {
      return 0;
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (this.overlayContainer.contains(parent) || parent.closest("[data-better-search-skip]")) {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.tagName === "SCRIPT" || parent.tagName === "STYLE" || parent.tagName === "NOSCRIPT") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let count = 0;
    let node: Node | null;
    while ((node = walker.nextNode())) {
      count += this.highlightTextNode(node as Text, pattern);
    }
    return count;
  }

  clear(): void {
    this.highlights.forEach((span) => {
      const parent = span.parentNode;
      if (!parent) return;
      const text = document.createTextNode(span.textContent ?? "");
      parent.replaceChild(text, span);
      parent.normalize();
    });
    this.highlights = [];
  }

  get size(): number {
    return this.highlights.length;
  }

  setActive(index: number): HTMLElement | null {
    this.highlights.forEach((element) => element.classList.remove(HIGHLIGHT_ACTIVE_CLASS));
    if (index < 0 || index >= this.highlights.length) {
      return null;
    }
    const element = this.highlights[index];
    element.classList.add(HIGHLIGHT_ACTIVE_CLASS);
    element.scrollIntoView({ block: "center", behavior: "smooth" });
    return element;
  }

  private highlightTextNode(node: Text, pattern: RegExp): number {
    if (!node.textContent) {
      return 0;
    }

    const text = node.textContent;
    let lastIndex = 0;
    let matchCount = 0;
    const fragment = document.createDocumentFragment();
    let match: RegExpExecArray | null;

    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + (match[0]?.length ?? 0);
      if (end === start) {
        // Avoid zero-length matches looping infinitely.
        pattern.lastIndex += 1;
        continue;
      }

      if (start > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, start)));
      }

      const highlight = document.createElement("mark");
      highlight.className = HIGHLIGHT_CLASS;
      highlight.textContent = text.slice(start, end);
      fragment.appendChild(highlight);
      this.highlights.push(highlight);
      matchCount += 1;
      lastIndex = end;
    }

    if (matchCount === 0) {
      return 0;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    const parent = node.parentNode;
    if (!parent) {
      return matchCount;
    }
    parent.replaceChild(fragment, node);
    return matchCount;
  }
}

export function injectHighlightStyles(root: Document | ShadowRoot): void {
  if (root.querySelector("[data-better-search-style]")) {
    return;
  }
  const style = document.createElement("style");
  style.dataset.betterSearchStyle = "true";
  style.textContent = `
    .${HIGHLIGHT_CLASS} {
      background: rgba(234, 179, 8, 0.6);
      color: inherit;
      padding: 0 2px;
      border-radius: 2px;
    }

    .${HIGHLIGHT_CLASS}.${HIGHLIGHT_ACTIVE_CLASS} {
      outline: 2px solid #2563eb;
      background: rgba(37, 99, 235, 0.45);
    }
  `;
  root.appendChild(style);
}
