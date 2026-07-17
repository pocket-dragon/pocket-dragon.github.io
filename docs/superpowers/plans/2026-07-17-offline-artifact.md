# Offline Artifact (PR 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a fully self-contained `pocket-dragon.html` (everything inlined, boots from `file://`) as an asset on every release, downloadable from a link in the rules modal — closing issue #9.

**Architecture:** A second Vite config (`vite.offline.config.ts`) builds the same app with `vite-plugin-singlefile` (its recommended-config mode inlines all imported assets — PR 2 made every media file an import), no VitePWA, `publicDir` disabled, and a tiny `transformIndexHtml` plugin that strips the public-icon `<link>`s and injects one data-URI favicon. The existing e2e and visual suites re-run against the artifact over real `file://` URLs via a shared fixture that maps `page.goto('/')` to the artifact URL whenever `baseURL` is a `file:` URL. The release job builds the artifact and `@semantic-release/github` attaches it.

**Tech Stack:** vite-plugin-singlefile (spike-verified against Vite 8: 3.2 MB output, boots from `file://` in Chromium with images/fonts/audio working, zero console errors), Playwright, semantic-release.

**Spec:** `docs/superpowers/specs/2026-07-16-downloadable-offline-build-design.md` (PR 3 section).

## Global Constraints

- Work happens in `/Users/bot/src/pocket-dragon/upstream` on branch `feat/offline-artifact`.
- Local npm commands run under Node 22: prefix with `fnm exec --using=22`.
- Commit messages: conventional commits, American English, no AI attribution. This PR SHOULD cut a release on merge (it contains `feat` commits) — that release carries the first `pocket-dragon.html` asset, which the new modal link points at.
- Download URL (exact, used in code and test): `https://github.com/pocket-dragon/pocket-dragon.github.io/releases/latest/download/pocket-dragon.html`
- Asset label (exact): `Pocket Dragon — offline version (download and open in a browser)`
- The deployed PWA build (`vite.config.ts`, `dist/`) must be untouched except for the RulesModal addition; the modal link is hidden when `location.protocol === 'file:'`.
- `unit`/`component` tests run with `npx vitest run --reporter=dot` (vitest 4 has no `basic` reporter).
- Never squash-merge; fixups get autosquashed before merge.

---

### Task 1: Branch setup

**Files:** none

**Interfaces:**
- Produces: branch `feat/offline-artifact` off current `origin/main`; the plan doc committed on it.

- [ ] **Step 1: Create the branch and commit this plan**

```bash
cd /Users/bot/src/pocket-dragon/upstream
git fetch origin && git checkout -b feat/offline-artifact origin/main
git add docs/superpowers/plans/2026-07-17-offline-artifact.md
git commit -m "docs: add implementation plan for the offline artifact (PR 3)"
```

- [ ] **Step 2: Verify baseline**

Run: `fnm exec --using=22 npm run build > /dev/null 2>&1 && fnm exec --using=22 npx vitest run --reporter=dot 2>&1 | tail -2`
Expected: clean branch, build OK, 109 tests pass.

### Task 2: The offline single-file build

**Files:**
- Modify: `package.json` (new devDependency + `build:offline` script)
- Create: `vite.offline.config.ts`

**Interfaces:**
- Consumes: PR 2's imported assets (all media are static imports / CSS `url()`s).
- Produces: `npm run build:offline` → `dist-offline/index.html`, a single self-contained file with NO sibling files; Tasks 3, 4 and 6 consume `dist-offline/index.html`.

- [ ] **Step 1: Add the dependency and script**

```bash
fnm exec --using=22 npm install --save-dev vite-plugin-singlefile
```

Then in `package.json` scripts, after the `"build"` entry, add:

```json
    "build:offline": "vite build --config vite.offline.config.ts",
```

- [ ] **Step 2: Create vite.offline.config.ts**

