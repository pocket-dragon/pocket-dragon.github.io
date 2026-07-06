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

  it('returns null when difficulty is not an object', () => {
    const bad = { ...inProgress(), difficulty: 'easy' };
    localStorage.setItem('gameState', JSON.stringify({ version: 1, state: bad }));
    expect(loadGame()).toBeNull();
  });

  it('returns null on a mistyped gameResult.won flag', () => {
    const bad = { ...inProgress(), gameResult: { won: 'yes' } };
    localStorage.setItem('gameState', JSON.stringify({ version: 1, state: bad }));
    expect(loadGame()).toBeNull();
  });

  it('returns null on a non-object, non-null gameResult', () => {
    const bad = { ...inProgress(), gameResult: 5 };
    localStorage.setItem('gameState', JSON.stringify({ version: 1, state: bad }));
    expect(loadGame()).toBeNull();
  });

  // Schema-drift guard: createInitialState carries the full GameState shape, so
  // a field added to GameState (and therefore to a saved state) that loadGame
  // does not restore shows up as a key-set mismatch here. Failing this is a
  // reminder to extend validation/restoration and bump SCHEMA_VERSION.
  it('restores exactly the GameState field set', () => {
    const state = inProgress();
    saveGame(state);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(new Set(Object.keys(loaded!))).toEqual(new Set(Object.keys(state)));
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
