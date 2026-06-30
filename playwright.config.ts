import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 15000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    // Test the real production bundle (service worker, minification, prod
    // config) — not the dev server. vite preview serves dist/ on :4173.
    // In CI the build already ran earlier in the job (its dist/ is consumed by
    // test:pwa), so skip the redundant rebuild and just serve the existing
    // dist/. Locally we still build first so `npm run test:e2e` is
    // self-contained.
    command: process.env.CI
      ? 'npm run preview -- --port 4173 --strictPort'
      : 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
