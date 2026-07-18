import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import { EASY, MEDIUM } from './logic/difficulty';
import { saveGame } from './logic/gamePersistence';
import { createInitialState } from './logic/gameState';

const mockUpdate = vi.hoisted(() => ({
  updateAvailable: false,
  reload: vi.fn(),
}));
vi.mock('./logic/useAppUpdate', () => ({
  useAppUpdate: () => mockUpdate,
}));

describe('App', () => {
  it('renders the Pocket Dragon title', () => {
    render(<App />);
    expect(screen.getByText('Pocket Dragon')).toBeTruthy();
  });

  it('counts the game timer down while running', () => {
    vi.useFakeTimers();
    try {
      render(<App />);
      fireEvent.click(screen.getByTestId('start-pause'));
      expect(screen.getByTestId('game-timer').textContent).toBe(String(EASY.initialGameTimer));
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByTestId('game-timer').textContent).toBe(String(EASY.initialGameTimer - 1));
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByTestId('game-timer').textContent).toBe(String(EASY.initialGameTimer - 3));
    } finally {
      vi.useRealTimers();
    }
  });

  it('toggles sound and persists the setting', () => {
    render(<App />);
    const toggle = screen.getByTestId('sound-toggle');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(localStorage.getItem('soundEnabled')).toBe('false');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('soundEnabled')).toBe('true');
  });

  it('disables difficulty switching while the game is running', () => {
    render(<App />);
    const easy = screen.getByTestId('difficulty-easy') as HTMLButtonElement;
    const medium = screen.getByTestId('difficulty-medium') as HTMLButtonElement;
    expect(easy.disabled).toBe(false);

    fireEvent.click(screen.getByTestId('start-pause')); // start
    expect(easy.disabled).toBe(true);
    expect(medium.disabled).toBe(true);

    fireEvent.click(screen.getByTestId('start-pause')); // pause
    expect(easy.disabled).toBe(false);
  });

  it('shows the win dialog after enough successes', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('start-pause')); // start
    const logSuccess = screen.getByTestId('log-success');
    for (let i = 0; i < EASY.goalNumberOfSuccesses; i++) {
      fireEvent.click(logSuccess);
    }
    expect(screen.getByTestId('game-over-heading').textContent).toBe('You Won!');
  });

  it('shows the lose dialog when the feed timer runs out', () => {
    vi.useFakeTimers();
    try {
      render(<App />);
      fireEvent.click(screen.getByTestId('start-pause'));
      // Easy feed timer starts at EASY.initialFeedTimer seconds; run it to zero.
      act(() => {
        vi.advanceTimersByTime(EASY.initialFeedTimer * 1000);
      });
      expect(screen.getByTestId('game-over-heading').textContent).toBe('Oh noes!');
    } finally {
      vi.useRealTimers();
    }
  });

  it('restores a persisted in-progress game, paused', () => {
    saveGame({
      ...createInitialState(MEDIUM),
      isRunning: true,
      successesUntilVictory: 2,
      remainingClues: 5,
    });

    render(<App />);

    // Restored progress is shown...
    expect(screen.getByTestId('success-counter').textContent).toBe('2');
    expect(screen.getByTestId('remaining-clues').textContent).toBe('5');
    // ...and the game is paused (log-success is disabled when not running).
    expect(screen.getByTestId('log-success').getAttribute('disabled')).toBe('');
  });

  it('starts fresh (Easy defaults) when nothing is persisted', () => {
    render(<App />);
    expect(screen.getByTestId('success-counter').textContent).toBe(String(EASY.goalNumberOfSuccesses));
  });

  it('starts fresh when persisted data is invalid', () => {
    localStorage.setItem('gameState', '{corrupt');
    render(<App />);
    expect(screen.getByTestId('success-counter').textContent).toBe(String(EASY.goalNumberOfSuccesses));
  });

  it('persists state changes to localStorage', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('start-pause')); // START
    fireEvent.click(screen.getByTestId('log-success')); // 3 -> 2
    const raw = localStorage.getItem('gameState');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).state.successesUntilVictory).toBe(2);
  });
});

describe('App reload button', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUpdate.updateAvailable = false;
    mockUpdate.reload.mockClear();
  });

  it('is absent when no update is available', () => {
    mockUpdate.updateAvailable = false;
    render(<App />);
    expect(screen.queryByTestId('reload-button')).toBeNull();
  });

  it('shows before a game starts when an update is available', () => {
    mockUpdate.updateAvailable = true;
    render(<App />);
    expect(screen.getByTestId('reload-button')).toBeTruthy();
  });

  it('hides while a game is running', () => {
    mockUpdate.updateAvailable = true;
    render(<App />);
    fireEvent.click(screen.getByTestId('start-pause')); // START
    expect(screen.queryByTestId('reload-button')).toBeNull();
  });

  it('shows again while a game is paused', () => {
    mockUpdate.updateAvailable = true;
    render(<App />);
    fireEvent.click(screen.getByTestId('start-pause')); // START
    fireEvent.click(screen.getByTestId('start-pause')); // PAUSE
    expect(screen.getByTestId('reload-button')).toBeTruthy();
  });

  it('hides on the game-over screen', () => {
    mockUpdate.updateAvailable = true;
    render(<App />);
    fireEvent.click(screen.getByTestId('start-pause')); // START
    const logSuccess = screen.getByTestId('log-success');
    for (let i = 0; i < EASY.goalNumberOfSuccesses; i++) {
      fireEvent.click(logSuccess);
    }
    expect(screen.getByTestId('game-over-heading')).toBeTruthy(); // sanity: we are on the game-over screen
    expect(screen.queryByTestId('reload-button')).toBeNull();
  });

  it('hides while the rules modal is open', () => {
    mockUpdate.updateAvailable = true;
    render(<App />);
    fireEvent.click(screen.getByTestId('rules-link'));
    expect(screen.queryByTestId('reload-button')).toBeNull();
  });

  it('calls reload when clicked', () => {
    mockUpdate.updateAvailable = true;
    render(<App />);
    fireEvent.click(screen.getByTestId('reload-button'));
    expect(mockUpdate.reload).toHaveBeenCalledTimes(1);
  });
});
