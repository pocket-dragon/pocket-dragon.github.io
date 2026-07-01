const STORAGE_KEY = 'soundEnabled';

export function loadSoundEnabled(): boolean | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return null;
    return stored === 'true';
  } catch {
    // localStorage can throw (Safari private mode, disabled, quota).
    // Treat an unreadable store as "no stored preference".
    return null;
  }
}

export function saveSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // Persisting the preference is best-effort; ignore write failures
    // (private mode / quota / disabled storage).
  }
}
