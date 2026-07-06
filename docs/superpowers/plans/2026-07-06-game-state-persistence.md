# Game State Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist the in-progress game to `localStorage` on every change and restore it (paused) on reload, so a page reload no longer loses game progress.

**Architecture:** One new pure module `src/logic/gamePersistence.ts` (mirroring the existing `soundSettings.ts` load/save pattern) with `saveGame`/`loadGame`; `App.tsx` restores via the `useReducer` lazy initializer and saves via a `useEffect([state])`. Restore coerces `isRunning` to `false` and re-resolves `difficulty`/`gameResult` to the app's canonical objects.

**Tech Stack:** React 19 + TypeScript, Vite, Vitest + @testing-library/react (unit, jsdom), Playwright (e2e).

**Design doc:** `docs/superpowers/specs/2026-07-06-game-state-persistence-design.md`

## Global Constraints

- **Node is pinned to v22 by `.nvmrc`.** Run every local `node`/`npm`/`npx` command via `fnm exec --using=22 <cmd>` — the non-interactive shell does not auto-apply `.nvmrc`, and Node 24/npm 11 breaks `npm ci`.
- **localStorage key:** `gameState`. **Schema version:** `1` (bump on any future `GameState` shape change).
- **Restore policy:** on load, coerce `isRunning` to `false` (restore paused); re-resolve `difficulty` by its `name` to the canonical `EASY`/`MEDIUM`/`HARD`; re-resolve non-null `gameResult` to canonical `WON`/`LOST` by its `won` flag. Keep saved timers/clue-count/success-count as-is.
- **Resilience:** `loadGame` returns `null` (never throws) on absent/corrupt/wrong-version/mistyped/tampered data; `saveGame` swallows write failures. Mirror `soundSettings.ts` exactly.
- **Follow existing patterns:** `src/logic/soundSettings.ts` (module) and `src/logic/soundSettings.test.ts` (tests, incl. the `mockStorage()` helper).
- **American English** in identifiers/comments. Rebase-merge only, never squash; atomic commits.
- **Performance:** the save runs in `useEffect` (post-paint) and must not be moved to `useLayoutEffect`; no debouncing/throttling (YAGNI).

## File Structure

- **Create** `src/logic/gamePersistence.ts` — `saveGame(state)` / `loadGame()`. Single responsibility: serialize/validate/restore a `GameState` to/from `localStorage`.
- **Create** `src/logic/gamePersistence.test.ts` — unit tests for the module.
- **Modify** `src/App.tsx` — import `loadGame`/`saveGame`; restore in the `useReducer` initializer; add `useEffect([state])` to save. No other component changes.
- **Modify** `src/App.test.tsx` — add restore-on-mount / fresh-start / save-on-change tests.
- **Create** `e2e/tests/persistence.spec.ts` — e2e reload-restore test, fresh-load test, and a CPU-throttled cadence guard.

---

### Task 1: `gamePersistence` module + unit tests

**Files:**
- Create: `src/logic/gamePersistence.ts`
- Create: `src/logic/gamePersistence.test.ts`

**Interfaces:**
- Consumes: `GameState`, `GameResult`, `WON`, `LOST` from `./gameState`; `DifficultyConfig`, `EASY`, `MEDIUM`, `HARD` from `./difficulty`.
- Produces: `saveGame(state: GameState): void` and `loadGame(): GameState | null`.

- [ ] **Step 1: Write the failing tests**

