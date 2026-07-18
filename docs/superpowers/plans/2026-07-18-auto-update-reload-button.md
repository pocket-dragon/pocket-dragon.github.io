# Auto-update "click to reload" button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Detect a newly-deployed version and surface a manual "click to reload" button that never reloads on its own and appears only when it is safe and unobtrusive.

**Architecture:** Switch `vite-plugin-pwa` from `registerType: 'autoUpdate'` to `'prompt'` (keeping `clientsClaim: true`) so a new service worker waits instead of silently taking over. A thin `useAppUpdate` hook wraps the plugin's React virtual module and exposes `needRefresh` as `updateAvailable` plus a `reload` action. A pure predicate decides when the button shows; a presentational `ReloadButton` renders it. The offline `file://` build has no service worker, so the virtual module is aliased to a no-op stub there.

**Tech Stack:** React 19, TypeScript, Vite 8, vite-plugin-pwa ^1.3.0 (Workbox), Vitest (unit + jsdom component), Playwright (e2e + visual).

## Global Constraints

- **Never reload automatically.** The button click is the only path to a reload. No auto-apply on focus, no interval, no timer.
- **Detection is visibility-triggered only:** one `registration.update()` on first registration, plus one on each `visibilitychange → visible`. No `setInterval`, no background polling.
- **Button copy, verbatim:** `New version available — tap to reload` (em-dash `—`, not a hyphen).
- **Button visibility rule:** show only when `updateAvailable && !isRunning && !gameResult && !rulesOpen && !isOffline`. Hidden during live play, on the game-over screen, while the rules modal is open, and in the offline copy.
- **PWA config:** `registerType: 'prompt'` with an explicit `workbox.clientsClaim: true`. All other manifest/workbox settings unchanged.
- **Offline single-file build must no-op:** the reload button can never appear in the `file://` build.
- **Keep every `RulesModal` prop reference-stable** — an unstable prop breaks its memoization and re-renders it on every game tick. Do not touch its props.
- **American English** in all identifiers, comments, and copy.
- **Run all npm/npx commands under Node 22** (`.nvmrc`), e.g. `fnm exec --using=22 -- npm run build`. The non-interactive shell otherwise defaults to Node 24/npm 11, which can break native deps.
- **Commits:** atomic, conventional-commit messages, one per task. Never squash-merge later.
- **`vite-plugin-pwa` React hook API (v1.x):** `useRegisterSW({ onRegisteredSW(swScriptUrl, registration), onRegisterError(error) })` returns `{ needRefresh: [boolean, setter], offlineReady: [boolean, setter], updateServiceWorker: (reloadPage?: boolean) => Promise<void> }`. `needRefresh` and `offlineReady` are **tuples**.

---

## File Structure

**Create:**
- `src/logic/updateVisibility.ts` — pure predicate `shouldShowReloadButton(...)`.
- `src/logic/updateVisibility.test.ts` — unit test (node project).
- `src/components/ReloadButton.tsx` — presentational button.
- `src/components/ReloadButton.test.tsx` — component test (jsdom project).
- `src/logic/useAppUpdate.ts` — thin hook wrapping the virtual module (the only importer of it).
- `src/pwaRegisterStub.ts` — no-op `useRegisterSW` for the offline build alias.

**Modify:**
- `vite.config.ts` — `registerType: 'prompt'` + `workbox.clientsClaim: true`.
- `vite.offline.config.ts` — alias `virtual:pwa-register/react` → the stub.
- `src/vite-env.d.ts` — add `vite-plugin-pwa/react` types reference.
- `src/App.tsx` — call the hook, compute the predicate, render `<ReloadButton>`.
- `src/App.test.tsx` — mock the hook; assert show/hide across game phases + click.
- `src/App.css` — `.reload-button` styling.
- `e2e/fixtures/selectors.ts` — add `reloadButton`.
- `e2e/tests/offline-pwa.spec.ts` — update the now-stale `autoUpdate` comment; add a "button absent on first load" assertion.

