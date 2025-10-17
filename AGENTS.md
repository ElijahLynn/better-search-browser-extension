# Repository Guidelines

## Project Structure & Module Organization
- `src/background/serviceWorker.ts` registers listeners that inject the content overlay on demand; keep background-specific utilities here.
- `src/content/` houses the highlighter overlay (`overlay.ts`), DOM helpers, and the entry point (`index.ts`); shared logic belongs in `src/shared/`.
- `src/options/` renders the shortcut configuration UI, while static HTML, CSS, and `manifest.json` live in `public/`. Generated bundles are written to `dist/` by the build.
- `scripts/copy-static.mjs` mirrors assets from `public/` into `dist/`; update it if new static directories are added.
- Tests live under `tests/` (`unit/`, `integration/`, `setup/`); mirror the source tree when adding new specs for easier discovery.

## Build, Test, and Development Commands
- `npm install` — install dependencies used by the TypeScript, Vitest, and Playwright toolchain.
- `npm run build` — bundle via `tsup` and copy static assets into `dist/` for loading in Chrome.
- `npm run build:watch` — incremental rebuilds while editing background, content, or options code.
- `npm run lint` — enforce the Standard-with-TypeScript rule set; resolves quickly if run before commits.
- `npm test` / `npm run test:integration` — run Vitest unit suites and Playwright browser flows; invoke `npx playwright install` once per machine before the integration command.

## Coding Style & Naming Conventions
- TypeScript throughout with ES modules; prefer named exports and keep ambient Chrome types in `@types/chrome`.
- Follow ESLint’s `standard-with-typescript` defaults (2-space indent, single quotes, no semicolons). The config disables only explicit return types and strict boolean checks—leave other rules intact.
- Name files in lower camel case (`highlighter.ts`, `shortcuts.ts`) and co-locate feature helpers beside their entry modules.
- Do not commit `dist/`; it is recreated per build and ignored by `git`.

## Testing Guidelines
- Unit tests belong in `tests/unit/` with filenames ending in `.test.ts`; integration specs sit in `tests/integration/` as `.spec.ts`.
- Stub Chrome APIs via the shared helpers in `tests/setup/vitest.setup.ts`; add new stubs there rather than inline.
- Run `npm run build` before `npm run test:integration` so Playwright exercises the current bundle, and capture failing traces with `npx playwright show-trace`.
- Target meaningful scenarios over snapshot churn; new features should land with unit coverage plus a happy-path Playwright flow when UI changes.

## Commit & Pull Request Guidelines
- Use short, conventional commits: `<type>: <subject>` (e.g., `fix: debounce overlay updates`, `docs: expand spec`). The history shows `fix`, `docs`, and `vibe` prefixes—stay consistent or replace `vibe` with a clearer type.
- Keep commits scoped to one concern and ensure lint + tests pass locally.
- Pull requests should outline motivation, summarise key changes, link any issues, and include screenshots or GIFs when UI is affected. Note required follow-up tasks explicitly in the description.
- Request review once Playwright and Vitest runs are green and the extension builds cleanly (`npm run build`).
