import { GameState, GameResult, WON, LOST } from './gameState';
import { DifficultyConfig, EASY, MEDIUM, HARD } from './difficulty';

const STORAGE_KEY = 'gameState';
// Bump on ANY change to the persisted GameState shape or the *semantics* of a
// field (add / remove / rename / change of meaning). A reader rejects a
// mismatched version rather than mis-restoring a stale save. The field-set
// guard in gamePersistence.test.ts fails if a GameState field is added without
// updating validation here — treat that as a reminder to bump this too.
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
