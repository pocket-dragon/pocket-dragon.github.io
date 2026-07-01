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

    const noClue = { ...running, remainingClues: 0 };
    expect(run(noClue, { type: 'USE_GENERAL_CLUE' }).state.remainingClues).toBe(0); // needs 1
  });

  it('clue and feed actions are ignored while not running', () => {
    const stopped = { ...createInitialState(EASY), isRunning: false, remainingClues: 3, feedTimer: 20 };
    expect(run(stopped, { type: 'USE_GENERAL_CLUE' }).state.remainingClues).toBe(3);
    expect(run(stopped, { type: 'USE_SPECIFIC_CLUE' }).state.remainingClues).toBe(3);
    expect(run(stopped, { type: 'FEED' }).state.feedTimer).toBe(20);
  });

  it('RESET returns a fresh state for the current difficulty', () => {
    const mid = { ...createInitialState(MEDIUM), isRunning: true, gameTimer: 5 };
    const { state } = run(mid, { type: 'RESET' });
    expect(state).toEqual(createInitialState(MEDIUM));
  });
});
