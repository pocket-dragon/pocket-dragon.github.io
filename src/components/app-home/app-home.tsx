import { Component, Element, State } from '@stencil/core';
import { dialog } from 'material-components-web';

const MINUTES = 60;

const EASY = {
    goalNumberOfSuccesses: 3,
    initialFeedTimer: 2,
    initialGameTimer: 5,
    name: 'easy',
};

const MEDIUM = {
    goalNumberOfSuccesses: 5,
    initialFeedTimer: 2,
    initialGameTimer: 6,
    name: 'medium',
};

const HARD = {
    goalNumberOfSuccesses: 7,
    initialFeedTimer: 2,
    initialGameTimer: 7,
    name: 'hard',
};

const WON = {
    buttonLabel: 'Yay!',
    heading: 'You Won!',
    text:
        'Congratulations on successfully helping your Dragon find a happy life!',
};

const LOST = {
    buttonLabel: 'Try again!',
    heading: 'Oh noes!',
    text: "Unfortunately, you didn't do so well this time…",
};

const GENERIC_CLUE_COST = 1;
const SPECIFIC_CLUE_COST = 2;

const CAN_FEED_WHEN_FEEDTIMER_IS_BELOW = 30;

@Component({
    styleUrl: 'app-home.scss',
    tag: 'app-home',
})
export class AppHome {
    @Element() public htmlElement: HTMLElement;

    @State() protected feedingClass = '';
    @State() protected generalCluesDisabled = true;
    @State() protected resultButtonLabel = '';
    @State() protected resultHeading = '';
    @State() protected resultText = '';
    @State() protected specificCluesDisabled = true;
    @State() protected difficultyLevel = '';
    @State() private clueTimer = 0;
    @State() private dialog;
    @State() private feedTimer = 0;
    @State() private gameTimer = 0;
    @State() private goalNumberOfSuccesses = 0;
    @State() private initialFeedTimer = 0;
    @State() private initialGameTimer = 0;
    @State() private initialNumberOfClues = 3;
    @State() private intervalHandle;
    @State() private isRunning = false;
    @State() private remainingClues = 0;
    @State() private successesUntilVictory = 0;

    protected componentDidLoad() {
        this.setDifficulty(EASY);
        this.dialog = new dialog.MDCDialog(
            document.querySelector('#game-over-dialog')
        );
        this.dialog.listen('MDCDialog:accept', () => {
            this.resetGame();
        });
        this.dialog.listen('MDCDialog:cancel', () => {
            this.resetGame();
        });
    }

    protected render() {
        return (
            <section class="app-home">
                <section class="difficulty-controls">
                    <pd-button
                        label="Easy"
                        onClick={this.setDifficulty.bind(this, EASY)}
                        disabled={this.isRunning}
                        selected={this.difficultyLevel === 'easy'}
                    />
                    <pd-button
                        label="Medium"
                        onClick={this.setDifficulty.bind(this, MEDIUM)}
                        disabled={this.isRunning}
                        selected={this.difficultyLevel === 'medium'}
                    />
                    <pd-button
                        label="Hard"
                        onClick={this.setDifficulty.bind(this, HARD)}
                        disabled={this.isRunning}
                        selected={this.difficultyLevel === 'hard'}
                    />
                </section>
                <section class="game-controls">
                    <pd-button
                        label={this.isRunning ? 'Pause' : 'Start'}
                        onClick={this.playOrPause.bind(this)}
                        primary={true}
                    />
                    <pd-button
                        label="Reset"
                        onClick={this.resetGame.bind(this)}
                        disabled={this.isRunning}
                    />
                </section>
                <p>
                    Game time left: <b>{this.gameTimer}</b>
                </p>
                <p class={this.isFeedingAllowed() ? 'warning' : ''}>
                    Feeder time left: <b>{this.feedTimer}</b>
                </p>
                <p>
                    <pd-button
                        label="Feed!"
                        onClick={this.feed.bind(this)}
                        disabled={!this.isFeedingAllowed()}
                        primary={true}
                    />
                </p>
                <p>
                    Number of successes left:{' '}
                    <b>{this.successesUntilVictory}</b>
                </p>
                <p>
                    <pd-button
                        label="Log success"
                        onClick={this.logSuccess.bind(this)}
                        disabled={!this.isRunning}
                        primary={true}
                    />
                </p>
                <section>
                    <p>
                        Remaining clues: <b>{this.remainingClues}</b>
                    </p>
                    <p>
                        <pd-button
                            label="Use general clue"
                            onClick={this.useGeneralClue.bind(this)}
                            disabled={!this.isGeneralClueAllowed()}
                            primary={true}
                        />
                    </p>
                    <p>
                        <pd-button
                            label="Use specific clue"
                            onClick={this.useSpecificClue.bind(this)}
                            disabled={!this.isSpecificClueAllowed()}
                            primary={true}
                        />
                    </p>
                </section>

                <p>Rules version: 0.3</p>

                <aside
                    id="game-over-dialog"
                    class="mdc-dialog"
                    role="alertdialog"
                    aria-labelledby="my-mdc-dialog-label"
                    aria-describedby="my-mdc-dialog-description"
                >
                    <div class="mdc-dialog__surface">
                        <header class="mdc-dialog__header">
                            <h2 class="mdc-dialog__header__title">
                                {this.resultHeading}
                            </h2>
                        </header>
                        <section class="mdc-dialog__body">
                            {this.resultText}
                        </section>
                        <footer class="mdc-dialog__footer">
                            <pd-button
                                label={this.resultButtonLabel}
                                primary={true}
                                onClick={this.closeDialog.bind(this)}
                            />
                        </footer>
                    </div>
                    <div class="mdc-dialog__backdrop" />
                </aside>
            </section>
        );
    }