Create `src/logic/gamePersistence.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { saveGame, loadGame } from './gamePersistence';
import { createInitialState, GameState, WON, LOST } from './gameState';
import { EASY, MEDIUM } from './difficulty';

function mockStorage() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((k: string) => (store.has(k) ? store.get(k)! : null)),
    setItem: vi.fn((k: string, v: string) => void store.set(k, v)),
    removeItem: vi.fn((k: string) => void store.delete(k)),
    clear: vi.fn(() => store.clear()),
    key: vi.fn(),
    length: 0,
  } as unknown as Storage;
}

// A running game on MEDIUM with some progress.
function inProgress(): GameState {
  return {
    ...createInitialState(MEDIUM),
    isRunning: true,
    gameTimer: 200,
    feedTimer: 90,
    clueTimer: 12,
    successesUntilVictory: 3,
    remainingClues: 5,
  };
}

describe('gamePersistence', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', mockStorage());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when nothing is stored', () => {
    expect(loadGame()).toBeNull();
  });

  it('round-trips progress, restoring paused', () => {
    saveGame(inProgress());
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.isRunning).toBe(false); // restore paused
    expect(loaded!.gameTimer).toBe(200);
    expect(loaded!.feedTimer).toBe(90);
    expect(loaded!.clueTimer).toBe(12);
    expect(loaded!.successesUntilVictory).toBe(3);
    expect(loaded!.remainingClues).toBe(5);
  });

  it('re-resolves difficulty to the canonical object (identity)', () => {
    saveGame(inProgress());
    expect(loadGame()!.difficulty).toBe(MEDIUM); // === , not a copy
  });

  it('re-resolves a finished game result to the canonical object', () => {
    const won: GameState = { ...createInitialState(EASY), isRunning: false, gameResult: WON };
    saveGame(won);
    expect(loadGame()!.gameResult).toBe(WON);

    const lost: GameState = { ...createInitialState(EASY), isRunning: false, gameResult: LOST };
    saveGame(lost);
    expect(loadGame()!.gameResult).toBe(LOST);
  });

  it('preserves a null gameResult', () => {
    saveGame(createInitialState(EASY));
    expect(loadGame()!.gameResult).toBeNull();
  });

  it('returns null on malformed JSON', () => {
    localStorage.setItem('gameState', '{not json');
    expect(loadGame()).toBeNull();
  });

  it('returns null on a wrong schema version', () => {
    localStorage.setItem('gameState', JSON.stringify({ version: 999, state: inProgress() }));
    expect(loadGame()).toBeNull();
  });

  it('returns null on a missing/mistyped field', () => {
    const bad = { ...inProgress(), gameTimer: 'oops' };
    localStorage.setItem('gameState', JSON.stringify({ version: 1, state: bad }));
    expect(loadGame()).toBeNull();
  });

  it('returns null on an unknown difficulty name', () => {
    const bad = { ...inProgress(), difficulty: { name: 'nightmare' } };
    localStorage.setItem('gameState', JSON.stringify({ version: 1, state: bad }));
    expect(loadGame()).toBeNull();
  });

  it('degrades gracefully when localStorage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('storage disabled');
      }),
      setItem: vi.fn(() => {
        throw new Error('quota exceeded');
      }),
    } as unknown as Storage);
    expect(loadGame()).toBeNull();
    expect(() => saveGame(inProgress())).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `fnm exec --using=22 npm run test:unit -- src/logic/gamePersistence.test.ts`
Expected: FAIL — module `./gamePersistence` does not exist / `saveGame`,`loadGame` not defined.

- [ ] **Step 3: Implement the module**

Create `src/logic/gamePersistence.ts`:

```typescript
import { GameState, GameResult, WON, LOST } from './gameState';
import { DifficultyConfig, EASY, MEDIUM, HARD } from './difficulty';

const STORAGE_KEY = 'gameState';
const SCHEMA_VERSION = 1;

const DIFFICULTY_BY_NAME: Record<DifficultyConfig['name'], DifficultyConfig> = {
  easy: EASY,
  medium: MEDIUM,
  hard: HARD,
};

// Persist the game state. Best-effort: swallow write failures (Safari private
// mode / quota / disabled storage), exactly like saveSoundEnabled.
export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state }));
  } catch {
    // ignore
  }
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

