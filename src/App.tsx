import { useState, useCallback, useEffect, useRef } from 'react';
import { RulesModal } from './components/RulesModal';
import { PdButton } from './components/PdButton';
import { getBuildVersion } from './logic/buildVersion';
import {
  GameState,
  createInitialState,
  isFeedingAllowed,
  isGeneralClueAllowed,
  isSpecificClueAllowed,
  calculateFeedReset,
  generateClueTimer,
  calculateTimePoints,
  WON,
  LOST,
  GENERAL_CLUE_COST,
  SPECIFIC_CLUE_COST,
} from './logic/gameState';
import { DifficultyConfig, EASY, MEDIUM, HARD } from './logic/difficulty';
import './App.css';

function App() {
  const [state, setState] = useState<GameState>(() => createInitialState(EASY));
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Audio refs
  const timerBeepRef = useRef<HTMLAudioElement>(null);
  const timerBeep2xRef = useRef<HTMLAudioElement>(null);
  const timerBeep3xRef = useRef<HTMLAudioElement>(null);

  // Load sound setting from storage
  useEffect(() => {
    const stored = localStorage.getItem('soundEnabled');
    if (stored !== null) {
      setSoundEnabled(stored === 'true');
    }
  }, []);

  // Save sound setting to storage
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('soundEnabled', String(newValue));
      if (newValue && timerBeepRef.current) {
        timerBeepRef.current.play().catch(() => {});
      }
      return newValue;
    });
  }, []);

  // Set difficulty
  const setDifficulty = useCallback((difficulty: DifficultyConfig) => {
    if (state.isRunning) return;
    setState(createInitialState(difficulty));
  }, [state.isRunning]);

  // Start game
  const startGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      clueTimer: prev.clueTimer < 1 ? generateClueTimer() : prev.clueTimer,
    }));
  }, []);

  // Pause game
  const pauseGame = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  // Play or pause
  const playOrPause = useCallback(() => {
    if (state.isRunning) {
      pauseGame();
    } else {
      startGame();
    }
  }, [state.isRunning, startGame, pauseGame]);

  // Reset game
  const resetGame = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(createInitialState(state.difficulty));
  }, [state.difficulty]);

  // Feed dragon
  const feed = useCallback(() => {
    if (!isFeedingAllowed(state)) return;
    setState(prev => ({
      ...prev,
      feedTimer: calculateFeedReset(prev.difficulty.initialFeedTimer, prev.feedTimer),
    }));
  }, [state]);

  // Log success
  const logSuccess = useCallback(() => {
    if (!state.isRunning) return;
    setState(prev => {
      const newSuccesses = prev.successesUntilVictory - 1;
      if (newSuccesses < 1) {
        return {
          ...prev,
          successesUntilVictory: newSuccesses,
          isRunning: false,
          gameResult: WON,
        };
      }
      return { ...prev, successesUntilVictory: newSuccesses };
    });
  }, [state.isRunning]);

  // Use general clue
  const useGeneralClue = useCallback(() => {
    if (!isGeneralClueAllowed(state)) return;
    setState(prev => ({
      ...prev,
      remainingClues: prev.remainingClues - GENERAL_CLUE_COST,
    }));
  }, [state]);

  // Use specific clue
  const useSpecificClue = useCallback(() => {
    if (!isSpecificClueAllowed(state)) return;
    setState(prev => ({
      ...prev,
      remainingClues: prev.remainingClues - SPECIFIC_CLUE_COST,
    }));
  }, [state]);

  // Close game over dialog
  const closeGameOver = useCallback(() => {
    resetGame();
  }, [resetGame]);

  // Close game-over dialog on Escape key
  useEffect(() => {
    if (!state.gameResult) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeGameOver();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.gameResult, closeGameOver]);

  // Game tick effect
  useEffect(() => {
    if (!state.isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setState(prev => {
        const newGameTimer = prev.gameTimer - 1;
        const newFeedTimer = prev.feedTimer - 1;
        let newClueTimer = prev.clueTimer - 1;
        let newRemainingClues = prev.remainingClues;

        // Sound alerts at thresholds
        if (soundEnabled) {
          if (newFeedTimer === 30 && timerBeepRef.current) {
            timerBeepRef.current.play().catch(() => {});
          }
          if (newFeedTimer === 20 && timerBeep2xRef.current) {
            timerBeep2xRef.current.play().catch(() => {});
          }
          if (newFeedTimer === 10 && timerBeep3xRef.current) {
            timerBeep3xRef.current.play().catch(() => {});
          }
        }

        // Clue regeneration
        if (newClueTimer < 1) {
          newRemainingClues += 1;
          newClueTimer = generateClueTimer();
        }

        // Check lose conditions
        if (newFeedTimer < 1 || newGameTimer < 1) {
          return {
            ...prev,
            gameTimer: Math.max(0, newGameTimer),
            feedTimer: Math.max(0, newFeedTimer),
            clueTimer: newClueTimer,
            remainingClues: newRemainingClues,
            isRunning: false,
            gameResult: LOST,
          };
        }

        return {
          ...prev,
          gameTimer: newGameTimer,
          feedTimer: newFeedTimer,
          clueTimer: newClueTimer,
          remainingClues: newRemainingClues,
        };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning, soundEnabled]);

  const feedingAllowed = isFeedingAllowed(state);
  const generalClueAllowed = isGeneralClueAllowed(state);
  const specificClueAllowed = isSpecificClueAllowed(state);
  const buildVersion = getBuildVersion();

  return (
    <div className="app">
      <header className="mdc-top-app-bar">
        <div className="mdc-top-app-bar__row">
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <span className="mdc-top-app-bar__title">Pocket Dragon</span>
          </section>
        </div>
      </header>

      <main className="app-home">
        <div className="difficulty-controls">
          <PdButton
            data-testid="difficulty-easy"
            label="Easy"
            color="green"
            selected={state.difficulty.name === 'easy'}
            onClick={() => setDifficulty(EASY)}
            disabled={state.isRunning}
          />
          <PdButton
            data-testid="difficulty-medium"
            label="Medium"
            color="yellow"
            selected={state.difficulty.name === 'medium'}
            onClick={() => setDifficulty(MEDIUM)}
            disabled={state.isRunning}
          />
          <PdButton
            data-testid="difficulty-hard"
            label="Hard"
            color="red"
            selected={state.difficulty.name === 'hard'}
            onClick={() => setDifficulty(HARD)}
            disabled={state.isRunning}
          />
        </div>

        <div className="game-controls">
          <PdButton
            data-testid="start-pause"
            label={state.isRunning ? 'Pause' : 'Start'}
            primary
            color="green"
            onClick={playOrPause}
          />
          <PdButton
            data-testid="reset"
            label="Reset"
            color="green"
            onClick={resetGame}
            disabled={state.isRunning}
          />
        </div>

        <div className="timers">
          <div>
            <p>Game time left:</p>
            <p className="timer" data-testid="game-timer">{state.gameTimer}</p>
          </div>
          <div className={feedingAllowed ? 'warning' : ''}>
            <p>Feeder time left:</p>
            <p className="timer" data-testid="feed-timer">{state.feedTimer}</p>
          </div>
        </div>

        <div>
          <PdButton
            data-testid="feed"
            label="Feed!"
            primary
            color="red"
            onClick={feed}
            disabled={!feedingAllowed}
          />
        </div>

        <div className="successes">
          <div>
            Number of<br />successes left:
          </div>
          <div className="counter" data-testid="success-counter">
            {state.successesUntilVictory}
          </div>
        </div>

        <p>
          <PdButton
            data-testid="log-success"
            label="Log success"
            primary
            onClick={logSuccess}
            disabled={!state.isRunning}
          />
        </p>

        <div>
          <p>
            Remaining clues: <b data-testid="remaining-clues">{state.remainingClues}</b>
          </p>
          <div className="clue-buttons">
            <div>
              <PdButton
                data-testid="general-clue"
                label="Use general clue"
                primary
                onClick={useGeneralClue}
                disabled={!generalClueAllowed}
              />
            </div>
            <div>
              <PdButton
                data-testid="specific-clue"
                label="Use specific clue"
                primary
                onClick={useSpecificClue}
                disabled={!specificClueAllowed}
              />
            </div>
          </div>
        </div>

        <p className="rules-version">
          <a
            href="#"
            data-testid="rules-link"
            onClick={(e) => {
              e.preventDefault();
              setRulesOpen(true);
            }}
          >
            Rules version: 1.0.1
          </a>
        </p>

        <aside className="settings">
          <button
            id="toggle-sound"
            data-testid="sound-toggle"
            className="mdc-icon-button"
            aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
            aria-pressed={soundEnabled}
            onClick={toggleSound}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              {soundEnabled ? (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              ) : (
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              )}
            </svg>
          </button>
        </aside>

        {/* Game Over Dialog */}
        {state.gameResult && (
          <aside
            id="game-over-dialog"
            data-testid="game-over-dialog"
            className="mdc-dialog mdc-dialog--open"
            role="dialog"
            aria-modal="true"
          >
            <div className="mdc-dialog__surface">
              <header className="mdc-dialog__header">
                <h2 className="mdc-dialog__header__title" data-testid="game-over-heading">
                  {state.gameResult.heading}
                </h2>
              </header>
              <section className="mdc-dialog__body">
                <span data-testid="game-over-text">{state.gameResult.text}</span>
                <div className={`points ${state.gameResult.won ? 'game-won' : 'game-lost'}`}>
                  <p data-testid="base-points">Base points: {state.difficulty.points}</p>
                  <p data-testid="time-points">
                    Time points: {state.gameResult.won ? calculateTimePoints(state.gameTimer) : 0}
                  </p>
                  <p>+1 point for each remaining Happiness!</p>
                </div>
              </section>
              <footer className="mdc-dialog__footer">
                <PdButton
                  data-testid="game-over-button"
                  label={state.gameResult.buttonLabel}
                  primary
                  className="mdc-dialog__footer__button--accept"
                  onClick={closeGameOver}
                />
              </footer>
            </div>
            <div className="mdc-dialog__backdrop" onClick={closeGameOver} />
          </aside>
        )}

        {/* Rules Modal */}
        <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />

        {/* Audio elements */}
        <audio ref={timerBeepRef} preload="auto">
          <source src="/assets/sound/cling_2.mp3" type="audio/mpeg" />
          <source src="/assets/sound/cling_2.ogg" type="audio/ogg" />
          <source src="/assets/sound/cling_2.wav" type="audio/wav" />
        </audio>
        <audio ref={timerBeep2xRef} preload="auto">
          <source src="/assets/sound/cling_2-2x.mp3" type="audio/mpeg" />
          <source src="/assets/sound/cling_2-2x.ogg" type="audio/ogg" />
          <source src="/assets/sound/cling_2-2x.wav" type="audio/wav" />
        </audio>
        <audio ref={timerBeep3xRef} preload="auto">
          <source src="/assets/sound/cling_2-3x.mp3" type="audio/mpeg" />
          <source src="/assets/sound/cling_2-3x.ogg" type="audio/ogg" />
          <source src="/assets/sound/cling_2-3x.wav" type="audio/wav" />
        </audio>
      </main>
      {buildVersion && <span className="app-version">{buildVersion}</span>}
    </div>
  );
}

export default App;
