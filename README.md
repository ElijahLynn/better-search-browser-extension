# Better Search Browser Extension

Regex-powered in-page search for Chrome that highlights matches and lets you customise the activation shortcut. See `docs/spec.md` for the full product and test plan.

## Features

- Case-insensitive regex search overlay triggered via keyboard shortcut.
- Smart match highlighting with next/previous navigation.
- Options page for capturing a custom shortcut (persisted with `chrome.storage.sync`).
- Manifest V3 service worker that injects the content script on demand.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the extension bundle and copy static assets into `dist/`:

   ```bash
   npm run build
   ```

3. Load the unpacked extension in Chrome:
   - Open `chrome://extensions`.
   - Enable **Developer mode**.
   - Click **Load unpacked…** and choose the project’s `dist/` directory (not `src/`).
   - After code changes, rerun `npm run build` and press **Reload** on the extension card.

## Development Tips

- `npm run build:watch` – continuously rebuilds the background, content, and options scripts.
- `npm run lint` – runs ESLint with the configured TypeScript rules.
- `npm test` – executes unit tests via Vitest (with jsdom and Chrome storage stubs).
- `npm run test:integration` – drives Playwright against the unpacked extension (requires `npx playwright install` and a fresh `npm run build` so `dist/` is current).

When iterating on UI tweaks, rebuild and hit **Reload** in `chrome://extensions` to pick up the latest `dist/` assets.

## Project Layout

- `src/` – TypeScript source for background, content, options, and shared modules.
- `public/` – Static assets bundled into `dist/` (manifest, HTML, CSS, icons).
- `tests/` – Vitest unit specs and Playwright integration tests.
- `docs/spec.md` – Detailed specification and testing strategy.

## Licensing

Distributed under the terms of the AGPL-3.0-or-later license (`LICENSE`).
