# Test Suite Stage 2: App.tsx Testability Refactor + Component Tests — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the biggest untested-code gap — the 448-line `src/App.tsx` orchestration core — by extracting its timer/state-transition logic into a pure, directly-unit-testable reducer and its sound/`localStorage` effects into a thin mockable layer, then adding React Testing Library component tests.

**Architecture:** A pure `gameReducer(state, action, rng)` returns `{ state, effects }`, where `effects` is a list of sound *intents* derived purely from the state transition and `rng` is injected (defaults to `Math.random`) for deterministic clue-timer regeneration. `App.tsx` becomes wiring: a `useReducer` drives game state, a `useEffect` flushes the returned sound effects through the audio refs (gated on the separate `soundEnabled` setting), and a thin `soundSettings` module wraps `localStorage`. All JSX is preserved unchanged.

**Tech Stack:** React 19, TypeScript (strict), Vite 8 + `vite-plugin-pwa`, Vitest 4 (two projects: `unit`/node + `component`/jsdom), `@testing-library/react` 16, jsdom.

## Global Constraints

These apply to **every** task below:

- **Behavior-preserving refactor.** The existing **65 unit tests** and all **8 Playwright e2e specs** must stay green throughout. They are the safety net for the App rewire.
- **Minimize new dependencies.** This program exists to auto-merge Dependabot majors on green; every devDep is another surface the suite must be trusted to vet. Add only `jsdom` and `@testing-library/react`. Do **not** add `@testing-library/jest-dom` or `@testing-library/user-event` — plain Vitest `expect` + Testing Library queries + `fireEvent` cover every assertion here.
- **American English** in all identifiers, comments, and code artifacts.
- **Conventional commits** (commitlint runs in CI). One commit per task, at the task's final step.
- **Reducer purity.** `gameReducer` must not read `soundEnabled`, touch `localStorage`, call audio APIs, or call `Math.random` except through its injected `rng` parameter.
- **The `state.*` field names and all JSX in `App.tsx` (current lines 226–448) stay byte-for-byte identical.** Only the hooks/handlers above the `return` change. This keeps the diff reviewable and the e2e `data-testid`s intact.

---

### Task 1: Test infrastructure — second Vitest project (jsdom) + RTL

Stand up the jsdom component-test project so later tasks have somewhere to put component tests. Deliverable is verified by a real, keepable smoke test that renders `<App />` through the whole react-plugin + jsdom + RTL pipeline.

**Files:**
- Modify: `vite.config.ts` (the `test:` block only)
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`
- Modify: `package.json` (devDependencies — via `npm install`)

**Interfaces:**
- Produces: a `component` Vitest project (environment `jsdom`, glob `src/**/*.test.tsx`, setup file `src/test/setup.ts`) and a `unit` project (environment `node`, glob `src/**/*.test.ts`). `npm run test:unit` (`vitest run`) runs both.
- Produces: `src/test/setup.ts` — stubs `HTMLMediaElement.prototype.play` (jsdom doesn't implement it) and registers `afterEach(cleanup)` + `localStorage.clear()`.

- [ ] **Step 1: Install the two devDependencies**

```bash
npm install --save-dev jsdom @testing-library/react
```

Expected: `package.json` gains `jsdom` and `@testing-library/react` under `devDependencies`; `package-lock.json` updates. (`@testing-library/react` 16 supports React 19, already present.)

- [ ] **Step 2: Split the Vitest config into two projects**

In `vite.config.ts`, replace the existing `test:` block:

```ts
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/logic/**/*.ts'],
      reporter: ['text', 'html'],
    },
  },
