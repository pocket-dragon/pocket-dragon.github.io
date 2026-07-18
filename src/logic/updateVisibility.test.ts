import { describe, it, expect } from 'vitest';
import { shouldShowReloadButton } from './updateVisibility';

// The one input combination that must show the button. Each test below flips
// exactly one field away from this and asserts the button hides.
const shown = {
  updateAvailable: true,
  isRunning: false,
  gameResult: null,
  rulesOpen: false,
  isOffline: false,
} as const;

describe('shouldShowReloadButton', () => {
  it('shows when an update is available and nothing blocks it', () => {
    expect(shouldShowReloadButton({ ...shown })).toBe(true);
  });

  it('hides when no update is available', () => {
    expect(shouldShowReloadButton({ ...shown, updateAvailable: false })).toBe(false);
  });

  it('hides while a game is running', () => {
    expect(shouldShowReloadButton({ ...shown, isRunning: true })).toBe(false);
  });

  it('hides on the game-over screen', () => {
    expect(
      shouldShowReloadButton({
        ...shown,
        gameResult: { won: true, heading: 'You Won!', text: '', buttonLabel: 'OK' },
      }),
    ).toBe(false);
  });

  it('hides while the rules modal is open', () => {
    expect(shouldShowReloadButton({ ...shown, rulesOpen: true })).toBe(false);
  });

  it('hides in the offline copy', () => {
    expect(shouldShowReloadButton({ ...shown, isOffline: true })).toBe(false);
  });
});
