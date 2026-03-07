import { Page } from '@playwright/test';

/**
 * Advance the game by the given number of seconds.
 *
 * The game uses `setInterval(..., 1000)`, so we advance time in
 * 1-second increments to let each tick fire and React re-render.
 */
export async function advanceGameSeconds(page: Page, seconds: number) {
  for (let i = 0; i < seconds; i++) {
    await page.clock.fastForward(1000);
  }
}