```ts
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Offline single-file build (issue #9): everything — JS, CSS, sounds, images,
// fonts — inlined into one index.html that works when opened via file://.
// External module scripts are CORS-blocked on file:// in Chrome/Firefox;
// inline scripts are exempt, which is the whole trick.
//
// No VitePWA: service workers can't register on file://, and the offline copy
// needs no precache — it IS the cache. publicDir is disabled so the icon files
// aren't copied next to the artifact; the head links to them are stripped and
// replaced with one inlined favicon below.
//
// vite-plugin-singlefile's recommended-config mode raises assetsInlineLimit to
// 100 MB, so every imported asset (PR 2 made all media imports) becomes a data
// URI — no custom inlining code.

function inlineFavicon(): Plugin {
  return {
    name: 'offline-inline-favicon',
    transformIndexHtml(html) {
      const favicon = readFileSync('public/assets/icon/favicon-32x32.png').toString('base64');
      return html
        .replace(/^\s*<link rel="(?:icon|apple-touch-icon)"[^>]*>\r?\n/gm, '')
        .replace(
          '</title>',
          `</title>\n    <link rel="icon" type="image/png" href="data:image/png;base64,${favicon}" />`,
        );
    },
  };
}

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), viteSingleFile(), inlineFavicon()],
  build: {
    target: 'es2017',
    outDir: 'dist-offline',
  },
});
```

- [ ] **Step 3: Build and verify the artifact is truly single-file**

```bash
fnm exec --using=22 npm run build:offline
ls dist-offline/
grep -oE '(src|href)="(\./)?assets/[^"]*"' dist-offline/index.html | head
for uri in "data:audio/mpeg" "data:audio/ogg" "data:audio/wav" "data:image/jpeg" "data:image/png" "data:font/woff2;base64\|data:application/octet-stream;base64\|data:font/woff"; do
  printf '%s: ' "$uri"; grep -oE "$uri" dist-offline/index.html | wc -l
done
```

Expected: `dist-offline/` contains ONLY `index.html` (~3.2 MB); the external-ref grep prints nothing; 3× audio/mpeg, 3× audio/ogg, 3× audio/wav, 10× image/jpeg, ≥1 image/png (favicon), ≥1 font match.

- [ ] **Step 4: Boot it from file:// (throwaway check — Task 3 adds the permanent one)**

Write `boot-check.spike.mjs` in the repo root (do not commit; delete after):

```js
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(pathToFileURL('dist-offline/index.html').href);
await page.waitForSelector('[data-testid="start-pause"]', { timeout: 5000 });
console.log(JSON.stringify({ booted: true, errors }));
await browser.close();
```

Run: `fnm exec --using=22 node boot-check.spike.mjs && rm boot-check.spike.mjs`
Expected: `{"booted":true,"errors":[]}`.

- [ ] **Step 5: Confirm the deployed build is untouched**

Run: `fnm exec --using=22 npm run build > /dev/null 2>&1 && fnm exec --using=22 npm run test:pwa 2>&1 | tail -3`
Expected: PWA suite passes (14 tests) — `vite.config.ts` and `dist/` behavior unchanged.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.offline.config.ts
git commit -m "feat: add self-contained offline build

vite.offline.config.ts builds the whole app into one dist-offline/
index.html: vite-plugin-singlefile inlines the bundle (inline module
scripts are exempt from the file:// CORS block that breaks external
ones), its recommended config inlines every imported media asset as a
data URI, publicDir is off, and a tiny transformIndexHtml plugin swaps
the public-icon links for one inlined favicon. No VitePWA — service
workers don't exist on file://.

Part 3 of 3 for #9."
```

### Task 3: Run the existing e2e suite against the artifact over file://

**Files:**
- Create: `e2e/fixtures/test.ts`
- Create: `playwright.offline.config.ts`
- Modify: the `import { test, expect } ...` line in all 10 files in `e2e/tests/` and in `e2e/visual/visual.spec.ts`
- Modify: `package.json` (script `test:e2e:offline`)

**Interfaces:**
- Consumes: `dist-offline/index.html` from Task 2 (`npm run build:offline` first).
- Produces: shared fixture module `e2e/fixtures/test.ts` exporting `test`/`expect` (Task 4's visual config reuses it); `npm run test:e2e:offline`.

- [ ] **Step 1: Create the shared fixture**

`e2e/fixtures/test.ts`:

```ts
import { test as base } from '@playwright/test';

