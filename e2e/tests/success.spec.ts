import { test, expect } from '../fixtures/test';
import { selectors, gameConfig } from '../fixtures/selectors';

test.describe('Success Logging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('log success button is disabled when game is not running', async ({ page }) => {
    const logSuccessButton = page.locator(selectors.logSuccessButton);
    await expect(logSuccessButton).toHaveAttribute('disabled', '');
  });

  test('log success button is enabled when game is running', async ({ page }) => {
    const logSuccessButton = page.locator(selectors.logSuccessButton);

    // Start the game
    await page.locator(selectors.startPauseButton).click();

    await expect(logSuccessButton).not.toHaveAttribute('disabled');
  });

  test('logging success decrements the success counter', async ({ page }) => {
    const successCounter = page.locator(selectors.successCounter);
    const logSuccessButton = page.locator(selectors.logSuccessButton);

    // Start the game (Easy: 3 successes)
    await page.locator(selectors.startPauseButton).click();

    await expect(successCounter).toHaveText('3');

    // Log a success
    await logSuccessButton.click();

    await expect(successCounter).toHaveText('2');
  });

  test('logging all successes triggers win condition', async ({ page }) => {
    const successCounter = page.locator(selectors.successCounter);
    const logSuccessButton = page.locator(selectors.logSuccessButton);
    const gameOverDialog = page.locator(selectors.gameOverDialog);
    const gameOverHeading = page.locator(selectors.gameOverHeading);

    // Start the game (Easy: 3 successes)
    await page.locator(selectors.startPauseButton).click();

    // Log all 3 successes
    await logSuccessButton.click();
    await expect(successCounter).toHaveText('2');

    await logSuccessButton.click();
    await expect(successCounter).toHaveText('1');

    await logSuccessButton.click();

    // Game over dialog should appear with win message
    await expect(gameOverDialog).toBeVisible();
    await expect(gameOverHeading).toHaveText('You Won!');
  });

  test('winning game shows correct scoring', async ({ page }) => {
    const logSuccessButton = page.locator(selectors.logSuccessButton);
    const gameOverDialog = page.locator(selectors.gameOverDialog);
    const basePoints = page.locator(selectors.basePoints);
    const timePoints = page.locator(selectors.timePoints);

    // Start the game (Easy: 1 base point)
    await page.locator(selectors.startPauseButton).click();

    // Log all 3 successes quickly
    await logSuccessButton.click();
    await logSuccessButton.click();
    await logSuccessButton.click();

    // Game over dialog should appear
    await expect(gameOverDialog).toBeVisible();

    // Check base points (Easy = 1 point)
    await expect(basePoints).toContainText('1');

    // Time points should be positive (we finished quickly)
    const timePointsText = await timePoints.textContent();
    const timePointsValue = parseInt(timePointsText!.match(/\d+/)?.[0] || '0');
    expect(timePointsValue).toBeGreaterThan(0);
  });

  test('reset after winning resets all counters', async ({ page }) => {
    const successCounter = page.locator(selectors.successCounter);
    const logSuccessButton = page.locator(selectors.logSuccessButton);
    const gameOverButton = page.locator(selectors.gameOverButton);
    const gameOverDialog = page.locator(selectors.gameOverDialog);

    // Start the game and win
    await page.locator(selectors.startPauseButton).click();
    await logSuccessButton.click();
    await logSuccessButton.click();
    await logSuccessButton.click();

    // Click the game over button to reset
    await expect(gameOverDialog).toBeVisible();
    await gameOverButton.click();

    // Success counter should be reset
    await expect(successCounter).toHaveText('3');
  });
});
