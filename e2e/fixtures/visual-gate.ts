/**
 * Single source of truth for the visual-suite gate.
 *
 * The baselines are pixel-pinned to the `mcr.microsoft.com/playwright:*-jammy`
 * Docker image, so the suite must run ONLY inside it: PLAYWRIGHT_VISUAL=1 on
 * Linux (set by the CI visual job and the `test:visual:update` Docker wrapper).
 *
 * Imported by both `playwright.visual.config.ts` (to gate the preview
 * webServer) and `e2e/visual/visual.spec.ts` (to skip the specs) so the two
 * halves of the same decision — boot the server, run the specs — can't drift
 * out of sync.
 */
export const inPinnedImage =
  process.env.PLAYWRIGHT_VISUAL === '1' && process.platform === 'linux';
