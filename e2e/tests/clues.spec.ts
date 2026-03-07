import { test, expect } from '@playwright/test';
import { selectors, gameConstants } from '../fixtures/selectors';
import { advanceGameSeconds } from '../fixtures/clock';

test.describe('Clue System', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
  });

  test('starts with initial number of clues', async ({ page }) => {
    const remainingClues = page.locator(selectors.remainingClues);
    await expect(remainingClues).toHaveText(
      String(gameConstants.initialClues),
    );
  });

  test('clue buttons are disabled when game is not running', async ({
    page,
  }) => {
    const generalClueButton = page.locator(selectors.generalClueButton);
    const specificClueButton = page.locator(selectors.specificClueButton);

    await expect(generalClueButton).toHaveAttribute('disabled', '');
    await expect(specificClueButton).toHaveAttribute('disabled', '');
  });

  test('general clue button is enabled when game is running and has enough clues', async ({
    page,
  }) => {
    const generalClueButton = page.locator(selectors.generalClueButton);

    await page.locator(selectors.startPauseButton).click();
    await expect(generalClueButton).not.toHaveAttribute('disabled');
  });

  test('specific clue button is enabled when game is running and has enough clues', async ({
    page,
  }) => {
    const specificClueButton = page.locator(selectors.specificClueButton);

    await page.locator(selectors.startPauseButton).click();
    await expect(specificClueButton).not.toHaveAttribute('disabled');
  });

  test('using general clue costs 1 clue', async ({ page }) => {
    const remainingClues = page.locator(selectors.remainingClues);
    const generalClueButton = page.locator(selectors.generalClueButton);

    await page.locator(selectors.startPauseButton).click();
    await generalClueButton.click();

    await expect(remainingClues).toHaveText(
      String(gameConstants.initialClues - gameConstants.generalClueCost),
    );
  });

  test('using specific clue costs 2 clues', async ({ page }) => {
    const remainingClues = page.locator(selectors.remainingClues);
    const specificClueButton = page.locator(selectors.specificClueButton);

    await page.locator(selectors.startPauseButton).click();
    await specificClueButton.click();

    await expect(remainingClues).toHaveText(
      String(gameConstants.initialClues - gameConstants.specificClueCost),
    );
  });

  test('general clue button disabled when not enough clues (0 clues)', async ({
    page,
  }) => {
    const remainingClues = page.locator(selectors.remainingClues);
    const generalClueButton = page.locator(selectors.generalClueButton);
    const specificClueButton = page.locator(selectors.specificClueButton);

    await page.locator(selectors.startPauseButton).click();

    // Use all clues: specific (2) + general (1) = 3
    await specificClueButton.click();
    await expect(remainingClues).toHaveText('1');

    await generalClueButton.click();
    await expect(remainingClues).toHaveText('0');

    await expect(generalClueButton).toHaveAttribute('disabled', '');
  });

  test('specific clue button disabled when only 1 clue remains', async ({
    page,
  }) => {
    const remainingClues = page.locator(selectors.remainingClues);
    const generalClueButton = page.locator(selectors.generalClueButton);
    const specificClueButton = page.locator(selectors.specificClueButton);

    await page.locator(selectors.startPauseButton).click();

    // Use specific clue (costs 2) to get to 1 remaining
    await specificClueButton.click();
    await expect(remainingClues).toHaveText('1');

    await expect(specificClueButton).toHaveAttribute('disabled', '');
    await expect(generalClueButton).not.toHaveAttribute('disabled');
  });

  test('clues regenerate after 15-20 seconds', async ({ page }) => {
    const remainingClues = page.locator(selectors.remainingClues);
    const specificClueButton = page.locator(selectors.specificClueButton);
    const generalClueButton = page.locator(selectors.generalClueButton);

    await page.locator(selectors.startPauseButton).click();

    // Use all clues
    await specificClueButton.click(); // -2, now 1
    await generalClueButton.click(); // -1, now 0

    await expect(remainingClues).toHaveText('0');

    // Advance past the max regen time (20s) plus a buffer
    await advanceGameSeconds(page, gameConstants.clueRegenMax + 1);

    const clues = parseInt((await remainingClues.textContent())!);
    expect(clues).toBeGreaterThan(0);
  });
});