---

## Task 1: Pure visibility predicate

**Files:**
- Create: `src/logic/updateVisibility.ts`
- Test: `src/logic/updateVisibility.test.ts`

**Interfaces:**
- Consumes: `GameResult` type from `src/logic/gameState.ts`.
- Produces: `shouldShowReloadButton(args: { updateAvailable: boolean; isRunning: boolean; gameResult: GameResult | null; rulesOpen: boolean; isOffline: boolean }): boolean` — used by `App.tsx` in Task 4.

- [ ] **Step 1: Write the failing test**

Create `src/logic/updateVisibility.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { shouldShowReloadButton } from './updateVisibility';

// The one input combination that must show the button. Each test below flips
// exactly one field away from this and asserts the button hides.
const shown = {
  updateAvailable: true,
  isRunning: false,
  gameResult: null,
  rulesOpen: false,
  isOffline: false,
} as const;

describe('shouldShowReloadButton', () => {
  it('shows when an update is available and nothing blocks it', () => {
    expect(shouldShowReloadButton({ ...shown })).toBe(true);
  });

  it('hides when no update is available', () => {
    expect(shouldShowReloadButton({ ...shown, updateAvailable: false })).toBe(false);
  });

  it('hides while a game is running', () => {
    expect(shouldShowReloadButton({ ...shown, isRunning: true })).toBe(false);
  });

  it('hides on the game-over screen', () => {
    expect(
      shouldShowReloadButton({
        ...shown,
        gameResult: { won: true, heading: 'You Won!', text: '', buttonLabel: 'OK' },
      }),
    ).toBe(false);
  });

  it('hides while the rules modal is open', () => {
    expect(shouldShowReloadButton({ ...shown, rulesOpen: true })).toBe(false);
  });

  it('hides in the offline copy', () => {
    expect(shouldShowReloadButton({ ...shown, isOffline: true })).toBe(false);
  });
});
```

> Note: confirm the `GameResult` shape against `src/logic/gameState.ts` before writing the game-over case — copy its actual required fields. If it differs from `{ won, heading, text, buttonLabel }`, adjust the literal so it type-checks.

- [ ] **Step 2: Run test to verify it fails**

Run: `fnm exec --using=22 -- npx vitest run src/logic/updateVisibility.test.ts`
Expected: FAIL — `shouldShowReloadButton` is not exported / module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/logic/updateVisibility.ts`:

```ts
import type { GameResult } from './gameState';

/**
 * Whether the "click to reload" button should be visible.
 *
 * Shown only when a new version is waiting AND it is safe and unobtrusive to
 * offer a reload: no game actively running, no game-over dialog, no rules modal
 * open, and not the offline copy (which has no service worker). We never reload
 * automatically — this only governs whether the button is offered.
 */
