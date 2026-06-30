# Test Suite Stage 1: e2e against the built bundle + PWA build assertion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the e2e suite run against the production-built, served bundle (`vite preview`) instead of the dev server, and add a fast assertion that the PWA service worker built correctly — so a dependency bump that breaks the service worker can no longer go green.

**Architecture:** Two independent deliverables in one PR (GitHub issue #81). (1) A pure `inspectPwaBuild()` function over already-read build outputs, unit-tested with synthetic inputs and run against the real `dist/` via a dedicated vitest config + npm script + CI step. (2) A Playwright `webServer`/`baseURL` switch from `npm run dev` to `vite build` + `vite preview`, leaving every existing spec untouched and green.

**Tech Stack:** Vite 8, vite-plugin-pwa 1.3 (workbox `generateSW`), Vitest 4, Playwright 1.59, TypeScript 6, Node 22 (CI, via `.nvmrc`).

## Global Constraints

- Commits follow **Conventional Commits** (commitlint is CI-enforced); **no Claude/AI attribution** in commit messages.
- Code, identifiers, and comments in **American English**.
- The branch targets **`dev`** via a PR; merge method is **rebase-only**; the PR needs the maintainer's approval (the bot cannot self-approve its own PRs).
- **All 65 unit tests and all 8 e2e specs must stay green.** No behavioral change to the app itself.
- **Add no new runtime or type dependency.** In particular do **not** add `@types/node`: it would globally retype `setInterval` to `NodeJS.Timeout` and break `App.tsx`'s `useRef<number>` under `tsc`. The `tests/` directory is excluded from `tsc` (see `tsconfig.json` `include: ["src"]`), and Vitest transpiles via esbuild without type-checking, so `node:fs`/`node:path` imports there run without any types package.
- `base: '/'` and the existing `vite.config.ts` are correct and must not change.

---

## Task 1: PWA build assertion

A breakage in Vite / `vite-plugin-pwa` / workbox can leave `dist/sw.js` missing, empty, or with an un-injected precache list while `vite build` still exits 0. This task adds a check that fails the build in that case. The assertion logic is a pure function so it can be tested deterministically without running a real build; a thin integration test runs it against the real `dist/`.

**Files:**
- Create: `tests/pwaBuild.ts` (pure inspection logic — no Node/DOM imports)
- Create: `tests/pwa-build.test.ts` (unit cases + one real-`dist/` integration case)
- Create: `vitest.pwa.config.ts` (isolated vitest config so this never runs in the normal unit suite)
- Modify: `package.json` (add the `test:pwa` script — no dependency change)
- Modify: `.github/workflows/ci.yml` (run `npm run test:pwa` after the build)

**Interfaces:**
- Produces:
  - `findEntryChunk(assetFilenames: string[]): string | undefined`
  - `inspectPwaBuild(input: { swSource: string | null; assetFilenames: string[] }): { ok: boolean; errors: string[] }`
- Consumes: nothing from other tasks.

**Why a separate `vitest.pwa.config.ts`:** the default config (`vite.config.ts`) has `test.include: ['src/**/*.test.ts']`. A Vitest path filter only selects from files already matched by `include`, so `vitest run tests/pwa-build.test.ts` against the default config finds **nothing**. Every run of this file therefore passes `--config vitest.pwa.config.ts`, whose `include` is the file itself. This also keeps the `dist/`-dependent integration case out of the normal `test:unit` run.

- [ ] **Step 1: Create the isolated vitest config**

Create `vitest.pwa.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

// Runs the PWA build assertion only. Kept separate from vite.config.ts's
// test.include ('src/**/*.test.ts') so the dist-dependent integration test
// never runs as part of the normal unit suite, and so a path filter can
// actually select this file (Vitest filters within `include`).
export default defineConfig({
  test: {
    include: ['tests/pwa-build.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 2: Write the failing unit tests**

Create `tests/pwa-build.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { findEntryChunk, inspectPwaBuild } from './pwaBuild';

// A minimal stand-in for a real workbox-generated sw.js precache call.
const validSw = `precacheAndRoute([{"revision":null,"url":"assets/index-AbCd1234.js"},{"revision":"x","url":"index.html"}]);`;
const validAssets = ['index-AbCd1234.js', 'index-ZzZz9999.css'];

describe('findEntryChunk', () => {
  test('returns the hashed entry chunk', () => {
    expect(findEntryChunk(validAssets)).toBe('index-AbCd1234.js');
  });

  test('returns undefined when no entry chunk is present', () => {
    expect(findEntryChunk(['vendor-1234.js', 'styles.css'])).toBeUndefined();
  });
});

describe('inspectPwaBuild', () => {
  test('accepts a valid build', () => {
    const report = inspectPwaBuild({ swSource: validSw, assetFilenames: validAssets });
    expect(report).toEqual({ ok: true, errors: [] });
  });

  test('rejects a missing service worker', () => {
    const report = inspectPwaBuild({ swSource: null, assetFilenames: validAssets });
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toContain('missing');
  });

  test('rejects an empty service worker', () => {
    const report = inspectPwaBuild({ swSource: '   ', assetFilenames: validAssets });
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toContain('empty');
  });

  test('rejects an un-injected precache manifest', () => {
    const report = inspectPwaBuild({
      swSource: 'precacheAndRoute(self.__WB_MANIFEST);',
      assetFilenames: validAssets,
    });
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toContain('__WB_MANIFEST');
  });

  test('rejects a service worker that does not reference the entry chunk', () => {
    const report = inspectPwaBuild({
      swSource: 'precacheAndRoute([{"revision":"x","url":"index.html"}]);',
      assetFilenames: validAssets,
    });
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toContain('index-AbCd1234.js');
  });

  test('rejects a build with no entry chunk at all', () => {
    const report = inspectPwaBuild({ swSource: validSw, assetFilenames: ['styles.css'] });
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toContain('entry chunk');
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run --config vitest.pwa.config.ts`
Expected: FAIL — `Failed to resolve import "./pwaBuild"` (the module does not exist yet).

- [ ] **Step 4: Implement the pure inspection module**

Create `tests/pwaBuild.ts`:

```ts
// Build-time validation that vite-plugin-pwa produced a usable service worker.
// Pure over already-read inputs so it can be unit-tested without a real build;
// the integration test feeds it the contents of the real dist/ directory.

export interface PwaBuildInput {
  // Contents of dist/sw.js, or null when the file is absent.
  swSource: string | null;
  // Basenames of the files in dist/assets (e.g. "index-AbCd1234.js").
  assetFilenames: string[];
}

export interface PwaBuildReport {
  ok: boolean;
  errors: string[];
}

// Vite emits the app entry as assets/index-<hash>.js.
const ENTRY_CHUNK = /^index-[\w-]+\.js$/;

export function findEntryChunk(assetFilenames: string[]): string | undefined {
  return assetFilenames.find((name) => ENTRY_CHUNK.test(name));
}

export function inspectPwaBuild(input: PwaBuildInput): PwaBuildReport {
  const { swSource, assetFilenames } = input;
  const errors: string[] = [];

  if (swSource === null) {
    errors.push('dist/sw.js is missing — the PWA service worker was not generated');
    return { ok: false, errors };
  }

  if (swSource.trim().length === 0) {
    errors.push('dist/sw.js is empty');
  }

  if (swSource.includes('self.__WB_MANIFEST')) {
    errors.push(
      'dist/sw.js still contains the un-injected self.__WB_MANIFEST token — precache injection failed',
    );
  }

  const entry = findEntryChunk(assetFilenames);
  if (!entry) {
    errors.push('no hashed entry chunk (assets/index-*.js) found in the build');
  } else if (!swSource.includes(entry)) {
    errors.push(
      `dist/sw.js does not reference the entry chunk ${entry} — the precache list looks wrong`,
    );
  }

  return { ok: errors.length === 0, errors };
}
```

- [ ] **Step 5: Run the unit tests to verify they pass**

Run: `npx vitest run --config vitest.pwa.config.ts`
Expected: the 8 cases above PASS. (The integration case is added next.)

- [ ] **Step 6: Add the real-`dist/` integration case**

Append to `tests/pwa-build.test.ts`:

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('real production build', () => {
  test('produces a valid PWA service worker', () => {
    const swPath = join('dist', 'sw.js');
    const assetsDir = join('dist', 'assets');

    if (!existsSync(swPath)) {
      throw new Error('dist/sw.js not found — run `npm run build` before `npm run test:pwa`');
    }

    const swSource = readFileSync(swPath, 'utf8');
    const assetFilenames = existsSync(assetsDir) ? readdirSync(assetsDir) : [];

    const report = inspectPwaBuild({ swSource, assetFilenames });
    expect(report.errors).toEqual([]);
  });
});
```

- [ ] **Step 7: Add the `test:pwa` script**

In `package.json`, add to `"scripts"` (after `"test:unit:coverage"`):

```json
    "test:pwa": "vitest run --config vitest.pwa.config.ts",
```

(No dependency change — see Global Constraints on why `@types/node` must not be added.)

- [ ] **Step 8: Verify the full check against a real build**

Run: `npm run build && npm run test:pwa`
Expected: build succeeds and `test:pwa` reports all cases (including `real production build › produces a valid PWA service worker`) PASS.

- [ ] **Step 9: Prove the check actually catches a broken build**

Run: `mv dist/sw.js dist/sw.js.bak && (npm run test:pwa; echo "exit=$?") ; mv dist/sw.js.bak dist/sw.js`
Expected: the run FAILS with `dist/sw.js not found ...` and prints `exit=1`, then the file is restored. (Confirms a missing service worker fails the gate.)

- [ ] **Step 10: Wire the check into CI**

In `.github/workflows/ci.yml`, in the `build` job, add a step immediately after the `Unit tests` step:

```yaml
    - name: PWA build check
      run: npm run test:pwa
```

(The `npm install and build` step earlier in the same job already produced `dist/`, so `test:pwa`'s integration case has a real build to inspect.)

- [ ] **Step 11: Commit**

```bash
git add tests/pwaBuild.ts tests/pwa-build.test.ts vitest.pwa.config.ts package.json .github/workflows/ci.yml
git commit -m "test: assert the PWA service worker built correctly

Add inspectPwaBuild() plus a dedicated test:pwa run (and CI step) that fails
the build when dist/sw.js is missing, empty, has an un-injected precache
manifest, or does not reference the hashed entry chunk. Guards against a Vite
or vite-plugin-pwa bump silently breaking the service worker."
```

---

## Task 2: Run e2e against the built + served bundle

The dev server has no service worker, no minification, and no production config, so the current e2e suite never exercises what actually ships. Point Playwright at `vite preview` over a real build. No spec files change — only the server they run against.

**Files:**
- Modify: `playwright.config.ts` (the `use.baseURL` and `webServer` blocks)

**Interfaces:**
- Consumes: nothing. (Task 2 is independent of Task 1; either order is fine.)
- Produces: a preview-served e2e setup that Stages 3 and 4 build on.

- [ ] **Step 1: Confirm the current suite is green (baseline)**

Run: `npm run test:e2e`
Expected: 8 spec files, all tests PASS (against the dev server, as today).

- [ ] **Step 2: Switch Playwright to the preview build**

In `playwright.config.ts`, change `use.baseURL` from `'http://localhost:5173'` to `'http://localhost:4173'`, and replace the `webServer` block with:

```ts
  webServer: {
    // Test the real production bundle (service worker, minification, prod
    // config) — not the dev server. vite preview serves dist/ on :4173.
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
```

Leave `testDir`, `fullyParallel`, `retries`, `workers`, `reporter`, `timeout`, and the rest of `use` unchanged.

- [ ] **Step 3: Run the suite against the preview build**

Run: `npm run test:e2e`
Expected: the same 8 spec files all PASS, now served from `vite preview` on `:4173`. (The `page.clock` fixture is client-side and unaffected by the server change.)

- [ ] **Step 4: If a spec flakes on a service-worker-triggered reload**

The app registers an `autoUpdate` service worker. A fresh Playwright context per test means no SW persists across tests, so the first load registers but does not reload. If — and only if — a spec intermittently fails due to a mid-test navigation, re-run to confirm flakiness:

Run: `npm run test:e2e -- --repeat-each=3`
Expected: stable PASS. If genuinely flaky, STOP and report — do not paper over it with arbitrary waits; the fix (e.g. waiting for SW activation in a fixture) is a design decision for the maintainer.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts
git commit -m "test(e2e): run against the built bundle via vite preview

Point Playwright at a production build served by vite preview (:4173) instead
of the dev server, so the suite exercises the real service worker, minified
output, and production config. No spec changes. Prerequisite for the offline
and visual-regression stages."
```

---

## Self-Review

**1. Spec coverage (Stage 1 scope from the design doc):**
- "Migrate the Playwright `webServer` to a built-and-served bundle; update `baseURL`/port" → Task 2, Steps 2–3. ✓
- "Confirm all 8 existing e2e specs stay green against preview" → Task 2, Steps 3–4. ✓
- "Add a PWA build assertion: `dist/sw.js` exists, non-empty, non-empty precache list, references the real hashed entry" → Task 1, `inspectPwaBuild` (missing/empty/`__WB_MANIFEST`/entry-reference checks) + CI wiring. ✓

**2. Placeholder scan:** No TBD/TODO/"handle edge cases"; every code step contains complete code. ✓

**3. Type consistency:** `inspectPwaBuild` and `findEntryChunk` signatures are identical in the interface block, the test (Step 2), the implementation (Step 4), and the integration case (Step 6). The `PwaBuildInput`/`PwaBuildReport` shapes match their usages. ✓

**Note for the implementer:** Task 1 and Task 2 are independent and may be done in either order, but keep them as the two commits above so the reviewer can accept each on its own. Every Task 1 vitest run uses `--config vitest.pwa.config.ts`.
