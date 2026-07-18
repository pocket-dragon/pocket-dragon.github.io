# Auto-update "click to reload" button

**Date:** 2026-07-18
**Status:** Design approved, pending implementation plan
**Related:** models on the puzzle app (`~/src/puzzle/`) update flow; builds on the
existing PWA setup and game-state persistence (issue #9 offline build, game-state
persistence design).

## Problem

When a new version of Pocket Dragon is deployed, an already-open tab keeps running
the old assets indefinitely. Today the app uses `vite-plugin-pwa` with
`registerType: 'autoUpdate'`, so a new service worker silently takes control, but
nothing tells the running page or reloads it — the user only gets the new version
by manually refreshing, which they have no reason to do.

We want the app to notice a new deploy and offer the user a way to pick it up —
**without ever reloading on its own**, because an automatic reload would:

- interrupt / desync a game that is actively running, and
- close the rules modal if it were open.

## Goals

- Detect that a newer deployed version exists.
- Show a **"click to reload"** button (never reload automatically).
- Show the button **only** when it is safe and unobtrusive: not during live play,
  not on the game-over screen, and not while the rules modal is open.
- Do nothing in the offline single-file (`file://`) build, which has no service
  worker.
- No perpetual background polling.

## Non-goals

- No automatic reload under any circumstance (this is the core departure from the
  puzzle app, which auto-applies pending updates on tab-focus).
- No "what's new" changelog, no forced-update / kill-switch behavior.
- No new version-file/endpoint — detection reuses the service worker the build
  already produces.

## Approach

Mirror the puzzle app's service-worker-based detection, adapted to React and to the
"never auto-reload" constraint.

Switch `vite-plugin-pwa` from `registerType: 'autoUpdate'` to `registerType:
'prompt'`. In `prompt` mode a newly-deployed service worker installs and then
**waits** instead of activating and taking over; `vite-plugin-pwa`'s React virtual
module (`virtual:pwa-register/react`, `useRegisterSW`) surfaces this as
`needRefresh === true`. That boolean is our "an update exists" signal. We render a
button from it, gated on game phase, and only call `updateServiceWorker(true)`
(skip-waiting + reload) when the user clicks.

**Detection is what actually changes on a deploy**, exactly as in the puzzle app:
Workbox bakes content-hash revisions of every precached asset into `sw.js` at build
time, so any code change yields a byte-different `sw.js`; the browser installs it as
a waiting worker and `needRefresh` flips. No manual version comparison in app code.
(The existing `VITE_APP_VERSION` badge stays purely cosmetic and is unrelated.)

### Deliberate departures from the puzzle app

1. **No auto-apply, ever.** The puzzle app reloads on tab-focus if an update is
   pending. We drop that. The button click is the *only* path to a reload.
2. **Keep `clientsClaim: true`.** Only `skipWaiting` becomes manual (it is what
   `prompt` mode makes manual). Keeping `clientsClaim` preserves first-load service
   worker control, which the existing `offline-pwa.spec.ts` e2e depends on —
   minimizing disruption to current tests.
3. **Visibility-triggered detection only — no interval.** The puzzle app runs a
   perpetual hourly `setInterval` *plus* a visibility check. We use only:
   - one `registration.update()` on first registration, and
   - a `registration.update()` on each `visibilitychange → visible`.

   This is the realistic trigger (the user returns to the tab) with zero background
   work. The only gap — a tab left open *and focused* for many hours — is acceptable
   for a game; the update is picked up on the next refocus or reload.

### Alternatives considered and rejected

- **Keep `autoUpdate` and suppress the reload.** Messy: `autoUpdate` skip-waits
  immediately and exposes no clean `needRefresh`, so we'd be fighting the mode.
- **Roll our own `version.json` polling.** Duplicates what the service worker
  already does for free and adds a second source of truth.

## Components

The logic is split so the interesting part (when to show the button) is pure and
fully unit-testable, and the browser-coupled part is thin.

### 1. `useAppUpdate()` — the glue (thin, e2e-covered)

New hook, e.g. `src/logic/useAppUpdate.ts`. Wraps `useRegisterSW` from
`virtual:pwa-register/react`. Responsibilities:

- Expose `{ updateAvailable: boolean, reload: () => void }` where `updateAvailable`
  is the module's `needRefresh` and `reload` calls `updateServiceWorker(true)`.
- In `onRegisteredSW(swUrl, registration)`: register a `visibilitychange` listener
  that, when the document becomes visible, calls `registration.update()`. (The
  initial registration itself performs the first check.) No interval.

This module is the **only** place that imports the virtual module. It is kept
deliberately minimal because it is hard to unit-test; it is exercised by e2e
instead.

