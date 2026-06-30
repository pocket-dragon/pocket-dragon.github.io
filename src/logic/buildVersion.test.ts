import { describe, it, expect, vi, afterEach } from 'vitest';
import { getBuildVersion } from './buildVersion';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getBuildVersion', () => {
  it('returns the value when VITE_APP_VERSION is a non-empty string', () => {
    vi.stubEnv('VITE_APP_VERSION', 'b42');
    expect(getBuildVersion()).toBe('b42');
  });

  it('returns undefined when VITE_APP_VERSION is an empty string', () => {
    vi.stubEnv('VITE_APP_VERSION', '');
    expect(getBuildVersion()).toBeUndefined();
  });

  it('returns undefined when VITE_APP_VERSION is unset (local/dev build)', () => {
    // Passing undefined to stubEnv deletes the variable, modelling the
    // local/dev path the typeof guard exists for.
    vi.stubEnv('VITE_APP_VERSION', undefined as unknown as string);
    expect(getBuildVersion()).toBeUndefined();
  });

  it('returns undefined when VITE_APP_VERSION is whitespace only', () => {
    vi.stubEnv('VITE_APP_VERSION', '   ');
    expect(getBuildVersion()).toBeUndefined();
  });

  it('trims surrounding whitespace from the value', () => {
    vi.stubEnv('VITE_APP_VERSION', '  b42  ');
    expect(getBuildVersion()).toBe('b42');
  });
});
