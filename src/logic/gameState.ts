import { DifficultyConfig, EASY } from './difficulty';

// Game constants
export const FEED_THRESHOLD = 30; // Feed button enabled when timer <= 30 seconds
export const GENERAL_CLUE_COST = 1;
export const SPECIFIC_CLUE_COST = 2;
export const INITIAL_CLUES = 3;
export const CLUE_REGEN_MIN = 15;
export const CLUE_REGEN_MAX = 20;
export const POINTS_PER_TEN_SECONDS = 1;

// Game result types
export interface GameResult {
  won: boolean;
  heading: string;
  text: string;
  buttonLabel: string;
}

export const WON: GameResult = {
  won: true,
  heading: 'You Won!',
  text: 'Congratulations on successfully helping your Dragon find a happy life!',
  buttonLabel: 'Yay!',
};

export const LOST: GameResult = {
  won: false,
  heading: 'Oh noes!',
  text: "Unfortunately, you didn't do so well this time…",
  buttonLabel: 'Try again!',
};

// Game state type
export interface GameState {
  isRunning: boolean;
  difficulty: DifficultyConfig;
  gameTimer: number;
  feedTimer: number;
  clueTimer: number;
  successesUntilVictory: number;
  remainingClues: number;
  gameResult: GameResult | null;
}

// Initial state factory
export function createInitialState(difficulty: DifficultyConfig = EASY): GameState {
  return {
    isRunning: false,
    difficulty,
    gameTimer: difficulty.initialGameTimer,
    feedTimer: difficulty.initialFeedTimer,
    clueTimer: 0,
    successesUntilVictory: difficulty.goalNumberOfSuccesses,
    remainingClues: INITIAL_CLUES,
    gameResult: null,
  };
}

// Helper functions
export function isFeedingAllowed(state: GameState): boolean {
  return state.isRunning && state.feedTimer <= FEED_THRESHOLD;
}

export function isGeneralClueAllowed(state: GameState): boolean {
  return state.isRunning && state.remainingClues >= GENERAL_CLUE_COST;
}

export function isSpecificClueAllowed(state: GameState): boolean {
  return state.isRunning && state.remainingClues >= SPECIFIC_CLUE_COST;
}

export function calculateFeedReset(initialTimer: number, currentTimer: number): number {
  return initialTimer - currentTimer;
}

export function generateClueTimer(rng: () => number = Math.random): number {
  return Math.round(rng() * (CLUE_REGEN_MAX - CLUE_REGEN_MIN) + CLUE_REGEN_MIN);
}

export function calculateTimePoints(gameTimer: number): number {
  return Math.floor(gameTimer / 10);
}
