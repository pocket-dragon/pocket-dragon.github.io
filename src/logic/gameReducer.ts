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

    default: {
      // Exhaustiveness guard: if a new GameAction is added without a case,
      // this fails to compile instead of returning undefined at runtime.
      const exhaustive: never = action;
      throw new Error(`Unhandled action: ${JSON.stringify(exhaustive)}`);
    }
  }
}
