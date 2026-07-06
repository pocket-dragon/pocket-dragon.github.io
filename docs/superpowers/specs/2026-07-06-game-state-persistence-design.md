# Persist game state across reloads

**Date:** 2026-07-06
**Status:** Approved (design)
**Scope:** `upstream` app code — one new `src/logic` module, a two-line `App.tsx`
wiring change, unit tests, and one e2e test. No changes to the game rules,
reducer, or UI components.

## Goal

Currently a page reload throws away the in-progress game — timers, clues,
success count, and difficulty all reset. This is a quality-of-life fix: persist
the game state to `localStorage` on every change and restore it on load, so an
accidental (or deliberate) reload no longer loses progress.

Restored games come back **paused**: the exact saved values are recovered, but
the player taps Play to resume. The game clock is tick-based (a 1 s
`setInterval` dispatching `TICK` only while running), so no wall-clock time
elapses while the tab is closed — "restore paused" is both the natural fit and a
player-friendly no-penalty behavior.

## Design

### New module: `src/logic/gamePersistence.ts`

Mirrors the existing `soundSettings.ts` convention: a small, pure, try/catch-wrapped
load/save pair. `localStorage` key: `gameState`. Schema version: `1`.

```
const STORAGE_KEY = 'gameState';
const SCHEMA_VERSION = 1;

saveGame(state: GameState): void
  // JSON-serialize { version: SCHEMA_VERSION, state } and write it.
  // Best-effort: swallow write failures (Safari private mode, quota, disabled
  // storage) exactly like saveSoundEnabled.

loadGame(): GameState | null
  // Read + JSON.parse + validate. Returns a restored GameState, or null on any
  // problem (caller then starts fresh). Never throws.
```

`loadGame` validation and restoration steps, in order — any failure returns `null`:

1. Read the key; if absent → `null`.
2. `JSON.parse`; on throw → `null`.
3. Check the payload is an object with `version === SCHEMA_VERSION`. A future
   change to the `GameState` shape bumps `SCHEMA_VERSION`, so old saves are
   ignored rather than misread into a broken state.
4. Validate `state` shape: it is an object and every `GameState` field is present
   with the right primitive type — `isRunning` boolean; `gameTimer`, `feedTimer`,
   `clueTimer`, `successesUntilVictory`, `remainingClues` finite numbers;
   `difficulty` an object with a `name` in `{easy, medium, hard}`; `gameResult`
   either `null` or an object with a boolean `won`.
5. **Re-resolve `difficulty`** by its `name` to the canonical `EASY`/`MEDIUM`/`HARD`
   from `difficulty.ts` — never trust the stored nested config values. This keeps a
   restored game on the current app's difficulty config (e.g. `initialFeedTimer`,
   used by `FEED`).
6. **Re-resolve `gameResult`** (when non-null) to the canonical `WON`/`LOST` from
   `gameState.ts` by its `won` flag — so restored result dialogs use current app copy.
7. **Coerce `isRunning` to `false`** — the "restore paused" policy, applied
   uniformly (a finished game is already not running, so this is a no-op there).
8. Return the restored `GameState`.

The saved timers/clue-count/success-count (the *progress*) are always kept as-is;
only `difficulty`, `gameResult`, and `isRunning` are re-resolved/coerced.

### Wiring in `App.tsx`

Two touches, no other component changes:

1. **Restore on mount** — the lazy `useReducer` initializer tries the persisted
   state first:
   ```
   const persisted = loadGame();
   return { state: persisted ?? createInitialState(EASY), effects: [] };
   ```
   (The reducer store is `ReducerResult = { state, effects }`; we restore `state`
   and start with no `effects`.)

2. **Save on change**:
   ```
   useEffect(() => { saveGame(state); }, [state]);
   ```
   State changes at most once per second (the `TICK`); the payload is a tiny
   object, so a synchronous `localStorage` write per tick is negligible — no
   debouncing (YAGNI). React StrictMode's double-invoke is harmless: `saveGame`
   is idempotent and `loadGame` is read-only.

`soundEnabled` remains in its own separate key, untouched.

### Performance on low-end devices