    private isFeedingAllowed() {
        return (
            this.isRunning && this.feedTimer <= CAN_FEED_WHEN_FEEDTIMER_IS_BELOW
        );
    }

    private isGeneralClueAllowed() {
        return this.isRunning && this.remainingClues >= GENERIC_CLUE_COST;
    }

    private isSpecificClueAllowed() {
        return this.isRunning && this.remainingClues >= SPECIFIC_CLUE_COST;
    }

    private resetGame() {
        clearInterval(this.intervalHandle);
        this.isRunning = false;
        this.gameTimer = this.initialGameTimer;
        this.feedTimer = this.initialFeedTimer;
        this.successesUntilVictory = this.goalNumberOfSuccesses;
        this.remainingClues = this.initialNumberOfClues;
    }

    private setDifficulty(config) {
        this.initialFeedTimer = config.initialFeedTimer * MINUTES;
        this.initialGameTimer = config.initialGameTimer * MINUTES;
        this.goalNumberOfSuccesses = config.goalNumberOfSuccesses;
        this.difficultyLevel = config.name;
        this.resetGame();
    }

    private startGame() {
        this.isRunning = true;
        if (this.clueTimer < 1) {
            this.setClueTimer();
        }
        const ONE_SECOND = 1000;
        this.intervalHandle = setInterval(() => {
            this.gameTimer -= 1;
            this.feedTimer -= 1;
            this.clueTimer -= 1;
            if (this.clueTimer < 1) {
                this.remainingClues += 1;
                this.setClueTimer();
            }
            if (this.feedTimer < 1 || this.gameTimer < 1) {
                this.isRunning = false;
                clearInterval(this.intervalHandle);
                this.gameOver(LOST);
            }
        }, ONE_SECOND);
    }

    private pauseGame() {
        clearInterval(this.intervalHandle);
        this.isRunning = false;
    }

    private playOrPause() {
        if (this.isRunning) {
            this.pauseGame();
        } else {
            this.startGame();
        }
    }

    private feed() {
        this.feedTimer = this.initialFeedTimer - this.feedTimer;
    }

    private logSuccess() {
        this.successesUntilVictory -= 1;
        if (this.successesUntilVictory < 1) {
            clearInterval(this.intervalHandle);
            this.isRunning = false;
            this.gameOver(WON);
        }
    }

    private useGeneralClue() {
        this.remainingClues -= GENERIC_CLUE_COST;
    }

    private useSpecificClue() {
        this.remainingClues -= SPECIFIC_CLUE_COST;
    }

    private setClueTimer() {
        const minClueTime = 15;
        const maxClueTime = 20;
        this.clueTimer = Math.round(
            Math.random() * (maxClueTime - minClueTime) + minClueTime
        );
    }

    private gameOver(result) {
        this.resultHeading = result.heading;
        this.resultText = result.text;
        this.resultButtonLabel = result.buttonLabel;
        this.resetGame();
        this.dialog.show();
    }

    private closeDialog() {
        this.dialog.close();
    }
}
