import { devices } from '@playwright/test';

// Single source of truth for the settings that make the online and offline
// visual runs comparable against the SAME committed baselines. Both
// playwright.visual.config.ts and playwright.offline.visual.config.ts import
// these, so the "inlining must not change a pixel" invariant can't drift: the
// offline run only proves anything if its device (viewport) and screenshot
// tolerances match the online run exactly. Changing one here changes both.

// Fixed 1280x720 viewport → deterministic layout for the captures.
export const visualDevice = devices['Desktop Chrome'];

export const visualScreenshotConfig = {
  // The issue's "animations disabled / caret hidden": freeze CSS
  // animations/transitions to their end state and hide the text caret so
  // captures are stable. A tiny ratio tolerance absorbs sub-pixel
  // antialiasing that can differ even within the pinned image.
  animations: 'disabled',
  caret: 'hide',
  maxDiffPixelRatio: 0.01,
} as const;