// Shared `test` for all e2e suites. When the active config points baseURL at a
// file: URL (the offline-artifact configs), Playwright's own URL joining can't
// express goto('/') — new URL('/', 'file:///…/index.html') is the filesystem
// root — so the fixture maps '/' to the artifact URL instead. With an http
// baseURL it is a passthrough.
export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    if (baseURL?.startsWith('file:')) {
      const originalGoto = page.goto.bind(page);
      page.goto = ((url, options) =>
        originalGoto(url === '/' ? baseURL : url, options)) as typeof page.goto;
    }
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

- [ ] **Step 2: Swap the imports in the spec files**

In each of `e2e/tests/{clues,difficulty,feeding,game-over,offline-pwa,persistence,rules-modal,sound,success,timers}.spec.ts`, change

```ts
import { test, expect } from '@playwright/test';
```

to

```ts
import { test, expect } from '../fixtures/test';
```

In `e2e/visual/visual.spec.ts`, the line also names the `Page` type — split it:

```ts
import { test, expect } from '../fixtures/test';
import type { Page } from '@playwright/test';
```

(If any spec's import line differs from the above, keep its other named imports and only move `test`/`expect` to the fixture module.)

- [ ] **Step 3: Verify the normal suite still passes (fixture is a passthrough on http)**

Run: `fnm exec --using=22 npm run test:e2e 2>&1 | tail -3`
Expected: 59 passed, as before.

- [ ] **Step 4: Create playwright.offline.config.ts**

```ts
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

// Behavior e2e suite against the built single-file offline artifact, loaded
// over real file:// URLs — the artifact's whole reason to exist. Mirrors
// playwright.config.ts minus the webServer (there is no server), with baseURL
// pointing at the artifact; e2e/fixtures/test.ts maps goto('/') to it.
export default defineConfig({
  testDir: './e2e/tests',
  // Tests service-worker behavior, which intentionally doesn't exist here.
  testIgnore: '**/offline-pwa.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report-offline', open: 'never' }]],
  timeout: 15000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: pathToFileURL(path.resolve('dist-offline/index.html')).href,
    trace: 'on-first-retry',
  },
});
```

Add to `package.json` scripts after `test:e2e:report`:

```json
    "test:e2e:offline": "playwright test --config playwright.offline.config.ts",
```

- [ ] **Step 5: Run the offline suite**

Run: `fnm exec --using=22 npm run build:offline && fnm exec --using=22 npm run test:e2e:offline 2>&1 | tail -4`
Expected: all specs except `offline-pwa` pass over `file://` (56 passed — 59 minus offline-pwa's 3; adjust the expectation to that spec's actual test count if different, but every non-ignored test MUST pass). localStorage-based persistence and audio both work on `file://` in Playwright's Chromium.

- [ ] **Step 6: Commit**

```bash
git add e2e/fixtures/test.ts e2e/tests/ e2e/visual/visual.spec.ts playwright.offline.config.ts package.json
git commit -m "test: run the e2e suite against the offline artifact over file://

A shared fixture maps page.goto('/') to the artifact's file:// URL when
the config's baseURL is a file: URL (Playwright's URL joining cannot
express that), and is a passthrough for the normal http-served suites.
offline-pwa.spec.ts is excluded — the offline build has no service
worker by design."
```

### Task 4: Offline visual regression + CI wiring

**Files:**
- Create: `playwright.offline.visual.config.ts`
- Modify: `package.json` (script `test:visual:offline`), `.github/workflows/ci.yml` (build job + visual job)

**Interfaces:**
- Consumes: Task 3's fixture (already imported by `visual.spec.ts`); the pinned-image gate `e2e/fixtures/visual-gate.ts`.
- Produces: CI coverage — a future change that breaks `file://` mode fails the PR, not the release.

- [ ] **Step 1: Create playwright.offline.visual.config.ts**

```ts
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

// Visual suite against the offline single-file artifact. Inlining must not
// change a pixel, so this reuses the SAME committed baselines as the normal
// visual run (snapshot paths are derived from the spec file, not the config).
// Like playwright.visual.config.ts it only produces real results inside the
// pinned Playwright Docker image (the specs self-skip via the visual-gate
// fixture elsewhere); there is no webServer — the artifact loads via file://.
export default defineConfig({
  testDir: './e2e/visual',
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  // The scrolled-promos frame includes the online-only offline-download link
  // (hidden on file:// by design), so that one capture legitimately differs
  // from the shared online baseline — it is asserted by the online visual run
  // only. Every other screenshot must stay pixel-identical between builds.
  grepInvert: /rules modal scrolled to the promo sections/,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report-visual-offline', open: 'never' }]]
    : [['html', { outputFolder: 'playwright-report-visual-offline', open: 'never' }]],
  timeout: 15000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: pathToFileURL(path.resolve('dist-offline/index.html')).href,
  },
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
    },
  },
});
```

Add to `package.json` scripts after `test:visual`:

```json
    "test:visual:offline": "playwright test --config playwright.offline.visual.config.ts",
```

- [ ] **Step 2: Wire the build job in ci.yml**

In the `build` job, directly after the `E2E tests` step (`run: npm run test:e2e`), insert:

```yaml
      - name: Offline artifact build
        run: npm run build:offline
      - name: Offline e2e (file://)
        run: npm run test:e2e:offline
```

- [ ] **Step 3: Wire the visual job in ci.yml**

In the `visual` job, directly after the `Visual regression tests` step (`run: npm run test:visual`), insert:

```yaml
      # Same baselines as the http run above — inlining must not change a pixel.
      - name: Offline visual regression (file://)
        run: |
          npm run build:offline
          npm run test:visual:offline
```

- [ ] **Step 4: Lint and locally sanity-check**

Run: `actionlint .github/workflows/ci.yml && fnm exec --using=22 npm run test:visual:offline 2>&1 | tail -3`
Expected: actionlint reports nothing new for ci.yml; the local visual run SKIPS everything (visual-gate: not in the pinned image) and exits green — CI is where it really runs.

- [ ] **Step 5: Commit**

```bash
git add playwright.offline.visual.config.ts package.json .github/workflows/ci.yml
git commit -m "ci: gate the offline artifact in PR checks

The build job builds dist-offline and runs the file:// e2e suite; the
visual job re-runs the visual specs against the artifact using the same
committed baselines, proving inlining changes no pixels. A regression
in file:// support now fails the PR instead of shipping in a release
asset."
```

### Task 5: Download link in the rules modal

**Files:**
- Create: `src/logic/runtimeEnv.ts`
- Create: `src/components/RulesModal.test.tsx`
- Modify: `src/components/RulesModal.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `isOfflineCopy(): boolean` in `src/logic/runtimeEnv.ts`; `data-testid="offline-download-link"` anchor in the modal (Task 7 verifies it live post-merge).

- [ ] **Step 1: Write the failing component tests**

`src/components/RulesModal.test.tsx` (conventions follow `src/App.test.tsx` — jsdom project, `@testing-library/react`):

```tsx
import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RulesModal } from './RulesModal';

