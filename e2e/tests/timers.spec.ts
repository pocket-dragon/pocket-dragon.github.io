import { test, expect } from '../fixtures/test';
import { selectors, gameConfig } from '../fixtures/selectors';
import { advanceGameSeconds } from '../fixtures/clock';

test.describe('Timer Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
  });

  test('timers decrement each second when game is running', async ({ page }) => {
    const gameTimer = page.locator(selectors.gameTimer);
    const feedTimer = page.locator(selectors.feedTimer);

    const initialGameTime = gameConfig.easy.initialGameTimer;
    const initialFeedTime = gameConfig.easy.initialFeedTimer;

    await expect(gameTimer).toHaveText(String(initialGameTime));
    await expect(feedTimer).toHaveText(String(initialFeedTime));

    // Start the game and advance 2 seconds
    await page.locator(selectors.startPauseButton).click();
    await advanceGameSeconds(page, 2);

    await expect(gameTimer).toHaveText(String(initialGameTime - 2));
    await expect(feedTimer).toHaveText(String(initialFeedTime - 2));
  });

  test('pausing stops timer decrement', async ({ page }) => {
    const gameTimer = page.locator(selectors.gameTimer);
    const initialGameTime = gameConfig.easy.initialGameTimer;

    // Start the game and advance 3 seconds
    await page.locator(selectors.startPauseButton).click();
    await advanceGameSeconds(page, 3);

    // Pause the game
    await page.locator(selectors.startPauseButton).click();

    const timerValueWhenPaused = String(initialGameTime - 3);
    await expect(gameTimer).toHaveText(timerValueWhenPaused);

    // Advance time while paused — timer should not change
    await advanceGameSeconds(page, 5);
    await expect(gameTimer).toHaveText(timerValueWhenPaused);
  });

  test('resuming game continues timer from paused value', async ({ page }) => {
    const gameTimer = page.locator(selectors.gameTimer);
    const initialGameTime = gameConfig.easy.initialGameTimer;

    // Start, advance, pause
    await page.locator(selectors.startPauseButton).click();
    await advanceGameSeconds(page, 3);
    await page.locator(selectors.startPauseButton).click();

    const pausedValue = initialGameTime - 3;
    await expect(gameTimer).toHaveText(String(pausedValue));

    // Resume and advance
    await page.locator(selectors.startPauseButton).click();
    await advanceGameSeconds(page, 2);

    await expect(gameTimer).toHaveText(String(pausedValue - 2));
  });

  test('Start button shows "Pause" when game is running', async ({ page }) => {
    const startPauseButton = page.locator(selectors.startPauseButton);

    await expect(startPauseButton).toHaveAttribute('label', 'Start');
    await startPauseButton.click();
    await expect(startPauseButton).toHaveAttribute('label', 'Pause');
  });

  test('Pause button shows "Start" when game is paused', async ({ page }) => {
    const startPauseButton = page.locator(selectors.startPauseButton);

    await startPauseButton.click();
    await expect(startPauseButton).toHaveAttribute('label', 'Pause');

    await startPauseButton.click();
    await expect(startPauseButton).toHaveAttribute('label', 'Start');
  });

  test('Reset button is disabled while game is running', async ({ page }) => {
    const resetButton = page.locator(selectors.resetButton);

    await expect(resetButton).not.toHaveAttribute('disabled');

    await page.locator(selectors.startPauseButton).click();
    await expect(resetButton).toHaveAttribute('disabled', '');
  });

  test('Reset button resets all values to initial state', async ({ page }) => {
    const gameTimer = page.locator(selectors.gameTimer);
    const feedTimer = page.locator(selectors.feedTimer);
    const successCounter = page.locator(selectors.successCounter);
    const initialGameTime = gameConfig.easy.initialGameTimer;

    // Start the game and advance a few seconds
    await page.locator(selectors.startPauseButton).click();
    await advanceGameSeconds(page, 5);

    // Pause and reset
    await page.locator(selectors.startPauseButton).click();
    await page.locator(selectors.resetButton).click();

    // All values should be reset
    await expect(gameTimer).toHaveText(String(initialGameTime));
    await expect(feedTimer).toHaveText(
      String(gameConfig.easy.initialFeedTimer),
    );
    await expect(successCounter).toHaveText(
      String(gameConfig.easy.goalNumberOfSuccesses),
    );
  });
});
