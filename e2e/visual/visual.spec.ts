import { test, expect } from '../fixtures/test';
import type { Page } from '@playwright/test';
import { selectors, gameConfig } from '../fixtures/selectors';
import { advanceGameSeconds } from '../fixtures/clock';
import { inPinnedImage } from '../fixtures/visual-gate';

/**
 * Visual regression for the key app states — the behavior-invisible layer the
 * e2e suite can't see. A layout/style regression that doesn't change any
 * assertion (the `lime-elements#4147` pattern: a major dependency bump quietly
 * shifting the rendering) passes every functional test but is caught here.
 *
 * These baselines are pixel-pinned to the `mcr.microsoft.com/playwright:*-jammy`
 * Docker image, so the whole suite skips unless it's running inside it
 * (PLAYWRIGHT_VISUAL=1 on Linux — set by the CI visual job and the
 * `test:visual:update` Docker wrapper). On a developer's Mac `npm run
 * test:visual` is a green no-op instead of a guaranteed font-mismatch failure.
 *
 * The `inPinnedImage` gate is shared with playwright.visual.config.ts (which
 * uses it to gate the preview webServer) via e2e/fixtures/visual-gate.
 */
test.describe('Visual regression (key app states)', () => {
  test.skip(
    !inPinnedImage,
    'Visual baselines are pixel-pinned to the Playwright Docker image; run in ' +
      'the CI visual job or via `npm run test:visual:update` (needs Docker).',
  );

  // Custom web fonts reflow the layout when they finish loading. Wait for them
  // before every capture so we compare a settled page, not a fallback-font
  // frame that would drift the baseline.
  async function fontsReady(page: Page) {
    // Resolve to nothing: document.fonts.ready yields a FontFaceSet, which is
    // not serializable back across the evaluate boundary. We only need to await
    // it settling, not its value.
    await page.evaluate(() => document.fonts.ready.then(() => {}));
  }

  // Start a game (optionally on a chosen difficulty) with the clock frozen, so
  // no ticks fire: every timer holds its initial value and the rng-driven clue
  // regeneration never runs — making the resulting board fully deterministic.
  async function startGameAt(page: Page, levelSelector?: string) {
    await page.clock.install();
    await page.goto('/');
    if (levelSelector) await page.locator(levelSelector).click();
    await page.locator(selectors.startPauseButton).click();
  }

  // Both end-game dialogs capture only the surface, not the full page: the board
  // behind the translucent backdrop shows "Remaining clues: N", an rng-driven,
  // run-to-run-varying value that would make a full-page baseline flaky.
  const gameOverSurface = `${selectors.gameOverDialog} ${selectors.dialogSurface}`;

  test('initial screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(selectors.startPauseButton)).toBeVisible();
    await fontsReady(page);
    await expect(page).toHaveScreenshot('initial-screen.png');
  });

  test('mid-game', async ({ page }) => {
    // Start the game with the clock frozen (deterministic countdown), advance a
    // fixed 10 s (below the 15 s clue-regen floor, so the clue state can't
    // randomly change), and log one success — a clearly in-progress board with
    // moved timers and a decremented success counter.
    await startGameAt(page);
    await advanceGameSeconds(page, 10);
    await page.locator(selectors.logSuccessButton).click();
    await expect(page.locator(selectors.successCounter)).toHaveText(
      String(gameConfig.easy.goalNumberOfSuccesses - 1),
    );
    await fontsReady(page);
    await expect(page).toHaveScreenshot('mid-game.png');
  });

  // Starting a game on each level (easy is covered by 'mid-game' above). Freshly
  // started, no advance: the board shows that level's goal count and initial
  // timers, difficulty locked, and the action buttons enabled.
  for (const level of [
    { name: 'medium', selector: selectors.mediumButton },
    { name: 'hard', selector: selectors.hardButton },
  ]) {
    test(`started on ${level.name}`, async ({ page }) => {
      await startGameAt(page, level.selector);
      await expect(page.locator(selectors.startPauseButton)).toHaveAttribute('label', 'Pause');
      await fontsReady(page);
      await expect(page).toHaveScreenshot(`started-${level.name}.png`);
    });
  }

  test('paused', async ({ page }) => {
    // Start, advance 10 s (below the 15 s clue-regen floor, so clues stay put),
    // then pause. The timers hold at their mid-game values while the controls
    // return to their editable state — difficulty and reset re-enabled, the
    // toggle back to "Start".
    await startGameAt(page);
    await advanceGameSeconds(page, 10);
    await page.locator(selectors.startPauseButton).click();
    await expect(page.locator(selectors.startPauseButton)).toHaveAttribute('label', 'Start');
    await fontsReady(page);
    await expect(page).toHaveScreenshot('paused.png');
  });

  test('one clue left', async ({ page }) => {
    // Spend a specific clue (cost 2) to drop from 3 to 1 clue. At 1, the general
    // clue (cost 1) stays enabled but the specific clue (cost 2) is disabled —
    // the exact affordance boundary. Clock frozen, so no regeneration nudges the
    // count off 1.
    await startGameAt(page);
    await page.locator(selectors.specificClueButton).click();
    await expect(page.locator(selectors.remainingClues)).toHaveText('1');
    await expect(page.locator(selectors.generalClueButton)).not.toHaveAttribute('disabled');
    await expect(page.locator(selectors.specificClueButton)).toHaveAttribute('disabled', '');
    await fontsReady(page);
    await expect(page).toHaveScreenshot('one-clue-left.png');
  });

  test('game-over dialog', async ({ page }) => {
    // Lose deterministically: start, then run the feed timer to 0 with the
    // clock frozen so the elapsed time — and thus the displayed points — are
    // fixed. Easy difficulty (the default) gives stable base/time points.
    await startGameAt(page);
    await advanceGameSeconds(page, gameConfig.easy.initialFeedTimer);
    await expect(page.locator(selectors.gameOverDialog)).toBeVisible();
    await fontsReady(page);
    // Surface only, not full page: running the feed timer to 0 accumulates an
    // rng-driven number of clues, so the "Remaining clues: N" behind the
    // backdrop would flake a full-page baseline (see gameOverSurface). Dialog
    // *positioning* over the board is covered by the full-page won captures
    // below — same `.mdc-dialog` structure. On a loss the points block is
    // hidden (`.game-lost`), so the surface holds just heading, text, button.
    await expect(page.locator(gameOverSurface)).toHaveScreenshot('game-over-dialog.png');
  });

  // Winning on each level. Log the level's goal number of successes back-to-back
  // with the clock frozen: no ticks fire, so the game timer stays at its initial
  // value (deterministic time points) AND the clue count never regenerates off
  // its initial 3 — which is what makes a *full-page* capture safe here. The
  // loss above can't do that (running the feed timer to 0 accumulates an
  // rng-driven clue count), so verifying the won dialog is positioned correctly
  // over the whole board gives us high confidence the identically-structured
  // loss dialog is too. The won dialog also shows the points block (a loss hides
  // it), so the captures differ per level: base points (1 / 3 / 8) and time
  // points (300 / 360 / 420 game seconds → 30 / 36 / 42).
  for (const level of [
    { name: 'easy', selector: undefined, goal: gameConfig.easy.goalNumberOfSuccesses },
    { name: 'medium', selector: selectors.mediumButton, goal: gameConfig.medium.goalNumberOfSuccesses },
    { name: 'hard', selector: selectors.hardButton, goal: gameConfig.hard.goalNumberOfSuccesses },
  ]) {
    test(`won on ${level.name}`, async ({ page }) => {
      await startGameAt(page, level.selector);
      const logSuccess = page.locator(selectors.logSuccessButton);
      for (let i = 0; i < level.goal; i++) await logSuccess.click();
      await expect(page.locator(selectors.gameOverDialog)).toBeVisible();
      // No ticks ran, so the board behind the dialog is fixed — clues still 3.
      await expect(page.locator(selectors.remainingClues)).toHaveText('3');
      await fontsReady(page);
      await expect(page).toHaveScreenshot(`won-${level.name}.png`);
    });
  }

  test('rules modal', async ({ page }) => {
    await openRules(page);
    await fontsReady(page);
    await expect(page).toHaveScreenshot('rules-modal.png');
  });

  // Opens the rules modal and waits for its body to render. The three rules
  // captures below screenshot the `.rules-surface` (fixed header + scrollable
  // body + fixed footer) so a scrolled/expanded body shows against a stable
  // frame.
  async function openRules(page: Page) {
    await page.goto('/');
    await page.locator(selectors.rulesLink).click();
    await expect(page.locator(selectors.rulesDialog)).toBeVisible();
    await expect(page.locator(selectors.rulesContent)).toBeVisible();
  }
  const rulesSurface = `${selectors.rulesDialog} ${selectors.rulesSurface}`;

  test('rules modal scrolled to the promo sections', async ({ page }) => {
    await openRules(page);
    // The top-only capture never exercises the scrolled body. Anchor the first
    // collapsible promo section to the top of the scroll area — a deterministic
    // scroll position that shows the tail of the rules text and the collapsed
    // "Promo Rules:" list rendering correctly.
    await page
      .locator(selectors.promoAnachrony)
      .evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await fontsReady(page);
    await expect(page.locator(rulesSurface)).toHaveScreenshot('rules-modal-scrolled.png');
  });

  test('rules modal promo section expanded', async ({ page }) => {
    await openRules(page);
    // Expand one collapsible promo (`<details>`) and prove it reveals the promo
    // image and rules content — the interaction the top capture can't see. One
    // section is enough coverage; they share a component.
    const promo = page.locator(selectors.promoAnachrony);
    await promo.locator('summary').click();
    await expect(promo).toHaveJSProperty('open', true);

    const image = promo.locator('img.promo');
    await expect(image).toBeVisible();
    // Wait for the actual image bytes so we capture the photo, not an empty
    // <img> box that would settle differently across runs.
    await expect
      .poll(() =>
        image.evaluate((el) => {
          const img = el as HTMLImageElement;
          return img.complete && img.naturalWidth > 0;
        }),
      )
      .toBe(true);

    // Pin the opened section to the top of the scroll area for a stable frame.
    await promo.evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await fontsReady(page);
    await expect(page.locator(rulesSurface)).toHaveScreenshot('rules-modal-promo-expanded.png');
  });
});
