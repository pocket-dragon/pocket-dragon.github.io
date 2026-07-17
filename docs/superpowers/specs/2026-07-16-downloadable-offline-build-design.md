# Downloadable offline build — design

**Issue:** [#9 — Make the app downloadable as a zip](https://github.com/pocket-dragon/pocket-dragon.github.io/issues/9)
**Date:** 2026-07-16
**Status:** Approved

## Goal

Non-programmers can download the app as a single file, keep it forever, and use
it by double-clicking — no web server, no technical steps. The artifact is
attached to every release we cut and linked from inside the app.

## Background and constraints

Three things break a plain copy of today's `dist/` when opened via `file://`:

1. **Module CORS.** Vite emits `<script type="module" src="/assets/index-….js">`.
   Chrome and Firefox fetch module scripts with CORS, and a `file://` page has
   opaque ("null") origin, so the script is refused → blank page. Inline module
   scripts are exempt, which is the escape hatch this design uses.
2. **Absolute paths.** All asset URLs are absolute (`/assets/…`), which on
   `file://` resolves to the filesystem root instead of the unpacked folder.
3. **Service worker.** The PWA's service worker cannot register on `file://`.
   The offline build must simply not contain it.

Additional context that shaped the design:

- Releases are currently cut manually from a stale `release` branch
  (`release.config.js`: `branches: ["release"]`, `ci: false`). Last release:
  v3.0.0, 2026-03-01. Prod deploys on every merge to `main` via
  `orchestrate-deploy.yml`.
- Sounds, promo images, and fonts live in `public/assets/` and are referenced
  by hardcoded absolute URL strings in JSX (`src/App.tsx`,
  `src/components/RulesModal.tsx`, `src/rules/game-rules.ts`) and in
  `index.html`. Files in `public/` are copied verbatim; Vite never processes
  them, so it cannot rewrite or inline these references.
- Total media weight is ~3.5 MB; the whole `dist/` is ~4.1 MB. A fully inlined
  single HTML file lands around 6–7 MB (base64 adds ~35%). Acceptable for an
  archival artifact.

## Decisions

| Decision | Choice |
|---|---|
| Release cadence for the artifact | Per-release; releases become automatic, cut from `main` in CI after the prod smoke test |
| `release` branch | Deleted — `main` becomes the semantic-release branch |
| Artifact shape | One self-contained `pocket-dragon.html` (JS, CSS, sounds, images, fonts, favicon all inlined as data URIs). No zip. |
| Audio formats | Inline all three (`mp3`/`ogg`/`wav`) as-is. Keeps JSX shared and unconditional; size cost (~1.5 MB) is acceptable. Can be slimmed later. |
| Distribution | GitHub release asset. The app links to `https://github.com/pocket-dragon/pocket-dragon.github.io/releases/latest/download/pocket-dragon.html` — a stable redirect to the newest release's asset, so the app never needs updating per release. |
| Link placement | In the rules/about modal (not a page footer). Hidden when `location.protocol === 'file:'` — no point offering the download inside the downloaded copy. |

## Delivery: three PRs

Each PR is independently shippable and (from PR 1 on) triggers its own release.

### PR 1 — Automatic releases

- `release.config.js`: `branches: ["main"]`, drop `ci: false`.
- New final job in `orchestrate-deploy.yml`, running only after the prod
  deploy + smoke test succeed, so a release tag always means "this commit is
  live in prod". The job: checkout the triggering commit (`main`'s head, the
  default `github.sha`) with full history, Node from `.nvmrc`, `npm ci`,
  `npx semantic-release`.
- The job gets its own `permissions: contents: write` (the workflow top level
  stays `contents: read`). The default `GITHUB_TOKEN` suffices; no new
  secrets. Note: tags/releases created by `GITHUB_TOKEN` do not trigger other
  workflows — fine, nothing listens for tags, and the artifact is attached
  inside this same job (PR 3), not via a tag-triggered workflow.
- semantic-release reads versions from tags, not the branch, so it picks up
  from the existing `v3.0.0` tag. The first automatic run analyzes every
  commit merged since March and cuts one release covering them.
- Merges containing only `chore`/`ci`/`docs` commits deploy but produce no
  release — expected and correct.
