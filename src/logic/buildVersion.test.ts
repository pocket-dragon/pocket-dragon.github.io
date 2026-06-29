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
});
