import type { GameResult } from './gameState';

/**
 * Whether the "click to reload" button should be visible.
 *
 * Shown only when a new version is waiting AND it is safe and unobtrusive to
 * offer a reload: no game actively running, no game-over dialog, no rules modal
 * open, and not the offline copy (which has no service worker). We never reload
 * automatically — this only governs whether the button is offered.
 */
export function shouldShowReloadButton(args: {
  updateAvailable: boolean;
  isRunning: boolean;
  gameResult: GameResult | null;
  rulesOpen: boolean;
  isOffline: boolean;
}): boolean {
  const { updateAvailable, isRunning, gameResult, rulesOpen, isOffline } = args;
  return updateAvailable && !isRunning && !gameResult && !rulesOpen && !isOffline;
}
