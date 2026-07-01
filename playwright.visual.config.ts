import { defineConfig, devices } from '@playwright/test';
import { inPinnedImage } from './e2e/fixtures/visual-gate';

// Visual-regression config, kept separate from playwright.config.ts (the
// behavior-level e2e suite) on purpose: these tests compare pixels, so they run
// ONLY inside the pinned `mcr.microsoft.com/playwright:<ver>-jammy` Docker image
// where fonts and antialiasing match the committed baselines exactly. This
// mirrors Lundalogik/lime-elements#4147 and avoids macOS-vs-Linux pixel
// flakiness.
//
// The gate (`inPinnedImage`, shared with the spec via e2e/fixtures/visual-gate):
// PLAYWRIGHT_VISUAL=1 on Linux. Both the `test:visual:update` Docker wrapper and
// the CI visual job set it; a plain host never does, so the specs auto-skip and
// the preview webServer below is not even started — `npm run test:visual` on a
// developer's Mac is a fast green no-op, not a font-mismatch failure.

export default defineConfig({
  testDir: './e2e/visual',
  forbidOnly: !!process.env.CI,
  // No retries: a pixel diff that only passes on retry is hiding a real
  // instability, not surviving a flake. Single worker keeps captures serial.
  retries: 0,
  workers: 1,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report-visual', open: 'never' }]]
    : [['html', { outputFolder: 'playwright-report-visual', open: 'never' }]],
  timeout: 15000,
  use: {
    ...devices['Desktop Chrome'], // fixed 1280x720 viewport → deterministic layout
    baseURL: 'http://localhost:4173',
  },
  expect: {
    toHaveScreenshot: {
      // The issue's "animations disabled / caret hidden": freeze CSS
      // animations/transitions to their end state and hide the text caret so
      // captures are stable. A tiny ratio tolerance absorbs sub-pixel
      // antialiasing that can differ even within the pinned image.
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
    },
  },
  // Only serve the app when the suite will actually run. Outside the pinned
  // image every spec skips, so booting a build+preview would be wasted work.
  webServer: inPinnedImage
    ? {
        // Same production bundle the e2e suite tests (service worker,
        // minification, prod config). In CI the visual job runs `vite build`
        // before this, so just serve the existing dist/; the Docker wrapper
        // (non-CI) builds first so the run is self-contained.
        command: process.env.CI
          ? 'npm run preview -- --port 4173 --strictPort'
          : 'npm run build && npm run preview -- --port 4173 --strictPort',
        url: 'http://localhost:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
});