- Failure isolation: if the release step fails, prod is already deployed and
  healthy; the pipeline's existing deploy-failure issue mechanism reports it.
  Re-running the workflow retries the release (semantic-release is idempotent).
- Delete the `release` branch. Keep the `semantic-release` npm script as a
  break-glass manual path (without `ci: false` it dry-runs outside CI;
  publish manually with `npm run build:offline && npm run semantic-release --
  --no-ci`, from a checkout whose `HEAD` is on `main` — otherwise
  semantic-release errors that the branch is not in its config). Without the
  build step, a missing asset is only a warning and the release would publish
  without `pocket-dragon.html`, breaking the modal link until the next
  release.

### PR 2 — Asset migration (prod-neutral refactor)

- Move sounds, promo images, and fonts from `public/assets/` to `src/assets/`,
  imported as modules (e.g. `import clingMp3 from './assets/sound/cling_2.mp3'`);
  JSX and CSS (`@font-face`) use the imported URLs. Favicons/app icons stay in
  `public/` (needed as real files for the PWA manifest and `<head>` links).
- Update the workbox `globPatterns` in `vite.config.ts` to match the new
  hashed output locations. Keep excluding `.mp3` from the precache (GitHub
  Pages serves audio with HTTP 206, which Firefox rejects in `Cache.put()`).
- Zero user-visible change. Verified entirely by the existing unit, e2e,
  visual, and PWA test suites. This PR isolates the only prod-risky work.

### PR 3 — The offline artifact

- `vite.offline.config.ts`: React plugin + `vite-plugin-singlefile`,
  `base: './'`, **no** VitePWA plugin (no service worker, no manifest, no
  `registerSW.js`), output to `dist-offline/`. vite-plugin-singlefile's
  recommended build config raises `assetsInlineLimit` so all imported media
  inlines; because PR 2 made all media Vite-imported, that turns every
  sound/image/font into a data URI with no custom code. New npm script:
  `build:offline`.
- Head cleanup for the offline HTML (small `transformIndexHtml` step in the
  offline config): strip the apple-touch/favicon `<link>`s that would dangle,
  and inject one favicon inlined as a data URI so the tab keeps its icon.
- Release job (from PR 1) additionally runs `build:offline` and attaches the
  artifact: `@semantic-release/github` gets
  `assets: [{ path: 'dist-offline/index.html', name: 'pocket-dragon.html', label: 'Pocket Dragon — offline version (download and open in a browser)' }]`.
- Modal download link (see Decisions). GitHub serves release assets as
  downloads, so the link downloads the file rather than rendering it.
- Timing note: the link 404s until the first release with the asset exists.
  PR 3's own merge cuts that release (it contains a `feat` commit), so the
  gap is minutes. Accepted.

## Testing

- **Offline functional suite (PR 3):** `playwright.offline.config.ts` runs the
  existing spec files in `e2e/tests/` against the built `pocket-dragon.html`
  over a real `file://` URL. A small fixture shim maps navigations to the
  artifact's `file://` URL (Playwright's `baseURL` joining cannot express
  this). `offline-pwa.spec.ts` is excluded — it tests service-worker behavior
  that intentionally doesn't exist here. `sound.spec.ts` and
  `persistence.spec.ts` run as-is (localStorage works on `file://` in
  Playwright's browsers). Runs in `ci.yml` on every PR so a future change
  that breaks `file://` mode is caught pre-merge, not at release time.
- **Offline visual suite (PR 3):** the visual specs also run against the
  artifact — inlining should not change a pixel. If `file://` rendering turns
  out flaky in the CI container, the functional suite stays blocking and the
  visual-offline run becomes advisory.
- **Prod regression:** PR 2's migration and PR 3's config are covered by the
  existing unit, e2e, visual, and PWA suites unchanged.
- **Release automation:** after PR 1 merges, observe one pipeline run
  end-to-end and confirm the release via `gh release view`. After PR 3,
  manually download via the modal link, double-click, play a round.
- On `file://`, localStorage works in Chromium/Firefox/Safari, but Firefox
  scopes it per-directory — moving the downloaded file to another folder
  resets saved game state.

## Out of scope

- Slimming audio to one format in the artifact (possible later optimization).
- Any change to the PWA/installed-app experience.
- Hosting the artifact on the Pages site itself (release assets only).
