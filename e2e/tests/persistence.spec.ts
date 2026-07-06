import { test, expect } from '@playwright/test';
import { selectors } from '../fixtures/selectors';

test.describe('Game state persistence', () => {
  test('restores an in-progress game, paused, after reload', async ({ page }) => {
    await page.goto('/');

    // Start a game and make observable progress.
    await page.locator(selectors.startPauseButton).click();
    await page.locator(selectors.logSuccessButton).click(); // 3 -> 2 (Easy)
    await expect(page.locator(selectors.successCounter)).toHaveText('2');
    const cluesBefore = await page.locator(selectors.remainingClues).textContent();

    await page.reload();

    // Progress is restored...
    await expect(page.locator(selectors.successCounter)).toHaveText('2');
    await expect(page.locator(selectors.remainingClues)).toHaveText(cluesBefore ?? '');
    // ...and the game is paused: log-success is disabled again (not running).
    await expect(page.locator(selectors.logSuccessButton)).toHaveAttribute('disabled', '');
  });

  test('a fresh visitor (no saved game) sees Easy defaults', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator(selectors.successCounter)).toHaveText('3'); // Easy goal
  });

  test('tick cadence stays ~1 Hz under CPU throttling with persistence on', async ({
    page,
    browserName,
  }) => {
    // CDP CPU throttling is Chromium-only.
    test.skip(browserName !== 'chromium', 'CDP setCPUThrottlingRate is Chromium-only');

    await page.goto('/');
    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: 6 });

    await page.locator(selectors.startPauseButton).click();
    const before = Number(await page.locator(selectors.gameTimer).textContent());
    await page.waitForTimeout(5000);
    const after = Number(await page.locator(selectors.gameTimer).textContent());

    const elapsed = before - after; // game-seconds counted down over ~5 real seconds
    // Persistence adds no measurable slowdown: ~5 ticks fire (tolerance for scheduler jitter).
    expect(elapsed).toBeGreaterThanOrEqual(4);
    expect(elapsed).toBeLessThanOrEqual(6);
  });
});