const mocks = vi.hoisted(() => ({ isOfflineCopy: vi.fn() }));
vi.mock('../logic/runtimeEnv', () => ({ isOfflineCopy: mocks.isOfflineCopy }));

afterEach(() => {
  cleanup();
  mocks.isOfflineCopy.mockReset();
});

describe('offline download link', () => {
  test('links to the latest release asset when running from the web', () => {
    mocks.isOfflineCopy.mockReturnValue(false);
    render(<RulesModal isOpen onClose={() => {}} />);
    expect(screen.getByTestId('offline-download-link').getAttribute('href')).toBe(
      'https://github.com/pocket-dragon/pocket-dragon.github.io/releases/latest/download/pocket-dragon.html',
    );
  });

  test('is hidden in the offline copy itself', () => {
    mocks.isOfflineCopy.mockReturnValue(true);
    render(<RulesModal isOpen onClose={() => {}} />);
    expect(screen.queryByTestId('offline-download-link')).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify both fail**

Run: `fnm exec --using=22 npx vitest run src/components/RulesModal.test.tsx --reporter=dot 2>&1 | tail -4`
Expected: FAIL — cannot resolve `../logic/runtimeEnv` (and no such testid).

- [ ] **Step 3: Implement**

`src/logic/runtimeEnv.ts`:

```ts
// True when the app runs from a downloaded offline copy (opened via file://)
// rather than the deployed site.
export function isOfflineCopy(): boolean {
  return window.location.protocol === 'file:';
}
```

In `src/components/RulesModal.tsx`: add to the imports

```tsx
import { isOfflineCopy } from '../logic/runtimeEnv';
```

and inside `<div data-testid="rules-content">`, after the `promoGames.map(...)` block's closing `))}` and before the `</div>`, insert:

```tsx
            {!isOfflineCopy() && (
              <p className="offline-download">
                Want to keep the app forever?{' '}
                <a
                  data-testid="offline-download-link"
                  href="https://github.com/pocket-dragon/pocket-dragon.github.io/releases/latest/download/pocket-dragon.html"
                >
                  Download the offline version
                </a>{' '}
                — a single file you can open in any browser, no internet needed.
              </p>
            )}
```

(End-of-body placement keeps the link out of the default and promo-expanded captures; the scrolled-promos capture DOES include it — its online baseline is regenerated via the visual-baselines workflow, and the offline visual run excludes that one test since the link is hidden on file:// by design. No `download` attribute — it is ignored cross-origin; GitHub serves release assets as attachments anyway.)

- [ ] **Step 4: Run tests green**

Run: `fnm exec --using=22 npx vitest run --reporter=dot 2>&1 | tail -3`
Expected: 111 tests pass (109 + the 2 new).

- [ ] **Step 5: Rebuild the artifact and re-run the offline e2e (link must be absent on file://)**

Run: `fnm exec --using=22 npm run build:offline && fnm exec --using=22 npm run test:e2e:offline 2>&1 | tail -3`
Expected: still green.

- [ ] **Step 6: Commit**

```bash
git add src/logic/runtimeEnv.ts src/components/RulesModal.tsx src/components/RulesModal.test.tsx
git commit -m "feat: add offline-copy download link to the rules modal

Links to the latest release's pocket-dragon.html via GitHub's stable
releases/latest/download redirect, so the app never needs updating per
release. Hidden when running from the offline copy itself
(location.protocol === 'file:')."
```

### Task 6: Attach the artifact to releases

**Files:**
- Modify: `release.config.js`, `.github/workflows/orchestrate-deploy.yml` (release job)

**Interfaces:**
- Consumes: `npm run build:offline` (Task 2); the `release` job added in PR 1.
- Produces: every future release carries `pocket-dragon.html`; the modal link (Task 5) resolves as soon as this PR's own release publishes.

- [ ] **Step 1: Update release.config.js**

Full new content:

```js
export default {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: "dist-offline/index.html",
            name: "pocket-dragon.html",
            label: "Pocket Dragon — offline version (download and open in a browser)",
          },
        ],
        // The release job's Report-failure step already opens a deploy-failure
        // issue; the plugin's own failure issue would duplicate it.
        failCommentCondition: false,
      },
    ],
  ],
};
```

- [ ] **Step 2: Build the artifact in the release job**

In `.github/workflows/orchestrate-deploy.yml`, in the `release` job, between `- run: npm ci` and the `Semantic release` step, insert:

```yaml
      # The offline artifact attached to the release by release.config.js.
      - name: Build offline artifact
        run: npm run build:offline
```

- [ ] **Step 3: Verify**

Run: `actionlint .github/workflows/orchestrate-deploy.yml; fnm exec --using=22 npx semantic-release --dry-run --no-ci 2>&1 | grep -E "Verified|verifyConditions|EINVALID" | head -5`
Expected: actionlint shows only the two pre-existing SC2034 warnings; the dry run's verifyConditions for @semantic-release/github completes without config errors (it will then warn the current branch isn't `main` and stop — that's fine, config validation is what matters here).

- [ ] **Step 4: Commit**

```bash
git add release.config.js .github/workflows/orchestrate-deploy.yml
git commit -m "ci: attach the offline artifact to releases

The release job builds dist-offline and @semantic-release/github
uploads it as pocket-dragon.html with a stable
releases/latest/download URL. Also disables the plugin's own
failure-issue comments — the workflow's deploy-failure issue already
covers that."
```

### Task 7: Push, PR, CI

**Files:** none

- [ ] **Step 1: Push and create the PR**

```bash
git push -u origin feat/offline-artifact
gh pr create --repo pocket-dragon/pocket-dragon.github.io \
  --title "feat: downloadable offline version (single-file build, release asset, modal link)" \
  --body "$(cat <<'EOF'
Part 3 of 3. Closes #9.

- `npm run build:offline` → one self-contained `dist-offline/index.html`
  (~3.2 MB): JS/CSS inlined (inline module scripts dodge the file://
  CORS block), all media as data URIs (PR 2's imports +
  vite-plugin-singlefile), no service worker, publicDir off, one
  inlined favicon.
- Every release now ships it as `pocket-dragon.html`; the rules modal
  links to `releases/latest/download/pocket-dragon.html` (hidden when
  already running from the offline copy). This PR's own release makes
  the link live minutes after merge.
- The full e2e suite (minus the service-worker spec) and the visual
  suite both re-run against the artifact over real `file://` URLs in CI,
  sharing the committed visual baselines — file:// breakage now fails
  PRs.
- Also sets `failCommentCondition: false` (deferred from #113): the
  workflow's deploy-failure issue already covers release failures.

Design: docs/superpowers/specs/2026-07-16-downloadable-offline-build-design.md
EOF
)"
```

- [ ] **Step 2: Watch CI**

Run: `gh pr checks feat/offline-artifact --repo pocket-dragon/pocket-dragon.github.io --watch`
Expected: all green. If ONLY the offline visual step fails with sub-pixel diffs, the fallback (pre-agreed in the spec) is to demote that step: append `continue-on-error: true` to the `Offline visual regression (file://)` step with a comment `# Advisory: file:// rendering diffs under investigation — functional file:// suite above stays blocking`, commit as `fixup!` to the Task 4 commit, autosquash, re-push. The NORMAL visual job's scrolled-promos baseline is expected to be regenerated before the PR goes green: run `gh workflow run visual-baselines.yml --ref feat/offline-artifact`, wait for it to commit the updated baseline to the branch, and verify only that one snapshot changed.

- [ ] **Step 3: Hand off for merge**

Report to Adrian: PR ready for review/merge (rebase-and-merge). STOP; Task 8 runs after merge.

### Task 8: Post-merge verification (closes the program)

**Files:** none

- [ ] **Step 1: Watch the pipeline; expect a release WITH the asset**

```bash
RID=$(gh run list --repo pocket-dragon/pocket-dragon.github.io \
  --workflow orchestrate-deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RID" --repo pocket-dragon/pocket-dragon.github.io --interval 30 --exit-status
gh release view --repo pocket-dragon/pocket-dragon.github.io --json tagName,assets \
  -q '{tag: .tagName, assets: [.assets[].name]}'
```

Expected: pipeline + release job green; new minor release (v3.2.0) listing asset `pocket-dragon.html`.

- [ ] **Step 2: Download through the user path and verify**

```bash
curl -sL -o /tmp/pocket-dragon.html \
  https://github.com/pocket-dragon/pocket-dragon.github.io/releases/latest/download/pocket-dragon.html
ls -la /tmp/pocket-dragon.html
```

Then boot `/tmp/pocket-dragon.html` via `file://` with the Task 2 boot script pattern and confirm: app renders, no console errors, and `[data-testid="offline-download-link"]` is ABSENT (we're in the offline copy).

- [ ] **Step 3: Verify the live site shows the link**

Confirm https://pocket-dragon.github.io/ rules modal contains the download link (via a quick Playwright check against the live URL).

- [ ] **Step 4: Confirm issue #9 auto-closed**

Run: `gh issue view 9 --repo pocket-dragon/pocket-dragon.github.io --json state -q .state`
Expected: `CLOSED`.

## Self-Review Notes

- Spec coverage: single-file artifact ✔ (T2, spike-verified 3.2 MB — below the spec's 6–7 MB estimate since icons aren't shipped), favicon inlined ✔ (T2), release asset with exact label ✔ (T6), modal link + hidden-on-file: ✔ (T5), e2e suite minus offline-pwa over real file:// ✔ (T3), visual suite against artifact with shared baselines ✔ (T4), CI-blocking with the spec's agreed advisory fallback for visual-offline flake only ✔ (T7), deferred failCommentCondition from PR 1 ✔ (T6).
- The spec's `transformIndexHtml` "strip dangling links" is implemented plus `publicDir: false`, which the spec didn't name but is what actually makes the output a single file; noted in the T2 commit message.
- Type consistency: `test`/`expect` re-exports (T3) are consumed by both offline configs via the spec files; `isOfflineCopy` name matches between module, component, and mock.
