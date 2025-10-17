import { describe, expect, it, beforeEach } from "vitest";
import { Highlighter, injectHighlightStyles } from "../../src/content/highlighter";

function createOverlay(): HTMLElement {
  const overlay = document.createElement("div");
  overlay.dataset.betterSearchSkip = "true";
  document.body.appendChild(overlay);
  return overlay;
}

describe("Highlighter", () => {
  beforeEach(() => {
    document.body.innerHTML = `<article><p>Regex search finds Foo, FOO, and foo.</p></article>`;
    injectHighlightStyles(document);
  });

  it("highlights matches case-insensitively", () => {
    const overlay = createOverlay();
    const highlighter = new Highlighter(overlay);
    const count = highlighter.search(/foo/gi);
    expect(count).toBe(3);
    expect(document.querySelectorAll(".better-search-highlight").length).toBe(3);
  });

  it("clears highlights when requested", () => {
    const overlay = createOverlay();
    const highlighter = new Highlighter(overlay);
    highlighter.search(/foo/gi);
    highlighter.clear();
    expect(document.querySelectorAll(".better-search-highlight").length).toBe(0);
    expect(document.body.textContent?.includes("foo")).toBe(true);
  });
});