// Load + validate a persisted game. Returns a restored GameState (paused, with
// difficulty/result re-resolved to canonical objects) or null on any problem
// (absent, corrupt, wrong version, mistyped, tampered). Never throws.
export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const { version, state } = parsed as { version?: unknown; state?: unknown };
    if (version !== SCHEMA_VERSION) return null;
    if (typeof state !== 'object' || state === null) return null;
    const s = state as Record<string, unknown>;

    if (typeof s.isRunning !== 'boolean') return null;
    if (
      !isFiniteNumber(s.gameTimer) ||
      !isFiniteNumber(s.feedTimer) ||
      !isFiniteNumber(s.clueTimer) ||
      !isFiniteNumber(s.successesUntilVictory) ||
      !isFiniteNumber(s.remainingClues)
    ) {
      return null;
    }

    // Re-resolve difficulty by name to the canonical config.
    const difficulty = s.difficulty as { name?: unknown } | null;
    if (typeof difficulty !== 'object' || difficulty === null) return null;
    const name = difficulty.name;
    if (name !== 'easy' && name !== 'medium' && name !== 'hard') return null;

    // Re-resolve gameResult by its `won` flag (or null).
    let gameResult: GameResult | null;
    if (s.gameResult === null) {
      gameResult = null;
    } else if (
      typeof s.gameResult === 'object' &&
      typeof (s.gameResult as { won?: unknown }).won === 'boolean'
    ) {
      gameResult = (s.gameResult as { won: boolean }).won ? WON : LOST;
    } else {
      return null;
    }

    return {
      isRunning: false, // restore paused
      difficulty: DIFFICULTY_BY_NAME[name],
      gameTimer: s.gameTimer,
      feedTimer: s.feedTimer,
      clueTimer: s.clueTimer,
      successesUntilVictory: s.successesUntilVictory,
      remainingClues: s.remainingClues,
      gameResult,
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `fnm exec --using=22 npm run test:unit -- src/logic/gamePersistence.test.ts`
Expected: PASS — all cases green.

- [ ] **Step 5: Commit**

```bash
git add src/logic/gamePersistence.ts src/logic/gamePersistence.test.ts
git commit -m "feat: add game-state persistence module (save/load with validation)"
```

---

### Task 2: Wire persistence into `App.tsx` + App unit tests

**Files:**
- Modify: `src/App.tsx` (import; `useReducer` initializer; new `useEffect`)
- Modify: `src/App.test.tsx` (new tests)

**Interfaces:**
- Consumes: `saveGame`, `loadGame` from `./logic/gamePersistence` (Task 1).
- Produces: no new exports; App restores on mount and saves on every state change.

- [ ] **Step 1: Write the failing App tests**

Append to the `describe('App', ...)` block in `src/App.test.tsx` (it already imports `render, screen, fireEvent, act` and `EASY`; add `MEDIUM` to the difficulty import and `saveGame` from `./logic/gamePersistence`):

```typescript
// add to the existing import from './logic/difficulty':  EASY, MEDIUM
import { saveGame } from './logic/gamePersistence';
import { createInitialState } from './logic/gameState';

it('restores a persisted in-progress game, paused', () => {
  saveGame({
    ...createInitialState(MEDIUM),
    isRunning: true,
    successesUntilVictory: 2,
    remainingClues: 5,
  });

  render(<App />);

  // Restored progress is shown...
  expect(screen.getByTestId('success-counter').textContent).toBe('2');
  expect(screen.getByTestId('remaining-clues').textContent).toBe('5');
  // ...and the game is paused (log-success is disabled when not running).
  expect(screen.getByTestId('log-success').getAttribute('disabled')).toBe('');
});

it('starts fresh (Easy defaults) when nothing is persisted', () => {
  render(<App />);
  expect(screen.getByTestId('success-counter').textContent).toBe(String(EASY.goalNumberOfSuccesses));
});

it('starts fresh when persisted data is invalid', () => {
  localStorage.setItem('gameState', '{corrupt');
  render(<App />);
  expect(screen.getByTestId('success-counter').textContent).toBe(String(EASY.goalNumberOfSuccesses));
});

it('persists state changes to localStorage', () => {
  render(<App />);
  fireEvent.click(screen.getByTestId('start-pause')); // START
  fireEvent.click(screen.getByTestId('log-success')); // 3 -> 2
  const raw = localStorage.getItem('gameState');
  expect(raw).not.toBeNull();
  expect(JSON.parse(raw!).state.successesUntilVictory).toBe(2);
});
```

> Note: `src/test/setup.ts` clears `localStorage` after each test, so tests are isolated. `createInitialState` and `MEDIUM` may already be partially imported — merge, don't duplicate imports.

- [ ] **Step 2: Run to verify failure**

Run: `fnm exec --using=22 npm run test:unit -- src/App.test.tsx`
Expected: FAIL — the restore test sees Easy defaults (persistence not wired yet); the persist test finds `gameState` null.

- [ ] **Step 3: Wire persistence into `App.tsx`**

Add the import near the other `./logic` imports:

```typescript
import { loadGame, saveGame } from './logic/gamePersistence';
```

Change the `useReducer` lazy initializer body to prefer a persisted game (this is the existing block near the top of `function App()`):

```typescript
  const [{ state, effects }, dispatch] = useReducer(
    appReducer,
    EASY,
    (difficulty: DifficultyConfig): ReducerResult => ({
      state: loadGame() ?? createInitialState(difficulty),
      effects: [],
    }),
  );
```

Add this `useEffect` immediately after that `useReducer` call (it must be a normal `useEffect`, not `useLayoutEffect`, so the write stays off the paint critical path):

```typescript
  // Persist the game on every change so a reload restores it (paused). The
  // payload is tiny and this runs post-paint, so it never blocks a tick render.
  useEffect(() => {
    saveGame(state);
  }, [state]);
```

(`useEffect`, `createInitialState`, and `DifficultyConfig` are already imported in `App.tsx`.)

- [ ] **Step 4: Run App tests + full unit suite to verify pass and no regressions**

Run: `fnm exec --using=22 npm run test:unit`
Expected: PASS — new App tests green, and all existing unit tests still pass (existing App tests start clean because `setup.ts` clears `localStorage` after each test).

- [ ] **Step 5: Verify the build compiles**

Run: `fnm exec --using=22 npm run build`
Expected: succeeds (TypeScript clean, Vite build OK).

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: restore and persist game state across reloads in App"
```

---

### Task 3: E2e reload-restore + low-end CPU-throttle guard

**Files:**
- Create: `e2e/tests/persistence.spec.ts`

**Interfaces:**
- Consumes: the wired feature from Task 2; `selectors` from `../fixtures/selectors`.
- Produces: e2e coverage (Playwright).

- [ ] **Step 1: Write the e2e spec**

Create `e2e/tests/persistence.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { selectors } from '../fixtures/selectors';

test.describe('Game state persistence', () => {
  test('restores an in-progress game, paused, after reload', async ({ page }) => {
    await page.goto('/');

    // Start a game and make observable progress.
    await page.locator(selectors.startPauseButton).click();
    await page.locator(selectors.logSuccessButton).click(); // 3 -> 2 (Easy)
    await expect(page.locator(selectors.successCounter)).toHaveText('2');
    const cluesBefore = await page.locator(selectors.remainingClues).textContent();

    await page.reload();

    // Progress is restored...
    await expect(page.locator(selectors.successCounter)).toHaveText('2');
    await expect(page.locator(selectors.remainingClues)).toHaveText(cluesBefore ?? '');
    // ...and the game is paused: log-success is disabled again (not running).
    await expect(page.locator(selectors.logSuccessButton)).toHaveAttribute('disabled', '');
  });

  test('a fresh visitor (no saved game) sees Easy defaults', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator(selectors.successCounter)).toHaveText('3'); // Easy goal
  });

  test('tick cadence stays ~1 Hz under CPU throttling with persistence on', async ({
    page,
    browserName,
  }) => {
    // CDP CPU throttling is Chromium-only.
    test.skip(browserName !== 'chromium', 'CDP setCPUThrottlingRate is Chromium-only');

    await page.goto('/');
    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: 6 });

    await page.locator(selectors.startPauseButton).click();
    const before = Number(await page.locator(selectors.gameTimer).textContent());
    await page.waitForTimeout(5000);
    const after = Number(await page.locator(selectors.gameTimer).textContent());

    const elapsed = before - after; // game-seconds counted down over ~5 real seconds
    // Persistence adds no measurable slowdown: ~5 ticks fire (tolerance for scheduler jitter).
    expect(elapsed).toBeGreaterThanOrEqual(4);
    expect(elapsed).toBeLessThanOrEqual(6);
  });
});
```

> `game-timer` renders the raw remaining seconds (confirmed by `App.test.tsx`), so `Number(textContent)` is valid. Each Playwright test gets an isolated browser context (fresh `localStorage`), so the first test's save does not leak into the others.

- [ ] **Step 2: Run the new e2e spec to verify it passes**

Run: `fnm exec --using=22 npm run test:e2e -- e2e/tests/persistence.spec.ts`
Expected: PASS (3 tests; the throttle test runs on Chromium, skips elsewhere). The Playwright `webServer` builds + serves the app automatically.

- [ ] **Step 3: Run the full e2e suite to confirm no regression**

Run: `fnm exec --using=22 npm run test:e2e`
Expected: PASS — existing specs unaffected (persistence only adds a `localStorage` key; no existing spec depends on reload discarding state).

- [ ] **Step 4: Commit**

```bash
git add e2e/tests/persistence.spec.ts
git commit -m "test: add e2e for game-state persistence and low-end tick cadence"
```

---

## Self-Review

**Spec coverage:**
- `gamePersistence.ts` `saveGame`/`loadGame`, key `gameState`, version 1 → Task 1. ✓
- Validation order (absent/JSON/version/shape) + null-on-failure → Task 1 tests + impl. ✓
- Re-resolve difficulty by name; re-resolve gameResult by `won`; coerce `isRunning` false → Task 1 (impl + identity test). ✓
- `saveGame` swallows failures; `loadGame` null on throw → Task 1 (throwing-storage test). ✓
- App restore-on-mount via initializer; save via `useEffect([state])` (not `useLayoutEffect`) → Task 2. ✓
- Fresh start on no/invalid data; re-show finished result (uniform persist) → Task 2 tests + Task 1 result round-trip. ✓
- Unit tests mirroring `soundSettings.test.ts`; App initializer test → Tasks 1 & 2. ✓
- E2e reload-restore + fresh-load → Task 3. ✓
- Performance: post-paint effect (enforced in Task 2 Step 3 note); CPU-throttled cadence guard → Task 3. ✓

**Placeholder scan:** none — every code/command step is concrete.

**Type consistency:** `saveGame(state: GameState): void` / `loadGame(): GameState | null` used identically in Tasks 1–2. `DIFFICULTY_BY_NAME` keyed by `DifficultyConfig['name']`. Selectors (`successCounter`, `remainingClues`, `logSuccessButton`, `startPauseButton`, `gameTimer`) match `e2e/fixtures/selectors.ts`. Testids (`success-counter`, `remaining-clues`, `log-success`, `start-pause`) match `App.test.tsx` usage.
