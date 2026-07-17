import { test, expect } from '../fixtures/test';
import { selectors, gameConfig, gameConstants } from '../fixtures/selectors';
import { advanceGameSeconds } from '../fixtures/clock';

test.describe('Sound Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sound toggle button is visible', async ({ page }) => {
    const soundToggle = page.locator(selectors.soundToggle);
    await expect(soundToggle).toBeVisible();
  });

  test('sound is enabled by default', async ({ page }) => {
    const soundToggle = page.locator(selectors.soundToggle);
    await expect(soundToggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('clicking toggle disables sound', async ({ page }) => {
    const soundToggle = page.locator(selectors.soundToggle);

    await expect(soundToggle).toHaveAttribute('aria-pressed', 'true');
    await soundToggle.click();
    await expect(soundToggle).toHaveAttribute('aria-label', 'Enable sound');
  });

  test('clicking toggle again re-enables sound', async ({ page }) => {
    const soundToggle = page.locator(selectors.soundToggle);

    await soundToggle.click();
    await expect(soundToggle).toHaveAttribute('aria-label', 'Enable sound');

    await soundToggle.click();
    await expect(soundToggle).toHaveAttribute('aria-label', 'Disable sound');
  });

  test('sound setting persists across page reload', async ({ page }) => {
    const soundToggle = page.locator(selectors.soundToggle);

    await soundToggle.click();
    await expect(soundToggle).toHaveAttribute('aria-label', 'Enable sound');

    await page.reload();
    await expect(soundToggle).toHaveAttribute('aria-label', 'Enable sound');
  });

  test('sound setting persists when re-enabled', async ({ page }) => {
    const soundToggle = page.locator(selectors.soundToggle);

    await soundToggle.click();
    await soundToggle.click();
    await expect(soundToggle).toHaveAttribute('aria-label', 'Disable sound');

    await page.reload();
    await expect(soundToggle).toHaveAttribute('aria-label', 'Disable sound');
  });
});

test.describe('Sound Alerts (visual indicators only)', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
  });

  test('feed timer warning visual at 30 seconds', async ({ page }) => {
    const feedTimer = page.locator(selectors.feedTimer);

    await page.locator(selectors.startPauseButton).click();

    // Advance to the feed threshold
    const secondsToWait =
      gameConfig.easy.initialFeedTimer - gameConstants.feedThreshold;
    await advanceGameSeconds(page, secondsToWait);

    const feedTimerContainer = feedTimer.locator('..');
    await expect(feedTimerContainer).toHaveClass(/warning/);
  });
});
