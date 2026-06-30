import { defineConfig } from 'vitest/config';

// Runs the PWA build assertion only. Kept separate from vite.config.ts's
// test.include ('src/**/*.test.ts') so the dist-dependent integration test
// never runs as part of the normal unit suite, and so a path filter can
// actually select this file (Vitest filters within `include`).
export default defineConfig({
  test: {
    include: ['tests/pwa-build.test.ts'],
    environment: 'node',
  },
});
