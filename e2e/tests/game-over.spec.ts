import { test, expect } from '../fixtures/test';
import type { Page } from '@playwright/test';
import { selectors, gameConfig } from '../fixtures/selectors';
import { advanceGameSeconds } from '../fixtures/clock';

test.describe('Game Over Conditions', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
  });

  async function advanceUntilFeedTimerExpires(
    page: Page,
    initialFeedTimer = gameConfig.easy.initialFeedTimer,
  ) {
    await advanceGameSeconds(page, initialFeedTimer);
  }

  test.describe('Losing - Feed Timer', () => {
    test('game over when feed timer reaches 0', async ({ page }) => {
      const gameOverDialog = page.locator(selectors.gameOverDialog);
      const gameOverHeading = page.locator(selectors.gameOverHeading);
      const gameOverText = page.locator(selectors.gameOverText);

      await page.locator(selectors.startPauseButton).click();
      await advanceUntilFeedTimerExpires(page);

      await expect(gameOverDialog).toBeVisible();
      await expect(gameOverHeading).toHaveText('Oh noes!');
      await expect(gameOverText).toContainText("didn't do so well");
    });
  });

  test('losing game shows 0 time points', async ({ page }) => {
    const gameOverDialog = page.locator(selectors.gameOverDialog);
    const timePoints = page.locator(selectors.timePoints);

    await page.locator(selectors.startPauseButton).click();
    await advanceUntilFeedTimerExpires(page);

    await expect(gameOverDialog).toBeVisible();
    await expect(timePoints).toContainText('0');
  });

  test('base points shown correctly on loss based on difficulty', async ({ page }) => {
    const gameOverDialog = page.locator(selectors.gameOverDialog);
    const basePoints = page.locator(selectors.basePoints);

    // Select Hard difficulty (8 base points)
    await page.locator(selectors.hardButton).click();

    await page.locator(selectors.startPauseButton).click();
    await advanceUntilFeedTimerExpires(page, gameConfig.hard.initialFeedTimer);

    await expect(gameOverDialog).toBeVisible();
    await expect(basePoints).toContainText('8');
  });

  test('game over button resets the game', async ({ page }) => {
    const feedTimer = page.locator(selectors.feedTimer);
    const gameOverDialog = page.locator(selectors.gameOverDialog);
    const gameOverButton = page.locator(selectors.gameOverButton);
    const gameTimer = page.locator(selectors.gameTimer);
    const successCounter = page.locator(selectors.successCounter);

    await page.locator(selectors.startPauseButton).click();
    await advanceUntilFeedTimerExpires(page);

    await expect(gameOverDialog).toBeVisible();
    await gameOverButton.click();

    await expect(gameOverDialog).not.toBeVisible();
    await expect(gameTimer).toHaveText(String(gameConfig.easy.initialGameTimer));
    await expect(feedTimer).toHaveText(String(gameConfig.easy.initialFeedTimer));
    await expect(successCounter).toHaveText(
      String(gameConfig.easy.goalNumberOfSuccesses),
    );
  });

  test('game over button shows "Try again!" for loss', async ({ page }) => {
    const gameOverDialog = page.locator(selectors.gameOverDialog);
    const gameOverButton = page.locator(selectors.gameOverButton);

    await page.locator(selectors.startPauseButton).click();
    await advanceUntilFeedTimerExpires(page);

    await expect(gameOverDialog).toBeVisible();
    await expect(gameOverButton).toHaveAttribute('label', 'Try again!');
  });

  test('game over button shows "Yay!" for win', async ({ page }) => {
    const logSuccessButton = page.locator(selectors.logSuccessButton);
    const gameOverDialog = page.locator(selectors.gameOverDialog);
    const gameOverButton = page.locator(selectors.gameOverButton);

    await page.locator(selectors.startPauseButton).click();
    await logSuccessButton.click();
    await logSuccessButton.click();
    await logSuccessButton.click();

    await expect(gameOverDialog).toBeVisible();
    await expect(gameOverButton).toHaveAttribute('label', 'Yay!');
  });
});
