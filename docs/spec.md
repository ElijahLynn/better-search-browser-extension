# Better Search Browser Extension Specification

## 1. Overview
- **Extension name:** Better Search
- **Primary browsers:** Google Chrome (Chromium-based). Future work may extend support to Firefox, Edge, and Safari.
- **Distribution:** Chrome Web Store; package as Manifest V3.
- **Goal:** Provide power users with a fast, reliable way to run regular-expression searches against the contents of the active tab without losing context or reloading the page.

## 2. Problem Statement
Existing in-page search is limited to literal text matching and frequently misses complex patterns. Developers, analysts, and researchers resort to copying content into external tools to run regex searches, disrupting their workflow. Better Search keeps the user on the current page while enabling case-insensitive regex search by default, controlled through a global keyboard shortcut that can be customized.

## 3. Success Metrics
- Time from shortcut press to search UI render ≤ 150 ms on modern hardware.
- Regex match results appear (or error feedback is displayed) in ≤ 250 ms for documents ≤ 2 MB rendered text.
- ≥ 95 % of beta feedback indicates the UI is discoverable and does not conflict with existing shortcuts.
- Chrome Web Store review approval with no policy violations or rejection feedback.

## 4. Key Personas
- **Developers:** Need quick pattern searches in docs, logs, and code snippets.
- **Data analysts / researchers:** Find multiple text variations across long articles or dashboards.
- **Power users:** Prefer keyboard-driven workflows and may customize shortcuts to avoid collisions.

## 5. Primary User Journeys
1. **Invoke and search**
   - User presses `⌘⇧F` on macOS (or `Ctrl+Shift+F` on Windows/Linux).
   - Overlay appears anchored to the top-right (assess user testing to fine-tune).
   - User enters regex, results highlight inline, and a counter displays total matches.
2. **Navigate matches**
   - User cycles matches via `Enter` / `Shift+Enter` or arrow buttons.
   - View jumps to the active match, ensuring visibility without repositioning the overlay.
3. **Adjust settings**
   - From the options page, user changes shortcut to avoid conflicts (validated to prevent blank or unsupported combinations).
   - Future (placeholder) toggles: case sensitivity, literal vs regex, theme.

## 6. Functional Requirements
### 6.1 Activation & Shortcut Handling
- Default command: `⌘⇧F` on macOS, `Ctrl+Shift+F` elsewhere (`chrome.commands` API).
- Options page allows editing the shortcut. Validation prevents duplicates or disabled commands.
- Overlay closes with `Esc`, clicking outside, or pressing the shortcut again.

### 6.2 Search Overlay
- Non-modal panel with input, match counter, next/previous buttons, clear button.
- Focus lands on input immediately.
- Input label clarifies default regex mode and case-insensitive behavior.
- Error state displays validation message when regex compilation fails; previous results are cleared.

### 6.3 Matching Behavior
- Search runs on the visible DOM text nodes of the active tab.
- Case-insensitive by default using the `i` flag; UI exposes the applied modifiers.
- Highlights matches by wrapping them in temporary spans with contrasting background.
- Maintain a list of match ranges to support navigation and updates when DOM changes (MutationObserver).
- Clearing the search removes all injected highlight spans.

### 6.4 Options Page
- Built with standard React/Vue/Svelte or vanilla (decision TBD). Must work without a build system if possible to simplify MV3 packaging.
- Sections:
  1. **Shortcut configuration:** Displays current shortcut and offers change flow.
  2. **Search defaults (future):** Placeholder copy indicating upcoming functionality.
  3. **Feedback:** Link to support email or GitHub issues.
- Persist settings via `chrome.storage.sync` with migration fallback to `chrome.storage.local`.

### 6.5 Permissions & Manifest
- `"manifest_version": 3`.
- Required permissions: `"scripting"`, `"activeTab"`, `"storage"`, `"commands"`.
- Content script injected on demand when the command fires via `chrome.scripting.executeScript`.
- Minimal host permissions to pass Chrome Web Store review (prefer `"host_permissions": ["<all_urls>"]"` only if necessary).
- Provide application icons in 16/32/48/128 sizes and actions defined under `"action"` if toolbar button is added later (not part of MVP).