The app must run well on older, cheaper phones/tablets — the per-tick save must
not hurt responsiveness or the tick cadence. It doesn't, by construction:

- **The save is off the render critical path.** `useEffect(saveGame, [state])`
  runs *after* React commits and the browser paints, so the visual timer update
  is never blocked waiting on the write. (Contrast `useLayoutEffect`, which would
  run before paint — deliberately not used.)
- **The write is tiny and O(1).** `GameState` is a fixed handful of numbers plus
  two small objects; `JSON.stringify` + `localStorage.setItem` on a ~200-byte
  string is sub-millisecond even on low-end hardware — well under 1% of the
  one-second tick budget, and it happens once per second, not per frame.
- **The clock is tick-count based, so the save cannot slow the game.** Each
  `TICK` decrements timers by exactly 1 regardless of real-world elapsed time, so
  no amount of per-tick work changes how many game-seconds elapse. The only
  theoretical effect is real-time jitter in *when* a tick fires; a sub-ms
  post-paint write does not cause meaningful jitter.

**Guard (in the plan):** verify under emulated slow CPU (Playwright/DevTools CPU
throttling, e.g. 6×) that the game timer stays accurate and ticks keep ~1 Hz
cadence with persistence enabled — i.e. persistence adds no measurable slowdown.

**Deliberately not done (YAGNI):** throttling/debouncing saves to every N seconds.
It would only save at most a few sub-millisecond writes per second while risking
the loss of the last few seconds of progress on reload. The write is already
cheap and off the critical path; throttling is the documented escape hatch *only*
if the CPU-throttled measurement ever shows a regression.

### Data flow

Every state transition → `saveGame`. Reload → the initializer restores the last
snapshot, paused. Dismissing a result (RESET → `createInitialState`) overwrites
the save with a fresh initial state, so the next reload is clean. A never-played
visitor has no key → `loadGame` returns `null` → `createInitialState(EASY)`.

Because we persist *every* state uniformly, a finished game (win/loss) is also
restored — reloading right after a result re-shows the result dialog (the player
dismisses it to start over). No special-case clearing logic is needed.

### Error handling

Unreadable, absent, corrupt, wrong-version, or tampered data all resolve to
`null` → a clean fresh start, never a crash — the same resilience the existing
`soundSettings` module already provides for its preference.

## Testing

**Unit — `src/logic/gamePersistence.test.ts`** (following `soundSettings.test.ts`),
using the jsdom `localStorage`:
- save → load round-trip returns an equivalent `GameState`.
- a running game (`isRunning: true`) is restored with `isRunning === false`.
- a finished game (`gameResult` set) round-trips and is restored (result preserved).
- `difficulty` is re-resolved to the canonical object (identity `=== MEDIUM`, not a
  structurally-similar copy).
- `loadGame` returns `null` for: absent key; malformed JSON; wrong `version`;
  missing/mistyped field; unknown `difficulty.name`.
- `saveGame` swallows a thrown `setItem`, and `loadGame` returns `null` on a thrown
  `getItem` (mock `localStorage` to throw), asserting no exception escapes.

**Unit — App initializer**: a focused test that when a valid game is present in
`localStorage`, the app renders the restored (paused) values rather than the
Easy defaults; and with no/invalid data it renders the Easy initial state.

**E2e — `e2e/tests/persistence.spec.ts`** (`@playwright/test`, `fixtures/selectors.ts`):
start a game, make observable progress (e.g. log a success so the counter drops,
spend a clue), `page.reload()`, then assert the progress is restored and the game
is **paused** — the success counter and remaining-clue values match their
pre-reload values, and the Play/Pause control shows the paused (startable) state
(e.g. `log-success` is disabled again because the restored game is not running).
A second case: with no prior play, a fresh load shows the Easy defaults.

**E2e — low-end guard** (same spec file): under emulated CPU throttling (via CDP
`Emulation.setCPUThrottlingRate`, e.g. 6×), start a game and confirm over a short
wall-clock window that the game timer decrements at ~1 Hz (within a small
tolerance) with persistence enabled — demonstrating the per-tick save adds no
measurable slowdown to the tick cadence on constrained hardware.
