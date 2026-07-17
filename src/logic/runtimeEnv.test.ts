import { describe, it, expect, vi, afterEach } from 'vitest';
import { isOfflineCopy } from './runtimeEnv';

afterEach(() => {
  vi.unstubAllGlobals();
});

// This module runs in the `unit` (node) project, where `window` is undefined,
// so each case stubs a minimal `window.location` with the protocol under test.
describe('isOfflineCopy', () => {
  it('returns true when opened via file:// (a downloaded offline copy)', () => {
    vi.stubGlobal('window', { location: { protocol: 'file:' } });
    expect(isOfflineCopy()).toBe(true);
  });

  it('returns true when opened via content:// (Android media store)', () => {
    vi.stubGlobal('window', { location: { protocol: 'content:' } });
    expect(isOfflineCopy()).toBe(true);
  });

  it('returns false when served over http (the deployed site)', () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } });
    expect(isOfflineCopy()).toBe(false);
  });

  it('returns false when served over https (the deployed site)', () => {
    vi.stubGlobal('window', { location: { protocol: 'https:' } });
    expect(isOfflineCopy()).toBe(false);
  });
});
