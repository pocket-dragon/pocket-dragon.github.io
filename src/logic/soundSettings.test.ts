import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadSoundEnabled, saveSoundEnabled } from './soundSettings';

function mockStorage() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((k: string) => (store.has(k) ? store.get(k)! : null)),
    setItem: vi.fn((k: string, v: string) => void store.set(k, v)),
    removeItem: vi.fn((k: string) => void store.delete(k)),
    clear: vi.fn(() => store.clear()),
    key: vi.fn(),
    length: 0,
  } as unknown as Storage;
}

describe('soundSettings', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', mockStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when nothing is stored', () => {
    expect(loadSoundEnabled()).toBeNull();
  });

  it('round-trips true and false', () => {
    saveSoundEnabled(true);
    expect(loadSoundEnabled()).toBe(true);
    expect(localStorage.getItem('soundEnabled')).toBe('true');

    saveSoundEnabled(false);
    expect(loadSoundEnabled()).toBe(false);
    expect(localStorage.getItem('soundEnabled')).toBe('false');
  });

  it('degrades gracefully when localStorage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('storage disabled');
      }),
      setItem: vi.fn(() => {
        throw new Error('quota exceeded');
      }),
    } as unknown as Storage);

    expect(loadSoundEnabled()).toBeNull();
    expect(() => saveSoundEnabled(true)).not.toThrow();
  });
});
