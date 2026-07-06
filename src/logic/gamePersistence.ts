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

// The progress fields kept as-is on restore. Validated together so loadGame can
// treat the persisted state's numeric core as one check. isRunning is
// deliberately excluded: it is discarded and coerced to false on restore
// (restore paused), so validating it would only reject an otherwise-restorable
// save over a value we throw away.
interface ProgressFields {
  gameTimer: number;
  feedTimer: number;
  clueTimer: number;
  successesUntilVictory: number;
  remainingClues: number;
}

function validateProgressFields(s: Record<string, unknown>): ProgressFields | null {
  if (
    !isFiniteNumber(s.gameTimer) ||
    !isFiniteNumber(s.feedTimer) ||
    !isFiniteNumber(s.clueTimer) ||
    !isFiniteNumber(s.successesUntilVictory) ||
    !isFiniteNumber(s.remainingClues)
  ) {
    return null;
  }
  return {
    gameTimer: s.gameTimer,
    feedTimer: s.feedTimer,
    clueTimer: s.clueTimer,
    successesUntilVictory: s.successesUntilVictory,
    remainingClues: s.remainingClues,
  };
}

// Re-resolve difficulty by name to the canonical config, ignoring stored nested
// values. Returns null on a missing/unknown name.
function resolveDifficulty(value: unknown): DifficultyConfig | null {
  if (typeof value !== 'object' || value === null) return null;
  const name = (value as { name?: unknown }).name;
  if (name !== 'easy' && name !== 'medium' && name !== 'hard') return null;
  return DIFFICULTY_BY_NAME[name];
}

// Re-resolve gameResult by its `won` flag to the canonical singleton. Wrapped in
// an object so a valid null result is distinguishable from an invalid shape.
function resolveGameResult(value: unknown): { result: GameResult | null } | null {
  if (value === null) return { result: null };
  if (typeof value === 'object' && typeof (value as { won?: unknown }).won === 'boolean') {
    return { result: (value as { won: boolean }).won ? WON : LOST };
  }
  return null;
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

    const progress = validateProgressFields(s);
    if (progress === null) return null;

    const difficulty = resolveDifficulty(s.difficulty);
    if (difficulty === null) return null;

    const resolvedResult = resolveGameResult(s.gameResult);
    if (resolvedResult === null) return null;

    return {
      ...progress,
      isRunning: false, // restore paused
      difficulty,
      gameResult: resolvedResult.result,
    };
  } catch {
    return null;
  }
}
