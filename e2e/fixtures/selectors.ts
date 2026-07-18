/**
 * Shared selectors for E2E tests.
 * These selectors work against both the old StencilJS app and the new React app.
 */
export const selectors = {
  // Difficulty buttons
  easyButton: '[data-testid="difficulty-easy"]',
  mediumButton: '[data-testid="difficulty-medium"]',
  hardButton: '[data-testid="difficulty-hard"]',

  // Game controls
  startPauseButton: '[data-testid="start-pause"]',
  resetButton: '[data-testid="reset"]',
  feedButton: '[data-testid="feed"]',

  // Timers
  gameTimer: '[data-testid="game-timer"]',
  feedTimer: '[data-testid="feed-timer"]',

  // Success tracking
  successCounter: '[data-testid="success-counter"]',
  logSuccessButton: '[data-testid="log-success"]',

  // Clues
  remainingClues: '[data-testid="remaining-clues"]',
  generalClueButton: '[data-testid="general-clue"]',
  specificClueButton: '[data-testid="specific-clue"]',

  // Rules
  rulesLink: '[data-testid="rules-link"]',
  rulesDialog: '[data-testid="rules-dialog"]',
  rulesContent: '[data-testid="rules-content"]',
  rulesCloseButton: '[data-testid="rules-close"]',
  // Raw framework/app classes used by the visual suite to capture a dialog's
  // surface (excluding the translucent backdrop) rather than the full page.
  rulesSurface: '.rules-surface',
  promoAnachrony: '[data-testid="promo-anachrony"]',

  // Sound
  soundToggle: '[data-testid="sound-toggle"]',

  // Auto-update
  reloadButton: '[data-testid="reload-button"]',

  // Game over dialog
  gameOverDialog: '[data-testid="game-over-dialog"]',
  // MDC dialog surface (excludes the backdrop); used by the visual suite.
  dialogSurface: '.mdc-dialog__surface',
  gameOverHeading: '[data-testid="game-over-heading"]',
  gameOverText: '[data-testid="game-over-text"]',
  gameOverButton: '[data-testid="game-over-button"]',
  basePoints: '[data-testid="base-points"]',
  timePoints: '[data-testid="time-points"]',
};

/**
 * Game configuration constants matching the app's logic.
 */
export const gameConfig = {
  easy: {
    goalNumberOfSuccesses: 3,
    initialFeedTimer: 120, // 2 minutes in seconds
    initialGameTimer: 300, // 5 minutes in seconds
    points: 1,
  },
  medium: {
    goalNumberOfSuccesses: 5,
    initialFeedTimer: 120,
    initialGameTimer: 360, // 6 minutes
    points: 3,
  },
  hard: {
    goalNumberOfSuccesses: 7,
    initialFeedTimer: 120,
    initialGameTimer: 420, // 7 minutes
    points: 8,
  },
};

/**
 * Game mechanics constants.
 */
export const gameConstants = {
  feedThreshold: 30, // Feed button enabled when timer <= 30 seconds
  generalClueCost: 1,
  specificClueCost: 2,
  initialClues: 3,
  clueRegenMin: 15,
  clueRegenMax: 20,
  pointsPerTenSeconds: 1,
};