### 6.6 Internationalization & Accessibility
- All copy passed through Chrome i18n (`_locales/en/messages.json` initially).
- Overlay is keyboard navigable, follows focus management guidelines, and uses ARIA roles for status messages.
- High-contrast theme ensures WCAG AA compliance for highlights and text.

### 6.7 Telemetry & Privacy
- No user data transmitted off-device in MVP.
- Document privacy policy URL in Chrome Web Store listing, clarifying no data collection.

## 7. Non-Functional Requirements
- Load overhead: content script bundle ≤ 100 KB uncompressed.
- Memory impact: highlight structures cleaned when the overlay closes.
- Graceful failure: provide clear error message if regex compilation fails or page script injection is blocked.
- Browser compatibility: Validate on Chrome stable, beta, and minimum supported version (target 2 most recent major releases).

## 8. Future Enhancements (Out of Scope for MVP)
- Simple mode with toggles for whole-word and literal search.
- Saved queries or recent searches.
- Theme customization (light/dark/system).
- Cross-tab search or multi-tab management.

## 9. Open Questions
- Should the overlay persist across page navigations or reset each time?
- What default behavior should we adopt on Chrome OS where `Ctrl+Shift+F` is already bound in some apps?
- Do we need analytics hooks to understand usage before expanding to other stores?

---

## 10. Test Plan

### 10.1 Tooling Strategy
- **Unit tests:** Run with Jest or Vitest on pure functions (regex helpers, shortcut parsing, storage adapters).
- **Integration/extension tests:** Use Playwright (Chromium channel) with `--load-extension` to automate command execution and DOM validation.
- **Static analysis:** ESLint with TypeScript (if adopted) and schema validation for `manifest.json`.
- **Manual QA:** Checklist covering installation, first-run experience, and keyboard workflows.

### 10.2 Unit Test Coverage
1. **Regex engine wrapper**
   - Compiles valid patterns and reports syntax errors.
   - Applies default `i` flag unless user overrides.
   - Correctly escapes highlight spans and cleans up without leaking.
2. **Shortcut management**
   - Parses shortcut strings from options UI and rejects unsupported combinations.
   - Persists to `chrome.storage.sync` and reads fallback to local.
   - Detects conflicts (e.g., duplicates) and surfaces errors.
3. **State management**
   - Overlay reducer/actions handle open, close, error, and results updates.
   - Mutation observer logic updates match sets when DOM changes (mocked).

### 10.3 Integration Tests (Playwright)
1. **Command invocation**
   - Load simple HTML fixture, trigger extension command, assert overlay renders in ≤ 150 ms.
   - Ensure focus on input and highlight removal when closing.
2. **Regex matching workflow**
   - Enter pattern matching multiple occurrences; verify match count and navigation moves focus.
   - Enter invalid regex, confirm error banner and no highlights.
3. **Shortcut customization**
   - Open options page, change shortcut to `Ctrl+Alt+F`, reload background, ensure new shortcut activates overlay and old one no longer works.
4. **Storage persistence**
   - Reload extension (simulate browser restart). Confirm customized shortcut persists using `chrome.storage.sync`.

### 10.4 Manual QA Checklist
- Install extension from `chrome://extensions` in developer mode.
- Verify overlay displays correctly on:
  - Long article page,
  - Single-page app (e.g., React site),
  - Page using shadow DOM (ensure no crashes; optional fallback copy if unsupported).
- Test keyboard navigation with and without hardware acceleration.
- Confirm options page accessible from Chrome menu and updates propagate in ≤ 2 s.

### 10.5 Regression & Release Testing
- Smoke test across latest Chrome stable on macOS, Windows 11, and Ubuntu LTS.
- Validate manifest icons, description, and privacy policy before store upload.
- Run automated suite (`npm test`, `npm run test:integration`) in CI against Chrome stable channel.
- Maintain change log; before release, execute manual checklist and archive Playwright traces for debugging.