### 2. `shouldShowReloadButton(...)` — the gate (pure, unit-tested)

Pure predicate, e.g. in `src/logic/useAppUpdate.ts` or a sibling `updateVisibility.ts`:

```ts
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

Shows the button only when an update exists **and** a game is not actively running
**and** the game-over dialog is not open **and** the rules modal is not open **and**
we are not the offline copy. Covered by a full truth-table unit test.

### 3. `ReloadButton` — presentation (pure component, component-tested)

New component `src/components/ReloadButton.tsx`, props `{ visible: boolean; onReload:
() => void }`. Renders a fixed **bottom-center pill** button
(`New version available — tap to reload`), with `aria-live="polite"` so its
appearance is announced. Returns `null` when `!visible`. `data-testid="reload-button"`.
Styling: a new `.reload-button` rule in `src/App.css` (fixed, bottom-center, its own
z-index; it is hidden by the gate whenever a modal is open, so it never overlaps one).

### 4. Wiring in `App.tsx`

- Call `useAppUpdate()` to get `{ updateAvailable, reload }`.
- Compute `visible = shouldShowReloadButton({ updateAvailable, isRunning:
  state.isRunning, gameResult: state.gameResult, rulesOpen, isOffline:
  isOfflineCopy() })`.
- Render `<ReloadButton visible={visible} onReload={reload} />` as a sibling of the
  existing `.app-version` badge (a direct child of `.app`, outside `<main>`).
- Keep it entirely separate from `RulesModal` so that component's memoization
  (which prevents per-tick re-renders) is untouched.

### 5. No state-flush needed

The app already persists the full game state to `localStorage` on *every* change
(`App.tsx` `useEffect(() => saveGame(state), [state])`), and the button only ever
shows while `!isRunning`. So a reload restores the exact paused state; unlike the
puzzle app we need no debounced-save flush before reloading.

## Config & build changes

### `vite.config.ts`

- `registerType: 'autoUpdate'` → `registerType: 'prompt'`.
- Add `workbox.clientsClaim: true` (keep first-load control; `skipWaiting` becomes
  manual under `prompt`). All other workbox/manifest settings unchanged.

### `vite.offline.config.ts`

The offline build has no VitePWA plugin, so `virtual:pwa-register/react` will not
resolve once `useAppUpdate.ts` imports it. Add a `resolve.alias` mapping
`virtual:pwa-register/react` to a tiny stub module that exports a `useRegisterSW`
returning `{ needRefresh: false, updateServiceWorker: () => {} }` (shape-compatible).
With that stub plus `isOfflineCopy()` in the gate, the button can never appear in the
offline copy.

## Testing

- **Unit** — `shouldShowReloadButton` truth table (every relevant combination of the
  five inputs), asserting the button shows only in the single allowed combination.
- **Component** — `ReloadButton`: renders nothing when `visible=false`; renders the
  pill and calls `onReload` on click when `visible=true`.
- **Component (App-level)** — mock `./logic/useAppUpdate` (so the virtual module is
  never evaluated under vitest) and assert the button appears/disappears across game
  phases: hidden while running, hidden on game-over, hidden while rules modal open,
  shown when paused/pre-game with an update available.
- **PWA build test** — `tests/pwa-build.test.ts` should still pass (precache still
  references hashed JS/CSS). Adjust only if the `prompt` switch changes the built
  `sw.js` shape it inspects.
- **E2E** — review and update `e2e/tests/offline-pwa.spec.ts`, which currently relies
  on `autoUpdate` semantics (first-load controller non-null). Keeping `clientsClaim:
  true` is intended to preserve that; verify and adjust as needed. Add
  `reload-button` to `e2e/fixtures/selectors.ts`. A full "simulate a real SW update
  and click reload" e2e is hard to make deterministic in Playwright; behavior is
  covered by the component/unit tests, and the e2e focus stays on "button is absent
  on a normal first load" plus the existing offline-reload flow.
- **Visual regression** — the reload button is a new potentially-visible element;
  regenerate the committed visual baselines (`npm run test:visual:update`).

## Risks

- **`prompt`-mode activation semantics** differ from `autoUpdate`. Keeping
  `clientsClaim: true` should preserve `offline-pwa.spec.ts`'s assumptions, but that
  spec and `pwa-build.test.ts` are the two most likely to need adjustment. Scoped
  into the plan, not assumed free.
- **Virtual-module resolution** in the offline build and under vitest — mitigated by
  confining the import to `useAppUpdate.ts`, aliasing it to a stub in the offline
  config, and mocking `useAppUpdate` in component tests.
