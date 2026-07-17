import { test, expect } from '../fixtures/test';
import { selectors, gameConfig } from '../fixtures/selectors';

test.describe('Difficulty Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('defaults to Easy difficulty on page load', async ({ page }) => {
    const gameTimer = page.locator(selectors.gameTimer);
    const feedTimer = page.locator(selectors.feedTimer);
    const successCounter = page.locator(selectors.successCounter);

    await expect(gameTimer).toHaveText(String(gameConfig.easy.initialGameTimer));
    await expect(feedTimer).toHaveText(String(gameConfig.easy.initialFeedTimer));
    await expect(successCounter).toHaveText(String(gameConfig.easy.goalNumberOfSuccesses));
  });

  test('Easy button is selected by default', async ({ page }) => {
    const easyButton = page.locator(selectors.easyButton);
    // StencilJS reflects boolean attributes as empty strings
    await expect(easyButton).toHaveAttribute('selected', '');
  });

  test('selecting Medium sets correct timer values', async ({ page }) => {
    await page.locator(selectors.mediumButton).click();

    const gameTimer = page.locator(selectors.gameTimer);
    const feedTimer = page.locator(selectors.feedTimer);
    const successCounter = page.locator(selectors.successCounter);

    await expect(gameTimer).toHaveText(String(gameConfig.medium.initialGameTimer));
    await expect(feedTimer).toHaveText(String(gameConfig.medium.initialFeedTimer));
    await expect(successCounter).toHaveText(String(gameConfig.medium.goalNumberOfSuccesses));
  });

  test('selecting Hard sets correct timer values', async ({ page }) => {
    await page.locator(selectors.hardButton).click();

    const gameTimer = page.locator(selectors.gameTimer);
    const feedTimer = page.locator(selectors.feedTimer);
    const successCounter = page.locator(selectors.successCounter);

    await expect(gameTimer).toHaveText(String(gameConfig.hard.initialGameTimer));
    await expect(feedTimer).toHaveText(String(gameConfig.hard.initialFeedTimer));
    await expect(successCounter).toHaveText(String(gameConfig.hard.goalNumberOfSuccesses));
  });

  test('difficulty buttons are disabled while game is running', async ({ page }) => {
    // Start the game
    await page.locator(selectors.startPauseButton).click();

    // All difficulty buttons should be disabled (StencilJS reflects as empty string)
    await expect(page.locator(selectors.easyButton)).toHaveAttribute('disabled', '');
    await expect(page.locator(selectors.mediumButton)).toHaveAttribute('disabled', '');
    await expect(page.locator(selectors.hardButton)).toHaveAttribute('disabled', '');
  });

  test('difficulty buttons are enabled when game is paused', async ({ page }) => {
    // Start the game
    await page.locator(selectors.startPauseButton).click();
    // Pause the game
    await page.locator(selectors.startPauseButton).click();

    // All difficulty buttons should NOT be disabled (no disabled attribute)
    await expect(page.locator(selectors.easyButton)).not.toHaveAttribute('disabled');
    await expect(page.locator(selectors.mediumButton)).not.toHaveAttribute('disabled');
    await expect(page.locator(selectors.hardButton)).not.toHaveAttribute('disabled');
  });

  test('changing difficulty resets timers and counters', async ({ page }) => {
    // Select Hard first
    await page.locator(selectors.hardButton).click();
    // Then switch to Easy
    await page.locator(selectors.easyButton).click();

    const gameTimer = page.locator(selectors.gameTimer);
    const feedTimer = page.locator(selectors.feedTimer);
    const successCounter = page.locator(selectors.successCounter);

    await expect(gameTimer).toHaveText(String(gameConfig.easy.initialGameTimer));
    await expect(feedTimer).toHaveText(String(gameConfig.easy.initialFeedTimer));
    await expect(successCounter).toHaveText(String(gameConfig.easy.goalNumberOfSuccesses));
  });
});
