import { test, expect } from '@playwright/test';
import { selectors, gameConfig, gameConstants } from '../fixtures/selectors';
import { advanceGameSeconds } from '../fixtures/clock';

test.describe('Feeding Mechanic', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
  });

  test('feed button is disabled when game is not running', async ({ page }) => {
    const feedButton = page.locator(selectors.feedButton);
    await expect(feedButton).toHaveAttribute('disabled', '');
  });

  test('feed button is disabled when feed timer > 30 seconds', async ({ page }) => {
    const feedButton = page.locator(selectors.feedButton);

    // Start the game
    await page.locator(selectors.startPauseButton).click();

    // Feed button should still be disabled (timer is at 120s)
    await expect(feedButton).toHaveAttribute('disabled', '');
  });

  test('feed button becomes enabled when feed timer <= 30 seconds', async ({ page }) => {
    const feedButton = page.locator(selectors.feedButton);
    const feedTimer = page.locator(selectors.feedTimer);

    // Start the game
    await page.locator(selectors.startPauseButton).click();

    // Advance 90 seconds so feed timer goes from 120 to 30
    const secondsToWait =
      gameConfig.easy.initialFeedTimer - gameConstants.feedThreshold;
    await advanceGameSeconds(page, secondsToWait);

    // Feed button should now be enabled
    await expect(feedButton).not.toHaveAttribute('disabled');
  });

  test('feeding resets timer using formula: initialTimer - currentTimer', async ({ page }) => {
    const feedButton = page.locator(selectors.feedButton);
    const feedTimer = page.locator(selectors.feedTimer);

    // Start the game
    await page.locator(selectors.startPauseButton).click();

    // Advance to exactly the feed threshold
    const secondsToWait =
      gameConfig.easy.initialFeedTimer - gameConstants.feedThreshold;
    await advanceGameSeconds(page, secondsToWait);

    // Get the current timer value before feeding
    const timerBeforeFeed = parseInt((await feedTimer.textContent())!);

    // Feed the dragon
    await feedButton.click();

    // The new timer value should be: initialFeedTimer - timerBeforeFeed
    const expectedNewTimer =
      gameConfig.easy.initialFeedTimer - timerBeforeFeed;

    const newTimer = parseInt((await feedTimer.textContent())!);
    expect(newTimer).toBe(expectedNewTimer);
  });

  test('feed button is disabled again after feeding (timer > 30)', async ({ page }) => {
    const feedButton = page.locator(selectors.feedButton);

    // Start the game
    await page.locator(selectors.startPauseButton).click();

    // Advance to feed threshold
    const secondsToWait =
      gameConfig.easy.initialFeedTimer - gameConstants.feedThreshold;
    await advanceGameSeconds(page, secondsToWait);

    // Feed the dragon
    await feedButton.click();

    // Feed button should be disabled again (timer reset to > 30)
    await expect(feedButton).toHaveAttribute('disabled', '');
  });

  test('feed timer warning class applied when timer <= 30', async ({ page }) => {
    const feedTimer = page.locator(selectors.feedTimer);

    // Start the game
    await page.locator(selectors.startPauseButton).click();

    // Advance to feed threshold
    const secondsToWait =
      gameConfig.easy.initialFeedTimer - gameConstants.feedThreshold;
    await advanceGameSeconds(page, secondsToWait);

    // The parent container should have 'warning' class
    const feedTimerContainer = feedTimer.locator('..');
    await expect(feedTimerContainer).toHaveClass(/warning/);
  });
});