```

with:

```ts
  test: {
    projects: [
      {
        // inherit the root plugins (react, VitePWA) and coverage
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'component',
          include: ['src/**/*.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/logic/**/*.ts'],
      reporter: ['text', 'html'],
    },
  },
```

Note: coverage stays at the root `test` level (applies across projects) and stays scoped to `src/logic/**` — App-component coverage is out of scope for this stage.

- [ ] **Step 3: Create the component-test setup file**

Create `src/test/setup.ts`:

```ts
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom does not implement media playback; stub it so the sound
// effects in App don't throw "Not implemented: HTMLMediaElement.play".
window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());

afterEach(() => {
  cleanup();
  localStorage.clear();
});
```

- [ ] **Step 4: Write the failing smoke test**

Create `src/App.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the Pocket Dragon title', () => {
    render(<App />);
    expect(screen.getByText('Pocket Dragon')).toBeTruthy();
  });
});
```

- [ ] **Step 5: Run the component project to verify it passes**

Run: `npm run test:unit`
Expected: the existing 65 unit tests (project `unit`) **and** the new smoke test (project `component`) all PASS. Both project names appear in the Vitest output. If the smoke test fails to even load, the jsdom/react-plugin wiring is wrong — fix before proceeding.

- [ ] **Step 6: Verify the build still typechecks**

Run: `npm run build`
Expected: `tsc` typechecks `src/**` (including `App.test.tsx`) with no errors, then `vite build` succeeds.

- [ ] **Step 7: Commit**

```bash
git add vite.config.ts src/test/setup.ts src/App.test.tsx package.json package-lock.json
git commit -m "test: add jsdom vitest project + RTL for component tests"
```

---

### Task 2: Extract the pure `gameReducer`

Extract every state transition currently living inside `App.tsx`'s `setState` callbacks into one pure reducer, with the clue-timer randomness injected and the threshold beeps returned as pure sound intents.

**Files:**
- Modify: `src/logic/gameState.ts:77-79` (`generateClueTimer` gains an optional `rng` param)
- Create: `src/logic/gameReducer.ts`
- Create: `src/logic/gameReducer.test.ts`

**Interfaces:**
- Consumes: from `./gameState` — `GameState`, `createInitialState`, `isFeedingAllowed`, `isGeneralClueAllowed`, `isSpecificClueAllowed`, `calculateFeedReset`, `generateClueTimer`, `WON`, `LOST`, `GENERAL_CLUE_COST`, `SPECIFIC_CLUE_COST`; from `./difficulty` — `DifficultyConfig`.
- Produces:
  - `type SoundEffect = 'beep1x' | 'beep2x' | 'beep3x'`
  - `type GameAction = { type: 'START' } | { type: 'PAUSE' } | { type: 'RESET' } | { type: 'SET_DIFFICULTY'; difficulty: DifficultyConfig } | { type: 'FEED' } | { type: 'LOG_SUCCESS' } | { type: 'USE_GENERAL_CLUE' } | { type: 'USE_SPECIFIC_CLUE' } | { type: 'TICK' }`
  - `interface ReducerResult { state: GameState; effects: SoundEffect[] }`
  - `function gameReducer(state: GameState, action: GameAction, rng?: () => number): ReducerResult`

- [ ] **Step 1: Make `generateClueTimer` accept an injectable rng**

In `src/logic/gameState.ts`, change:

```ts
export function generateClueTimer(): number {
  return Math.round(Math.random() * (CLUE_REGEN_MAX - CLUE_REGEN_MIN) + CLUE_REGEN_MIN);
}
```

to:

```ts
export function generateClueTimer(rng: () => number = Math.random): number {
  return Math.round(rng() * (CLUE_REGEN_MAX - CLUE_REGEN_MIN) + CLUE_REGEN_MIN);
}
```

This is backward-compatible: `generateClueTimer()` still uses `Math.random`, so the existing `gameState.test.ts` cases are unaffected.

- [ ] **Step 2: Write the failing reducer tests**

Create `src/logic/gameReducer.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { gameReducer, GameAction, ReducerResult } from './gameReducer';
import { createInitialState, WON, LOST } from './gameState';
import { EASY, MEDIUM } from './difficulty';

// Deterministic rng: 0 -> CLUE_REGEN_MIN (15).
const rngZero = () => 0;

function run(state: ReturnType<typeof createInitialState>, action: GameAction): ReducerResult {
  return gameReducer(state, action, rngZero);
}

describe('gameReducer', () => {
  it('START sets isRunning and generates a clue timer when clueTimer < 1', () => {
    const { state } = run(createInitialState(EASY), { type: 'START' });
    expect(state.isRunning).toBe(true);
    expect(state.clueTimer).toBe(15); // rngZero -> CLUE_REGEN_MIN
  });

  it('START keeps an existing clue timer', () => {
    const running = { ...createInitialState(EASY), clueTimer: 7 };
    const { state } = run(running, { type: 'START' });
    expect(state.clueTimer).toBe(7);
  });

  it('PAUSE clears isRunning', () => {
    const running = { ...createInitialState(EASY), isRunning: true };
    const { state } = run(running, { type: 'PAUSE' });
    expect(state.isRunning).toBe(false);
  });

  it('SET_DIFFICULTY switches difficulty while stopped', () => {
    const { state } = run(createInitialState(EASY), { type: 'SET_DIFFICULTY', difficulty: MEDIUM });
    expect(state.difficulty.name).toBe('medium');
    expect(state.gameTimer).toBe(MEDIUM.initialGameTimer);
  });

  it('SET_DIFFICULTY is ignored while running (the guard)', () => {
    const running = { ...createInitialState(EASY), isRunning: true };
    const { state } = run(running, { type: 'SET_DIFFICULTY', difficulty: MEDIUM });
    expect(state.difficulty.name).toBe('easy');
    expect(state.isRunning).toBe(true);
  });

  it('TICK decrements the timers by one second', () => {
    const running = { ...createInitialState(EASY), isRunning: true };
    const { state } = run(running, { type: 'TICK' });
    expect(state.gameTimer).toBe(EASY.initialGameTimer - 1);
    expect(state.feedTimer).toBe(EASY.initialFeedTimer - 1);
  });

  it('TICK emits a beep intent when the feed timer crosses a threshold', () => {
    const at21 = { ...createInitialState(EASY), isRunning: true, feedTimer: 21 };
    expect(run(at21, { type: 'TICK' }).effects).toEqual(['beep2x']); // 21 -> 20
    const at31 = { ...createInitialState(EASY), isRunning: true, feedTimer: 31 };
    expect(run(at31, { type: 'TICK' }).effects).toEqual(['beep1x']); // 31 -> 30
    const at11 = { ...createInitialState(EASY), isRunning: true, feedTimer: 11 };
    expect(run(at11, { type: 'TICK' }).effects).toEqual(['beep3x']); // 11 -> 10
  });

  it('TICK emits no beep off-threshold', () => {
    const running = { ...createInitialState(EASY), isRunning: true, feedTimer: 100 };
    expect(run(running, { type: 'TICK' }).effects).toEqual([]);
  });

  it('TICK regenerates a clue (deterministic via injected rng) when clueTimer hits zero', () => {
    const running = { ...createInitialState(EASY), isRunning: true, clueTimer: 1, remainingClues: 3 };
    const { state } = run(running, { type: 'TICK' });
    expect(state.remainingClues).toBe(4);
    expect(state.clueTimer).toBe(15); // rngZero -> CLUE_REGEN_MIN
  });

  it('TICK transitions to LOST when the feed timer runs out', () => {
    const running = { ...createInitialState(EASY), isRunning: true, feedTimer: 1 };
    const { state } = run(running, { type: 'TICK' });
    expect(state.feedTimer).toBe(0);
    expect(state.isRunning).toBe(false);
    expect(state.gameResult).toBe(LOST);
  });

  it('TICK transitions to LOST when the game timer runs out', () => {
    const running = { ...createInitialState(EASY), isRunning: true, gameTimer: 1 };
    const { state } = run(running, { type: 'TICK' });
    expect(state.gameTimer).toBe(0);
    expect(state.isRunning).toBe(false);
    expect(state.gameResult).toBe(LOST);
  });

  it('LOG_SUCCESS decrements successes and wins on the last one', () => {
    const running = { ...createInitialState(EASY), isRunning: true, successesUntilVictory: 1 };
    const { state } = run(running, { type: 'LOG_SUCCESS' });
    expect(state.successesUntilVictory).toBe(0);
    expect(state.isRunning).toBe(false);
    expect(state.gameResult).toBe(WON);
  });

  it('LOG_SUCCESS is ignored while not running', () => {
    const { state } = run(createInitialState(EASY), { type: 'LOG_SUCCESS' });
    expect(state.successesUntilVictory).toBe(EASY.goalNumberOfSuccesses);
    expect(state.gameResult).toBeNull();
  });

  it('FEED resets the feed timer only when feeding is allowed', () => {
    const allowed = { ...createInitialState(EASY), isRunning: true, feedTimer: 20 };
    const { state } = run(allowed, { type: 'FEED' });
    expect(state.feedTimer).toBe(EASY.initialFeedTimer - 20);

    const notAllowed = { ...createInitialState(EASY), isRunning: true, feedTimer: 100 };
    expect(run(notAllowed, { type: 'FEED' }).state.feedTimer).toBe(100);
  });

  it('clue actions decrement clues only when allowed', () => {
    const running = { ...createInitialState(EASY), isRunning: true, remainingClues: 2 };
    expect(run(running, { type: 'USE_GENERAL_CLUE' }).state.remainingClues).toBe(1);
    expect(run(running, { type: 'USE_SPECIFIC_CLUE' }).state.remainingClues).toBe(0);

    const oneClue = { ...running, remainingClues: 1 };
    expect(run(oneClue, { type: 'USE_SPECIFIC_CLUE' }).state.remainingClues).toBe(1); // needs 2
  });

  it('RESET returns a fresh state for the current difficulty', () => {
    const mid = { ...createInitialState(MEDIUM), isRunning: true, gameTimer: 5 };
    const { state } = run(mid, { type: 'RESET' });
    expect(state).toEqual(createInitialState(MEDIUM));
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module './gameReducer'` (or equivalent).

- [ ] **Step 4: Implement the reducer**

Create `src/logic/gameReducer.ts`:

```ts
import {
  GameState,
  createInitialState,
  isFeedingAllowed,
  isGeneralClueAllowed,
  isSpecificClueAllowed,
  calculateFeedReset,
  generateClueTimer,
  WON,
  LOST,
  GENERAL_CLUE_COST,
  SPECIFIC_CLUE_COST,
} from './gameState';
import { DifficultyConfig } from './difficulty';

export type SoundEffect = 'beep1x' | 'beep2x' | 'beep3x';

export type GameAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SET_DIFFICULTY'; difficulty: DifficultyConfig }
  | { type: 'FEED' }
  | { type: 'LOG_SUCCESS' }
  | { type: 'USE_GENERAL_CLUE' }
  | { type: 'USE_SPECIFIC_CLUE' }
  | { type: 'TICK' };

export interface ReducerResult {
  state: GameState;
  effects: SoundEffect[];
}

function noEffects(state: GameState): ReducerResult {
  return { state, effects: [] };
}

export function gameReducer(
  state: GameState,
  action: GameAction,
  rng: () => number = Math.random,
): ReducerResult {
  switch (action.type) {
    case 'START':
      return noEffects({
        ...state,
        isRunning: true,
        clueTimer: state.clueTimer < 1 ? generateClueTimer(rng) : state.clueTimer,
      });

    case 'PAUSE':
      return noEffects({ ...state, isRunning: false });

    case 'RESET':
      return noEffects(createInitialState(state.difficulty));

    case 'SET_DIFFICULTY':
      if (state.isRunning) return noEffects(state);
      return noEffects(createInitialState(action.difficulty));

    case 'FEED':
      if (!isFeedingAllowed(state)) return noEffects(state);
      return noEffects({
        ...state,
        feedTimer: calculateFeedReset(state.difficulty.initialFeedTimer, state.feedTimer),
      });

    case 'LOG_SUCCESS': {
      if (!state.isRunning) return noEffects(state);
      const newSuccesses = state.successesUntilVictory - 1;
      if (newSuccesses < 1) {
        return noEffects({
          ...state,
          successesUntilVictory: newSuccesses,
          isRunning: false,
          gameResult: WON,
        });
      }
      return noEffects({ ...state, successesUntilVictory: newSuccesses });
    }

    case 'USE_GENERAL_CLUE':
      if (!isGeneralClueAllowed(state)) return noEffects(state);
      return noEffects({
        ...state,
        remainingClues: state.remainingClues - GENERAL_CLUE_COST,
      });

    case 'USE_SPECIFIC_CLUE':
      if (!isSpecificClueAllowed(state)) return noEffects(state);
      return noEffects({
        ...state,
        remainingClues: state.remainingClues - SPECIFIC_CLUE_COST,
      });

    case 'TICK': {
      if (!state.isRunning) return noEffects(state);

      const newGameTimer = state.gameTimer - 1;
      const newFeedTimer = state.feedTimer - 1;
      let newClueTimer = state.clueTimer - 1;
      let newRemainingClues = state.remainingClues;

      // Sound alerts at feed-timer thresholds. Playback is gated on the
      // soundEnabled setting by the caller — the reducer stays pure.
      const effects: SoundEffect[] = [];
      if (newFeedTimer === 30) effects.push('beep1x');
      if (newFeedTimer === 20) effects.push('beep2x');
      if (newFeedTimer === 10) effects.push('beep3x');

      // Clue regeneration
      if (newClueTimer < 1) {
        newRemainingClues += 1;
        newClueTimer = generateClueTimer(rng);
      }

      // Lose conditions
      if (newFeedTimer < 1 || newGameTimer < 1) {
        return {
          state: {
            ...state,
            gameTimer: Math.max(0, newGameTimer),
            feedTimer: Math.max(0, newFeedTimer),
            clueTimer: newClueTimer,
            remainingClues: newRemainingClues,
            isRunning: false,
            gameResult: LOST,
          },
          effects,
        };
      }

      return {
        state: {
          ...state,
          gameTimer: newGameTimer,
          feedTimer: newFeedTimer,
          clueTimer: newClueTimer,
          remainingClues: newRemainingClues,
        },
        effects,
      };
    }
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test:unit`
Expected: all reducer tests PASS; the existing 65 unit tests and the Task 1 smoke test still PASS.

- [ ] **Step 6: Commit**

```bash
git add src/logic/gameReducer.ts src/logic/gameReducer.test.ts src/logic/gameState.ts
git commit -m "refactor: extract pure gameReducer with injectable rng"
```

---

### Task 3: Extract the `soundSettings` localStorage layer

Move the `localStorage` read/write for the sound setting behind a thin, mockable module.

**Files:**
- Create: `src/logic/soundSettings.ts`
- Create: `src/logic/soundSettings.test.ts`

**Interfaces:**
- Produces:
  - `function loadSoundEnabled(): boolean | null` — `null` when nothing is stored.
  - `function saveSoundEnabled(enabled: boolean): void`
  - Storage key: `'soundEnabled'`, values `'true'` / `'false'`.

- [ ] **Step 1: Write the failing tests**

Create `src/logic/soundSettings.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadSoundEnabled, saveSoundEnabled } from './soundSettings';

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

describe('soundSettings', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', mockStorage());
  });

  it('returns null when nothing is stored', () => {
    expect(loadSoundEnabled()).toBeNull();
  });

  it('round-trips true and false', () => {
    saveSoundEnabled(true);
    expect(loadSoundEnabled()).toBe(true);
    expect(localStorage.getItem('soundEnabled')).toBe('true');

    saveSoundEnabled(false);
    expect(loadSoundEnabled()).toBe(false);
    expect(localStorage.getItem('soundEnabled')).toBe('false');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module './soundSettings'`.

- [ ] **Step 3: Implement the module**

Create `src/logic/soundSettings.ts`:

```ts
const STORAGE_KEY = 'soundEnabled';

export function loadSoundEnabled(): boolean | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return null;
  return stored === 'true';
}

export function saveSoundEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(enabled));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test:unit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/logic/soundSettings.ts src/logic/soundSettings.test.ts
git commit -m "refactor: extract soundSettings localStorage layer"
```

---

### Task 4: Rewire `App.tsx` onto the reducer + effect layer

Replace the inline `useState`/`setState`/`useCallback` orchestration (current lines 1–224) with a `useReducer` driving `gameReducer`, a `useEffect` that flushes sound effects, and the `soundSettings` module. **The JSX (current lines 226–448) is not touched** — all handler names (`playOrPause`, `resetGame`, `feed`, `logSuccess`, `useGeneralClue`, `useSpecificClue`, `setDifficulty`, `toggleSound`, `closeGameOver`) and the `state.*` accessor names are preserved, so the return block keeps compiling unchanged.

**Files:**
- Modify: `src/App.tsx:1-224` (everything from the imports through the end of the hooks/handlers, up to `const buildVersion = getBuildVersion();` and the `return (`)

**Interfaces:**
- Consumes: `gameReducer`, `GameAction`, `SoundEffect`, `ReducerResult` from `./logic/gameReducer`; `loadSoundEnabled`, `saveSoundEnabled` from `./logic/soundSettings`; `createInitialState`, plus the `is*Allowed`/`calculateTimePoints`/`WON`/`LOST` names still used by the JSX, from `./logic/gameState`.

- [ ] **Step 1: Replace the imports and the component's hooks/handlers**

In `src/App.tsx`, replace **lines 1–224** (from `import { useState, ... }` through `const buildVersion = getBuildVersion();`, i.e. everything above `return (`) with:

```tsx
import { useReducer, useState, useCallback, useEffect, useRef } from 'react';
import { RulesModal } from './components/RulesModal';
import { PdButton } from './components/PdButton';
import { getBuildVersion } from './logic/buildVersion';
import {
  createInitialState,
  isFeedingAllowed,
  isGeneralClueAllowed,
  isSpecificClueAllowed,
  calculateTimePoints,
} from './logic/gameState';
import {
  gameReducer,
  GameAction,
  SoundEffect,
  ReducerResult,
} from './logic/gameReducer';
import { loadSoundEnabled, saveSoundEnabled } from './logic/soundSettings';
import { DifficultyConfig, EASY, MEDIUM, HARD } from './logic/difficulty';
import './App.css';

// Wrap the pure reducer for React. Stores { state, effects }; effects are
// flushed to the audio layer by a useEffect below (default rng in the app).
function appReducer(prev: ReducerResult, action: GameAction): ReducerResult {
  return gameReducer(prev.state, action);
}

function App() {
  const [{ state, effects }, dispatch] = useReducer(
    appReducer,
    EASY,
    (difficulty: DifficultyConfig): ReducerResult => ({
      state: createInitialState(difficulty),
      effects: [],
    }),
  );

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);

  // Audio refs
  const timerBeepRef = useRef<HTMLAudioElement>(null);
  const timerBeep2xRef = useRef<HTMLAudioElement>(null);
  const timerBeep3xRef = useRef<HTMLAudioElement>(null);

  // Load the persisted sound setting on mount.
  useEffect(() => {
    const stored = loadSoundEnabled();
    if (stored !== null) {
      setSoundEnabled(stored);
    }
  }, []);

  // Map a sound intent to its audio element and play it.
  const playSound = useCallback((effect: SoundEffect) => {
    const ref =
      effect === 'beep1x'
        ? timerBeepRef
        : effect === 'beep2x'
          ? timerBeep2xRef
          : timerBeep3xRef;
    ref.current?.play().catch(() => {});
  }, []);

  // Flush the reducer's sound effects, gated on the soundEnabled setting.
  // Read the setting through a ref so toggling sound doesn't replay old effects.
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  useEffect(() => {
    if (!soundEnabledRef.current) return;
    effects.forEach(playSound);
  }, [effects, playSound]);

  // Persist + confirm-beep on toggle.
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      saveSoundEnabled(newValue);
      if (newValue) {
        timerBeepRef.current?.play().catch(() => {});
      }
      return newValue;
    });
  }, []);

  // Action dispatchers (names preserved so the JSX below is unchanged).
  const setDifficulty = useCallback(
    (difficulty: DifficultyConfig) => dispatch({ type: 'SET_DIFFICULTY', difficulty }),
    [],
  );
  const playOrPause = useCallback(
    () => dispatch({ type: state.isRunning ? 'PAUSE' : 'START' }),
    [state.isRunning],
  );
  const resetGame = useCallback(() => dispatch({ type: 'RESET' }), []);
  const feed = useCallback(() => dispatch({ type: 'FEED' }), []);
  const logSuccess = useCallback(() => dispatch({ type: 'LOG_SUCCESS' }), []);
  const useGeneralClue = useCallback(() => dispatch({ type: 'USE_GENERAL_CLUE' }), []);
  const useSpecificClue = useCallback(() => dispatch({ type: 'USE_SPECIFIC_CLUE' }), []);
  const closeGameOver = resetGame;

  // Close the game-over dialog on Escape.
  useEffect(() => {
    if (!state.gameResult) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'RESET' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.gameResult]);

  // Game tick: dispatch TICK once per second while running.
  useEffect(() => {
    if (!state.isRunning) return;

    const id = window.setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.isRunning]);

  const feedingAllowed = isFeedingAllowed(state);
  const generalClueAllowed = isGeneralClueAllowed(state);
  const specificClueAllowed = isSpecificClueAllowed(state);
  const buildVersion = getBuildVersion();
```

Leave everything from `return (` onward exactly as-is. Note: `MEDIUM` and `HARD` are still referenced by the JSX difficulty buttons, so their import is retained.

- [ ] **Step 2: Verify the build typechecks**

Run: `npm run build`
Expected: `tsc` passes (no unused-import or type errors — e.g. `useReducer` is now used, `intervalRef`/`GameState`/`WON`/`LOST`/`GENERAL_CLUE_COST`/`SPECIFIC_CLUE_COST`/`generateClueTimer` are no longer imported into `App.tsx`), then `vite build` succeeds.

- [ ] **Step 3: Run the full unit + component suite**

Run: `npm run test:unit`
Expected: all unit tests + the smoke test PASS.

- [ ] **Step 4: Run the e2e suite (the behavior-preserving safety net)**

Run: `npm run test:e2e`
Expected: all 8 Playwright specs PASS against the preview build — this is the proof the refactor preserved behavior (start/pause, difficulty, feeding, clues, timers, success, game-over, sound, rules). If any spec fails, the refactor changed observable behavior — debug before committing (see superpowers:systematic-debugging).

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: drive App via gameReducer + effect layer"
```

---

### Task 5: Component tests for the four target behaviors

Add the component-level coverage named in issue #82: timer ticks, sound toggle + persistence, difficulty-switch-while-running guard, and win/lose transitions. Append to the existing `src/App.test.tsx` (keeping the Task 1 smoke test).

**Files:**
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write the failing tests**

Replace the entire contents of `src/App.test.tsx` with:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import { EASY } from './logic/difficulty';

describe('App', () => {
  it('renders the Pocket Dragon title', () => {
    render(<App />);
    expect(screen.getByText('Pocket Dragon')).toBeTruthy();
  });

  it('counts the game timer down while running', () => {
    vi.useFakeTimers();
    try {
      render(<App />);
      fireEvent.click(screen.getByTestId('start-pause'));
      expect(screen.getByTestId('game-timer').textContent).toBe(String(EASY.initialGameTimer));
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByTestId('game-timer').textContent).toBe(String(EASY.initialGameTimer - 1));
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByTestId('game-timer').textContent).toBe(String(EASY.initialGameTimer - 3));
    } finally {
      vi.useRealTimers();
    }
  });

  it('toggles sound and persists the setting', () => {
    render(<App />);
    const toggle = screen.getByTestId('sound-toggle');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(localStorage.getItem('soundEnabled')).toBe('false');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('soundEnabled')).toBe('true');
  });

  it('disables difficulty switching while the game is running', () => {
    render(<App />);
    const easy = screen.getByTestId('difficulty-easy') as HTMLButtonElement;
    const medium = screen.getByTestId('difficulty-medium') as HTMLButtonElement;
    expect(easy.disabled).toBe(false);

    fireEvent.click(screen.getByTestId('start-pause')); // start
    expect(easy.disabled).toBe(true);
    expect(medium.disabled).toBe(true);

    fireEvent.click(screen.getByTestId('start-pause')); // pause
    expect(easy.disabled).toBe(false);
  });

  it('shows the win dialog after enough successes', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('start-pause')); // start (easy: 3 successes)
    const logSuccess = screen.getByTestId('log-success');
    fireEvent.click(logSuccess);
    fireEvent.click(logSuccess);
    fireEvent.click(logSuccess);
    expect(screen.getByTestId('game-over-heading').textContent).toBe('You Won!');
  });

  it('shows the lose dialog when the feed timer runs out', () => {
    vi.useFakeTimers();
    try {
      render(<App />);
      fireEvent.click(screen.getByTestId('start-pause'));
      // Easy feed timer starts at EASY.initialFeedTimer seconds; run it to zero.
      act(() => {
        vi.advanceTimersByTime(EASY.initialFeedTimer * 1000);
      });
      expect(screen.getByTestId('game-over-heading').textContent).toBe('Oh noes!');
    } finally {
      vi.useRealTimers();
    }
  });
});
```

- [ ] **Step 2: Run to verify the new tests pass**

Run: `npm run test:unit`
Expected: all six `App` tests PASS (plus the full unit suite). If the fake-timer tests flake or hang, confirm `vi.advanceTimersByTime` calls are wrapped in `act(...)` and `vi.useRealTimers()` runs in `finally`.

- [ ] **Step 3: Verify the build still typechecks**

Run: `npm run build`
Expected: `tsc` + `vite build` succeed.

- [ ] **Step 4: Commit**

```bash
git add src/App.test.tsx
git commit -m "test: add App component tests (timers, sound, guard, win/lose)"
```

---

## Verification (whole plan)

After all tasks:

- [ ] `npm run test:unit` — unit + component projects both green (65 existing + reducer + soundSettings + 6 App component tests).
- [ ] `npm run test:e2e` — all 8 specs green (behavior preserved).
- [ ] `npm run build` — `tsc` strict + `vite build` clean.
- [ ] `git log --oneline -5` — five focused conventional commits, one per task.

Then follow the established stage flow: push the branch, let CI run, request review, rebase, merge to `dev`, and close issue #82.

## Notes / rationale

- **Why the reducer returns `{ state, effects }` instead of playing sound itself:** keeps it a pure function of `(state, action, rng)`, so every transition — including the win/lose edges and threshold beeps — is asserted in plain node tests with no DOM, no audio, no timers. The React layer owns the impure flush.
- **Why `soundEnabled` stays a separate `useState` and not reducer state:** it's a persisted user *setting*, not game state; the reducer is deliberately unaware of it (the caller gates playback). This also keeps `RESET` from wiping the sound preference.
- **Why no `intervalRef`:** the tick `useEffect` keyed on `state.isRunning` owns the interval's whole lifecycle — created on run, cleared on stop/unmount — so the manual ref bookkeeping the old `resetGame` did is no longer needed (`RESET` sets `isRunning: false`, which triggers the cleanup).
- **Coverage scope unchanged** (`src/logic/**`): the new reducer and `soundSettings` are logic and are covered; `App.tsx` remains exercised by component + e2e tests but is not in the coverage gate, consistent with the pre-existing config.
```