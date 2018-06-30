import { Component, Element, Method, State } from "@stencil/core";
import { dialog } from "material-components-web";

const MINUTES = 60;

const EASY = {
    goalNumberOfSuccesses: 3,
    initialGameTimer: 5,
};

const MEDIUM = {
    goalNumberOfSuccesses: 5,
    initialGameTimer: 6,
};

const HARD = {
    goalNumberOfSuccesses: 7,
    initialGameTimer: 7,
};

const WON = {
    buttonLabel: "Yay!",
    heading: "You Won!",
    text:
        "Congratulations on successfully helping your Dragon find a happy life!",
};

const LOST = {
    buttonLabel: "Try again!",
    heading: "Oh noes!",
    text: "Unfortunately, you didn't do so well this time…",
};

const GENERIC_CLUE_COST = 1;
const SPECIFIC_CLUE_COST = 2;

const CAN_FEED_WHEN_FEEDTIMER_IS_BELOW = 30;

@Component({
    styleUrl: "app-home.scss",
    tag: "app-home",
})
export class AppHome {
    @Element() public htmlElement: HTMLElement;

    @State() protected feedingClass = "";
    @State() protected generalCluesDisabled = true;
    @State() protected resultButtonLabel = "";
    @State() protected resultHeading = "";
    @State() protected resultText = "";
    @State() protected specificCluesDisabled = true;
    @State() private clueTimer = 0;
    @State() private dialog;
    @State() private feedTimer = 0;
    @State() private gameTimer = 0;
    @State() private goalNumberOfSuccesses = 0;
    @State() private initialFeedTimer = 2;
    @State() private initialGameTimer = 0;
    @State() private initialNumberOfClues = 3;
    @State() private intervalHandle;
    @State() private isRunning = false;
    @State() private remainingClues = 0;
    @State() private successesUntilVictory = 0;

    protected componentDidLoad() {
        this.setDifficulty(EASY);
        this.dialog = new dialog.MDCDialog(
            document.querySelector("#game-over-dialog")
        );
        this.dialog.listen("MDCDialog:accept", () => {
            this.resetGame();
        });
        this.dialog.listen("MDCDialog:cancel", () => {
            this.resetGame();
        });
    }

    protected render() {
        return (
            <section class="app-home">
                <section class="difficulty-controls">
                    <button
                        class="mdc-button"
                        onClick={this.setDifficulty.bind(this, EASY)}
                        disabled={this.isRunning}
                    >
                        Easy
                    </button>
                    <button
                        class="mdc-button"
                        onClick={this.setDifficulty.bind(this, MEDIUM)}
                        disabled={this.isRunning}
                    >
                        Medium
                    </button>
                    <button
                        class="mdc-button"
                        onClick={this.setDifficulty.bind(this, HARD)}
                        disabled={this.isRunning}
                    >
                        Hard
                    </button>
                </section>
                <section class="game-controls">
                    <button
                        class="mdc-button mdc-button--raised"
                        onClick={this.playOrPause.bind(this)}
                    >
                        {this.isRunning ? "Pause" : "Start"}
                    </button>
                    <button
                        class="mdc-button"
                        onClick={this.resetGame.bind(this)}
                        disabled={this.isRunning}
                    >
                        Reset
                    </button>
                </section>
                <p>
                    Game time left: <b>{this.gameTimer}</b>
                </p>
                <p class={this.isFeedingAllowed() ? "warning" : ""}>
                    Feeder time left: <b>{this.feedTimer}</b>
                </p>
                <p>
                    <button
                        class="mdc-button mdc-button--raised"
                        onClick={this.feed.bind(this)}
                        disabled={!this.isFeedingAllowed()}
                    >
                        Feed!
                    </button>
                </p>
                <p>
                    Number of successes left:{" "}
                    <b>{this.successesUntilVictory}</b>
                </p>
                <p>
                    <button
                        class="mdc-button mdc-button--raised"
                        onClick={this.logSuccess.bind(this)}
                        disabled={!this.isRunning}
                    >
                        Log success
                    </button>
                </p>
                <section>
                    <p>
                        Remaining clues: <b>{this.remainingClues}</b>
                    </p>
                    <p>
                        <button
                            class="mdc-button mdc-button--raised"
                            onClick={this.useGeneralClue.bind(this)}
                            disabled={!this.isGeneralClueAllowed()}
                        >
                            Use general clue
                        </button>
                    </p>
                    <p>
                        <button
                            class="mdc-button mdc-button--raised"
                            onClick={this.useSpecificClue.bind(this)}
                            disabled={!this.isSpecificClueAllowed()}
                        >
                            Use specific clue
                        </button>
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
                            <button
                                type="button"
                                class="mdc-button mdc-button--raised mdc-dialog__footer__button mdc-dialog__footer__button--accept"
                            >
                                {this.resultButtonLabel}
                            </button>
                        </footer>
                    </div>
                    <div class="mdc-dialog__backdrop" />
                </aside>
            </section>
        );
    }

    @Method()
    private isFeedingAllowed() {
        return (
            this.isRunning && this.feedTimer <= CAN_FEED_WHEN_FEEDTIMER_IS_BELOW
        );
    }

    @Method()
    private isGeneralClueAllowed() {
        return this.isRunning && this.remainingClues >= GENERIC_CLUE_COST;
    }

    @Method()
    private isSpecificClueAllowed() {
        return this.isRunning && this.remainingClues >= SPECIFIC_CLUE_COST;
    }

    private resetGame() {
        clearInterval(this.intervalHandle);
        this.isRunning = false;
        this.gameTimer = this.initialGameTimer * MINUTES;
        this.feedTimer = this.initialFeedTimer * MINUTES;
        this.successesUntilVictory = this.goalNumberOfSuccesses;
        this.remainingClues = this.initialNumberOfClues;
    }

    private setDifficulty(config) {
        this.initialGameTimer = config.initialGameTimer;
        this.goalNumberOfSuccesses = config.goalNumberOfSuccesses;
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
        result.heading = "You Won!";
        result.text =
            "Congratulations on successfully helping your Dragon find a happy life!";
        result.buttonLabel = "Yay!";
        this.dialog.show();
    }
}
