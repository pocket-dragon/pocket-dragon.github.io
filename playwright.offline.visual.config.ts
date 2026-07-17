import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig } from '@playwright/test';
import { visualDevice, visualScreenshotConfig } from './e2e/fixtures/visual-baseline';

// Visual suite against the offline single-file artifact. Inlining must not
// change a pixel, so this reuses the SAME committed baselines as the normal
// visual run (snapshot paths are derived from the spec file, not the config).
// Like playwright.visual.config.ts it only produces real results inside the
// pinned Playwright Docker image (the specs self-skip via the visual-gate
// fixture elsewhere); there is no webServer — the artifact loads via file://.
export default defineConfig({
  testDir: './e2e/visual',
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  // The top rules-modal frame includes the online-only offline-download link
  // (hidden in offline copies by design, and placed just above the Components
  // heading near the top of the rules), so that one capture legitimately
  // differs from the shared online baseline — it is asserted by the online
  // visual run only. Every other screenshot must stay pixel-identical between
  // builds. The trailing $ keeps the two other rules-modal captures (scrolled,
  // promo-expanded) in the offline run — their frames never show the link.
  // NOTE: this regex is coupled to the exact test title in
  // e2e/visual/visual.spec.ts; renaming that test drops the exclusion. It then
  // fails loudly against the shared baseline rather than silently, but keep the
  // title and this pattern in sync.
  grepInvert: /rules modal$/,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report-visual-offline', open: 'never' }]]
    : [['html', { outputFolder: 'playwright-report-visual-offline', open: 'never' }]],
  timeout: 15000,
  use: {
    // Shared verbatim with playwright.visual.config.ts (see
    // e2e/fixtures/visual-baseline): the offline run only proves "inlining
    // changes no pixel" if the device and tolerances match the online run.
    ...visualDevice,
    baseURL: pathToFileURL(path.resolve('dist-offline/index.html')).href,
  },
  expect: {
    toHaveScreenshot: visualScreenshotConfig,
  },
});