export function shouldShowReloadButton(args: {
  updateAvailable: boolean;
  isRunning: boolean;
  gameResult: GameResult | null;
  rulesOpen: boolean;
  isOffline: boolean;
}): boolean {
  const { updateAvailable, isRunning, gameResult, rulesOpen, isOffline } = args;
  return updateAvailable && !isRunning && !gameResult && !rulesOpen && !isOffline;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `fnm exec --using=22 -- npx vitest run src/logic/updateVisibility.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/logic/updateVisibility.ts src/logic/updateVisibility.test.ts
git commit -m "feat(update): pure predicate for reload-button visibility"
```

---

## Task 2: `ReloadButton` component + styling

**Files:**
- Create: `src/components/ReloadButton.tsx`
- Test: `src/components/ReloadButton.test.tsx`
- Modify: `src/App.css` (append `.reload-button`)

**Interfaces:**
- Produces: `ReloadButton(props: { visible: boolean; onReload: () => void }): JSX.Element | null` — used by `App.tsx` in Task 4. Renders `data-testid="reload-button"`.

- [ ] **Step 1: Write the failing test**

Create `src/components/ReloadButton.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReloadButton } from './ReloadButton';

describe('ReloadButton', () => {
  it('renders nothing when not visible', () => {
    render(<ReloadButton visible={false} onReload={() => {}} />);
    expect(screen.queryByTestId('reload-button')).toBeNull();
  });

  it('renders the reload pill when visible', () => {
    render(<ReloadButton visible onReload={() => {}} />);
    const button = screen.getByTestId('reload-button');
    expect(button.textContent).toBe('New version available — tap to reload');
  });

  it('calls onReload when clicked', () => {
    const onReload = vi.fn();
    render(<ReloadButton visible onReload={onReload} />);
    fireEvent.click(screen.getByTestId('reload-button'));
    expect(onReload).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `fnm exec --using=22 -- npx vitest run src/components/ReloadButton.test.tsx`
Expected: FAIL — cannot find module `./ReloadButton`.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/ReloadButton.tsx`:

```tsx
interface ReloadButtonProps {
  visible: boolean;
  onReload: () => void;
}

/**
 * "Click to reload" affordance for picking up a newly-deployed version.
 * Purely presentational — the parent decides `visible` (see
 * shouldShowReloadButton) and supplies `onReload`. Never reloads on its own.
 */
export function ReloadButton({ visible, onReload }: ReloadButtonProps) {
  if (!visible) return null;
  return (
    <button
      type="button"
      className="reload-button"
      data-testid="reload-button"
      aria-live="polite"
      onClick={onReload}
    >
      New version available — tap to reload
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `fnm exec --using=22 -- npx vitest run src/components/ReloadButton.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Add the styling**

Append to `src/App.css`:

```css
/* "New version available" affordance (auto-update). Fixed bottom-center pill,
   above normal content. It is gated off whenever a game is running or a modal
   is open (see shouldShowReloadButton), so it never overlaps a dialog. */
.reload-button {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 200;
  padding: 10px 18px;
  border: none;
  border-radius: 999px;
  background-color: var(--color-primary);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/ReloadButton.tsx src/components/ReloadButton.test.tsx src/App.css
git commit -m "feat(update): add ReloadButton pill component and styling"
```

---

## Task 3: PWA plumbing — config switch, types, offline stub, hook

This task has no unit test (it is config + a browser-coupled hook). Its deliverable is verified by successful prod and offline builds and by typecheck. Behavior is exercised end-to-end in Task 5.

**Files:**
- Modify: `vite.config.ts` (lines 9-10 region and the `workbox` block ~73-97)
- Modify: `src/vite-env.d.ts`
- Create: `src/pwaRegisterStub.ts`
- Modify: `vite.offline.config.ts`
- Create: `src/logic/useAppUpdate.ts`

**Interfaces:**
- Produces: `useAppUpdate(): { updateAvailable: boolean; reload: () => void }` — used by `App.tsx` in Task 4.
- Consumes: `useRegisterSW` from `virtual:pwa-register/react` (aliased to `src/pwaRegisterStub.ts` in the offline build).

- [ ] **Step 1: Switch the PWA register type and keep clientsClaim**

In `vite.config.ts`, change the register type:

```ts
      registerType: 'prompt',
```

and add `clientsClaim: true` to the existing `workbox` object (alongside `globPatterns`, `navigateFallback`, etc.):

```ts
      workbox: {
        clientsClaim: true,
        globPatterns: [
          // ...unchanged...
        ],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [],
      },
```

Leave `injectRegister` at its default (`'auto'`) — once `useAppUpdate` imports the virtual module, the plugin registers via the hook. (Task 5's offline e2e is the gate that proves the SW still registers and controls the page.)

- [ ] **Step 2: Add the virtual-module types reference**

In `src/vite-env.d.ts`, add a second reference line under the existing `vite/client` one:

```ts
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
```

- [ ] **Step 3: Create the offline stub**

Create `src/pwaRegisterStub.ts`:

```ts
// Offline (file://) single-file build has no VitePWA plugin and therefore no
// `virtual:pwa-register/react`. vite.offline.config.ts aliases that virtual
// module to this no-op so useAppUpdate.ts still compiles and the reload button
// stays permanently hidden there (needRefresh never flips). Shape must match
// the real useRegisterSW return value that useAppUpdate destructures.
export function useRegisterSW(): {
  needRefresh: [boolean, (value: boolean) => void];
  offlineReady: [boolean, (value: boolean) => void];
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
} {
  return {
    needRefresh: [false, () => {}],
    offlineReady: [false, () => {}],
    updateServiceWorker: () => Promise.resolve(),
  };
}
```

- [ ] **Step 4: Alias the virtual module in the offline build**

In `vite.offline.config.ts`, add the `node:url` import and a `resolve.alias`. Full edited config:

```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// ...inlineFavicon() unchanged...

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), viteSingleFile(), inlineFavicon()],
  resolve: {
    alias: {
      // No service worker on file:// — map the PWA register hook to a no-op so
      // useAppUpdate compiles and the reload button never appears offline.
      'virtual:pwa-register/react': fileURLToPath(
        new URL('./src/pwaRegisterStub.ts', import.meta.url),
      ),
    },
  },
  build: {
    target: 'es2017',
    outDir: 'dist-offline',
  },
});
```

- [ ] **Step 5: Create the `useAppUpdate` hook**

Create `src/logic/useAppUpdate.ts`:

```ts
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Wraps vite-plugin-pwa's React registration hook. Exposes whether a new
 * version is waiting (`updateAvailable`) and a `reload` that applies it.
 *
 * Detection is visibility-triggered only: the initial registration performs
 * the first check, and we re-check whenever the tab becomes visible again.
 * There is no interval and no background polling. We NEVER reload on our own —
 * `reload` is called only from the user's button click.
 */
export function useAppUpdate(): { updateAvailable: boolean; reload: () => void } {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swScriptUrl, registration) {
      if (!registration) return;
      // App-lifetime listener (onRegisteredSW fires once per registration).
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          void registration.update();
        }
      });
    },
  });

  return {
    updateAvailable: needRefresh,
    reload: () => {
      void updateServiceWorker(true);
    },
  };
}
```

- [ ] **Step 6: Verify prod build + typecheck**

Run: `fnm exec --using=22 -- npm run build`
Expected: PASS (`tsc` finds the virtual-module types via the reference; `vite build` succeeds). Confirm `dist/sw.js` exists afterward: `ls dist/sw.js`.

- [ ] **Step 7: Verify the PWA precache is still intact**

Run: `fnm exec --using=22 -- npm run test:pwa`
Expected: PASS — the `prompt` switch does not change the precache manifest shape; the real-build assertions still hold.

- [ ] **Step 8: Verify offline build resolves the stub**

Run: `fnm exec --using=22 -- npm run build:offline`
Expected: PASS — `virtual:pwa-register/react` resolves to `src/pwaRegisterStub.ts`; `dist-offline/index.html` is produced with no unresolved-import error.

- [ ] **Step 9: Commit**

```bash
git add vite.config.ts vite.offline.config.ts src/vite-env.d.ts src/pwaRegisterStub.ts src/logic/useAppUpdate.ts
git commit -m "feat(update): switch PWA to prompt mode and add useAppUpdate hook"
```

---

## Task 4: Wire the button into `App.tsx`

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: `useAppUpdate()` (Task 3), `shouldShowReloadButton(...)` (Task 1), `ReloadButton` (Task 2), `isOfflineCopy()` from `src/logic/runtimeEnv.ts`.

- [ ] **Step 1: Write the failing tests**

At the **top** of `src/App.test.tsx`, after the existing imports, add a hoisted mock of the hook (App calls it during render):

```tsx
const mockUpdate = vi.hoisted(() => ({
  updateAvailable: false,
  reload: vi.fn(),
}));
vi.mock('./logic/useAppUpdate', () => ({
  useAppUpdate: () => mockUpdate,
}));
```

Then add this `describe` block at the end of the file (before the final closing brace of the file is not needed — it is top-level):

```tsx
describe('App reload button', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUpdate.updateAvailable = false;
    mockUpdate.reload.mockClear();
  });

  it('is absent when no update is available', () => {
    mockUpdate.updateAvailable = false;
    render(<App />);
    expect(screen.queryByTestId('reload-button')).toBeNull();
  });

  it('shows before a game starts when an update is available', () => {
    mockUpdate.updateAvailable = true;
    render(<App />);
    expect(screen.getByTestId('reload-button')).toBeTruthy();
  });

  it('hides while a game is running', () => {
    mockUpdate.updateAvailable = true;
    render(<App />);
    fireEvent.click(screen.getByTestId('start-pause')); // START
    expect(screen.queryByTestId('reload-button')).toBeNull();
  });

  it('shows again while a game is paused', () => {
    mockUpdate.updateAvailable = true;
    render(<App />);
    fireEvent.click(screen.getByTestId('start-pause')); // START
    fireEvent.click(screen.getByTestId('start-pause')); // PAUSE
    expect(screen.getByTestId('reload-button')).toBeTruthy();
  });

  it('hides on the game-over screen', () => {
    mockUpdate.updateAvailable = true;
    render(<App />);
    fireEvent.click(screen.getByTestId('start-pause')); // START
    const logSuccess = screen.getByTestId('log-success');
    for (let i = 0; i < EASY.goalNumberOfSuccesses; i++) {
      fireEvent.click(logSuccess);
    }
    expect(screen.getByTestId('game-over-heading')).toBeTruthy(); // sanity: we are on the game-over screen
    expect(screen.queryByTestId('reload-button')).toBeNull();
  });

  it('hides while the rules modal is open', () => {
    mockUpdate.updateAvailable = true;
    render(<App />);
    fireEvent.click(screen.getByTestId('rules-link'));
    expect(screen.queryByTestId('reload-button')).toBeNull();
  });

  it('calls reload when clicked', () => {
    mockUpdate.updateAvailable = true;
    render(<App />);
    fireEvent.click(screen.getByTestId('reload-button'));
    expect(mockUpdate.reload).toHaveBeenCalledTimes(1);
  });
});
```

`EASY`, `render`, `screen`, `fireEvent`, `describe`, `it`, `expect`, `vi`, and `beforeEach` — ensure all are imported at the top of the file. The existing file imports most; **add `beforeEach` to the `vitest` import** (`import { describe, it, expect, vi, beforeEach } from 'vitest';`).

- [ ] **Step 2: Run tests to verify they fail**

Run: `fnm exec --using=22 -- npx vitest run src/App.test.tsx`
Expected: the new "shows..." / "calls reload..." tests FAIL (no `reload-button` in the DOM); existing tests still PASS.

- [ ] **Step 3: Wire the hook and button into `App.tsx`**

Add imports near the other `./logic` / `./components` imports:

```tsx
import { ReloadButton } from './components/ReloadButton';
import { useAppUpdate } from './logic/useAppUpdate';
import { shouldShowReloadButton } from './logic/updateVisibility';
import { isOfflineCopy } from './logic/runtimeEnv';
```

Inside `App()`, after the existing `const buildVersion = getBuildVersion();` line, add:

```tsx
  const { updateAvailable, reload } = useAppUpdate();
  const showReloadButton = shouldShowReloadButton({
    updateAvailable,
    isRunning: state.isRunning,
    gameResult: state.gameResult,
    rulesOpen,
    isOffline: isOfflineCopy(),
  });
```

Render the button as a sibling of the `.app-version` badge — insert it immediately before the `{buildVersion && (...)}` block, still inside the closing `</div>` of `.app`:

```tsx
      <ReloadButton visible={showReloadButton} onReload={reload} />
      {buildVersion && (
        <span className="app-version" aria-hidden="true">
          {buildVersion}
        </span>
      )}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `fnm exec --using=22 -- npx vitest run src/App.test.tsx`
Expected: PASS (all existing + 7 new reload-button tests).

- [ ] **Step 5: Run the full unit/component suite**

Run: `fnm exec --using=22 -- npm run test:unit`
Expected: PASS (no regressions across unit + component projects).

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat(update): show reload button in App gated by game phase"
```

---

## Task 5: E2E selector, comment fix, and offline verification

**Files:**
- Modify: `e2e/fixtures/selectors.ts`
- Modify: `e2e/tests/offline-pwa.spec.ts`

**Interfaces:**
- Consumes: the `reload-button` test id from Task 2/4.

- [ ] **Step 1: Add the selector**

In `e2e/fixtures/selectors.ts`, add to the `selectors` object (e.g. after the Sound block):

```ts
  // Auto-update
  reloadButton: '[data-testid="reload-button"]',
```

- [ ] **Step 2: Update the stale `autoUpdate` comment and add an absence assertion**

In `e2e/tests/offline-pwa.spec.ts`, replace the comment at the "…it takes control of THIS page" gate (currently lines 44-50) so it reflects the new config:

```ts
    // 2. ...and it takes control of THIS page. Control on the first load, with
    // no second reload, relies on `workbox.clientsClaim: true` in vite.config.ts:
    // the very first service worker (nothing ahead of it to wait behind) activates
    // and claims this client immediately. `registerType: 'prompt'` only makes
    // *update* activation manual (via the reload button) — it does not delay the
    // first worker's control here.
```

Then, right after the two app-shell `expect(...).toBeVisible()` assertions (the `startPauseButton` / `easyButton` block), add an assertion that the reload button is absent on a normal load (no pending update):

```ts
    // No update is pending on a fresh load, so the "click to reload" button must
    // not be present. Guards against it accidentally rendering unconditionally.
    await expect(page.locator(selectors.reloadButton)).toHaveCount(0);
```

- [ ] **Step 3: Build, then run the offline PWA e2e**

Run:
```bash
fnm exec --using=22 -- npm run build && fnm exec --using=22 -- npx playwright test e2e/tests/offline-pwa.spec.ts
```
Expected: PASS — the SW still registers and controls the page on first load (clientsClaim), offline reload still renders the shell, and the reload button is absent. If the `controller !== null` gate times out, the fix is a registration issue: verify `injectRegister`/the hook registers the SW (do not weaken the gate).

- [ ] **Step 4: Run the full e2e suite (online) to confirm no regressions**

Run: `fnm exec --using=22 -- npm run test:e2e`
Expected: PASS.

- [ ] **Step 5: Confirm visual baselines are unaffected**

The reload button only renders when an update is pending, which never happens in a build+preview visual run, so the button should be absent from every snapshot and **no baseline should change**. Confirm by running the visual suite:

Run: `fnm exec --using=22 -- npm run test:visual` (or, matching CI's pinned container, the docker command in `test:visual:update` **without** `--update-snapshots`).
Expected: PASS with no diffs. Only if a diff appears (it should not) regenerate via `npm run test:visual:update`.

- [ ] **Step 6: Commit**

```bash
git add e2e/fixtures/selectors.ts e2e/tests/offline-pwa.spec.ts
git commit -m "test(update): cover reload-button absence and fix stale SW comment"
```

---

## Final verification

- [ ] Run the whole relevant suite once more: `fnm exec --using=22 -- npm run test:unit && fnm exec --using=22 -- npm run build && fnm exec --using=22 -- npm run test:pwa && fnm exec --using=22 -- npm run build:offline`.
- [ ] Manual smoke (optional but recommended): `npm run build && npm run preview`, open the app, and in DevTools → Application → Service Workers confirm a worker is active; simulate an update by rebuilding and reloading, then verify the button appears only when not running and applies on click. (A real end-to-end update is awkward to script; this is the confidence check the automated tests can't fully cover.)
- [ ] Open a PR from `feat/auto-update-reload-button`; expect CI (ci.yml: build, unit, typecheck:pwa, test:pwa, e2e online + offline, visual, fallow, commitlint) to pass.
```
