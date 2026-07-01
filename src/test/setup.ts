import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom does not implement media playback; stub it so the sound
// effects in App don't throw "Not implemented: HTMLMediaElement.play".
window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());

afterEach(() => {
  cleanup();
  localStorage.clear();
});
