import { useReducer, useState, useCallback, useEffect, useRef } from 'react';
import { RulesModal } from './components/RulesModal';
import { PdButton } from './components/PdButton';
import { getBuildVersion } from './logic/buildVersion';
import {
  createInitialState,
  isFeedingAllowed,
  isGeneralClueAllowed,
  isSpecificClueAllowed,
  calculateTimePoints,
} from './logic/gameState';
import {
  gameReducer,
  GameAction,
  SoundEffect,
  ReducerResult,
} from './logic/gameReducer';
import { loadSoundEnabled, saveSoundEnabled } from './logic/soundSettings';
import { DifficultyConfig, EASY, MEDIUM, HARD } from './logic/difficulty';
import './App.css';

// Wrap the pure reducer for React. Stores { state, effects }; effects are
// flushed to the audio layer by a useEffect below (default rng in the app).
function appReducer(prev: ReducerResult, action: GameAction): ReducerResult {
  return gameReducer(prev.state, action);
}

function App() {
  const [{ state, effects }, dispatch] = useReducer(
    appReducer,
    EASY,
    (difficulty: DifficultyConfig): ReducerResult => ({
      state: createInitialState(difficulty),
      effects: [],
    }),
  );

  // Hydrate the persisted sound setting before first paint to avoid a flash
  // of the wrong toggle state when it was previously disabled.
  const [soundEnabled, setSoundEnabled] = useState(() => loadSoundEnabled() ?? true);
  const [rulesOpen, setRulesOpen] = useState(false);

  // Audio refs
  const timerBeepRef = useRef<HTMLAudioElement>(null);
  const timerBeep2xRef = useRef<HTMLAudioElement>(null);
  const timerBeep3xRef = useRef<HTMLAudioElement>(null);

  // Map a sound intent to its audio element and play it.
  const playSound = useCallback((effect: SoundEffect) => {
    const ref =
      effect === 'beep1x'
        ? timerBeepRef
        : effect === 'beep2x'
          ? timerBeep2xRef
          : timerBeep3xRef;
    ref.current?.play().catch(() => {});
  }, []);

  // Flush the reducer's sound effects, gated on the soundEnabled setting.
  // Read the setting through a ref so toggling sound doesn't replay old effects.
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  useEffect(() => {
    if (!soundEnabledRef.current) return;
    effects.forEach(playSound);
  }, [effects, playSound]);

  // Persist + confirm-beep on toggle. The state write uses a functional
  // updater so it stays idempotent even under synchronous double-invocation;
  // side effects live outside the updater so they run once (not twice under
  // StrictMode's double-invoke) and read the current value via the ref.
  const toggleSound = useCallback(() => {
    const newValue = !soundEnabledRef.current;
    setSoundEnabled((prev) => !prev);
    saveSoundEnabled(newValue);
    if (newValue) {
      timerBeepRef.current?.play().catch(() => {});
    }
  }, []);

  // Action dispatchers (names preserved so the JSX below is unchanged).
  const setDifficulty = useCallback(
    (difficulty: DifficultyConfig) => dispatch({ type: 'SET_DIFFICULTY', difficulty }),
    [],
  );
  const playOrPause = useCallback(
    () => dispatch({ type: state.isRunning ? 'PAUSE' : 'START' }),
    [state.isRunning],
  );
  const resetGame = useCallback(() => dispatch({ type: 'RESET' }), []);
  const feed = useCallback(() => dispatch({ type: 'FEED' }), []);
  const logSuccess = useCallback(() => dispatch({ type: 'LOG_SUCCESS' }), []);
  const useGeneralClue = useCallback(() => dispatch({ type: 'USE_GENERAL_CLUE' }), []);
  const useSpecificClue = useCallback(() => dispatch({ type: 'USE_SPECIFIC_CLUE' }), []);
  const closeGameOver = resetGame;

  // Close the game-over dialog on Escape.
  useEffect(() => {
    if (!state.gameResult) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'RESET' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.gameResult]);

  // Game tick: dispatch TICK once per second while running.
  useEffect(() => {
    if (!state.isRunning) return;

    const id = window.setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.isRunning]);

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
      {buildVersion && (
        <span className="app-version" aria-hidden="true">
          {buildVersion}
        </span>
      )}
    </div>
  );
}

export default App;
