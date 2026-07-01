import { test, expect } from '@playwright/test';
import { selectors, gameConfig } from '../fixtures/selectors';

/**
 * The whole point of the service worker (and the `b<n>` build indicator that
 * signals a fresh cache) is that the app keeps working with no network. This
 * spec proves that end-to-end against the real production bundle served by
 * `vite preview`: install the SW, cut the network, reload, and confirm the app
 * still renders and a core interaction works entirely from cache.
 *
 * It only makes sense against the built bundle — the dev server has no service
 * worker — which is why it depends on the stage-1 `vite preview` foundation.
 */
test.describe('Offline PWA', () => {
  test('cached app loads and stays interactive after going offline', async ({
    page,
    context,
  }) => {
    // First visit: let the service worker install, precache the app shell, and
    // take control of this page. Until the SW controls the client, an offline
    // navigation would go to the network and fail.
    await page.goto('/');

    // Split into two bounded, self-describing gates so a timeout localizes the
    // failing condition (no SW registered vs. registered-but-never-controlling)
    // instead of one opaque "waitForFunction timed out". Keep this comfortably
    // below the per-test budget (playwright.config.ts `timeout: 15000`) so a
    // stalled gate trips its own message before the generic test-level timeout;
    // the SW normally activates in ~1-2 s, so this is pure headroom.
    const swTimeout = 10_000;

    // 1. A service worker registers and activates.
    await page.waitForFunction(
      async () => {
        const sw = navigator.serviceWorker;
        if (!sw) return false;
        await sw.ready;
        return true;
      },
      undefined,
      { timeout: swTimeout },
    );

    // 2. ...and it takes control of THIS page. Control on the first load, with
    // no second reload, relies on `registerType: 'autoUpdate'` in vite.config.ts
    // emitting clientsClaim/skipWaiting. A switch to `registerType: 'prompt'`
    // would leave `controller` null here until an extra reload.
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, {
      timeout: swTimeout,
    });

    // Cut the network. From here nothing may reach the server.
    await context.setOffline(true);

    // Reload: the navigation, JS, CSS and fonts must all come from the workbox
    // precache. If anything still needed the network this would fail to render.
    await page.reload();

    // The app shell renders offline.
    await expect(page.locator(selectors.startPauseButton)).toBeVisible();
    await expect(page.locator(selectors.easyButton)).toBeVisible();

    // A core interaction still runs fully client-side while offline: starting
    // the game enables the log-success control (disabled at rest), and logging
    // a success decrements the remaining-successes counter — real game logic,
    // not just a rendered value.
    const logSuccess = page.locator(selectors.logSuccessButton);
    const successCounter = page.locator(selectors.successCounter);
    const goal = gameConfig.easy.goalNumberOfSuccesses;
    await expect(logSuccess).toHaveAttribute('disabled', '');

    await page.locator(selectors.startPauseButton).click();

    await expect(logSuccess).not.toHaveAttribute('disabled');
    await expect(successCounter).toHaveText(String(goal));

    await logSuccess.click();

    await expect(successCounter).toHaveText(String(goal - 1));
  });
});
