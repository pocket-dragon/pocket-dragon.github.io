import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

// Behavior e2e suite against the built single-file offline artifact, loaded
// over real file:// URLs — the artifact's whole reason to exist. Mirrors
// playwright.config.ts minus the webServer (there is no server), with baseURL
// pointing at the artifact; e2e/fixtures/test.ts maps goto('/') to it.
export default defineConfig({
  testDir: './e2e/tests',
  // Tests service-worker behavior, which intentionally doesn't exist here.
  testIgnore: '**/offline-pwa.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report-offline', open: 'never' }]],
  timeout: 15000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: pathToFileURL(path.resolve('dist-offline/index.html')).href,
    trace: 'on-first-retry',
  },
});
