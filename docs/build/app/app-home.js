/*! Built with http://stenciljs.com */
const { h } = window.App;

import { a as MDCDialogFoundation, b as MDCDialog } from './chunk-d3ec1289.js';

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
    text: "Congratulations on successfully helping your Dragon find a happy life!",
};
const LOST = {
    buttonLabel: "Try again!",
    heading: "Oh noes!",
    text: "Unfortunately, you didn't do so well this time…",
};
const GENERIC_CLUE_COST = 1;
const SPECIFIC_CLUE_COST = 2;
const CAN_FEED_WHEN_FEEDTIMER_IS_BELOW = 30;
class AppHome {
    constructor() {
        this.feedingClass = "";
        this.generalCluesDisabled = true;
        this.resultButtonLabel = "";
        this.resultHeading = "";
        this.resultText = "";
        this.specificCluesDisabled = true;
        this.clueTimer = 0;
        this.feedTimer = 0;
        this.gameTimer = 0;
        this.goalNumberOfSuccesses = 0;
        this.initialFeedTimer = 2;
        this.initialGameTimer = 0;
        this.initialNumberOfClues = 3;
        this.isRunning = false;
        this.remainingClues = 0;
        this.successesUntilVictory = 0;
    }
    componentDidLoad() {
        this.setDifficulty(EASY);
        this.dialog = new MDCDialog(document.querySelector("#game-over-dialog"));
        this.dialog.listen("MDCDialog:accept", () => {
            this.resetGame();
        });
        this.dialog.listen("MDCDialog:cancel", () => {
            this.resetGame();
        });
    }
    render() {
        return (h("section", { class: "app-home" },
            h("section", { class: "difficulty-controls" },
                h("button", { class: "mdc-button", onClick: this.setDifficulty.bind(this, EASY), disabled: this.isRunning }, "Easy"),
                h("button", { class: "mdc-button", onClick: this.setDifficulty.bind(this, MEDIUM), disabled: this.isRunning }, "Medium"),
                h("button", { class: "mdc-button", onClick: this.setDifficulty.bind(this, HARD), disabled: this.isRunning }, "Hard")),
            h("section", { class: "game-controls" },
                h("button", { class: "mdc-button mdc-button--raised", onClick: this.playOrPause.bind(this) }, this.isRunning ? "Pause" : "Start"),
                h("button", { class: "mdc-button", onClick: this.resetGame.bind(this), disabled: this.isRunning }, "Reset")),
            h("p", null,
                "Game time left: ",
                h("b", null, this.gameTimer)),
            h("p", { class: this.isFeedingAllowed() ? "warning" : "" },
                "Feeder time left: ",
                h("b", null, this.feedTimer)),
            h("p", null,
                h("button", { class: "mdc-button mdc-button--raised", onClick: this.feed.bind(this), disabled: !this.isFeedingAllowed() }, "Feed!")),
            h("p", null,
                "Number of successes left:",
                " ",
                h("b", null, this.successesUntilVictory)),
            h("p", null,
                h("button", { class: "mdc-button mdc-button--raised", onClick: this.logSuccess.bind(this), disabled: !this.isRunning }, "Log success")),
            h("section", null,
                h("p", null,
                    "Remaining clues: ",
                    h("b", null, this.remainingClues)),
                h("p", null,
                    h("button", { class: "mdc-button mdc-button--raised", onClick: this.useGeneralClue.bind(this), disabled: !this.isGeneralClueAllowed() }, "Use general clue")),
                h("p", null,
                    h("button", { class: "mdc-button mdc-button--raised", onClick: this.useSpecificClue.bind(this), disabled: !this.isSpecificClueAllowed() }, "Use specific clue"))),
            h("p", null, "Rules version: 0.3"),
            h("aside", { id: "game-over-dialog", class: "mdc-dialog", role: "alertdialog", "aria-labelledby": "my-mdc-dialog-label", "aria-describedby": "my-mdc-dialog-description" },
                h("div", { class: "mdc-dialog__surface" },
                    h("header", { class: "mdc-dialog__header" },
                        h("h2", { class: "mdc-dialog__header__title" }, this.resultHeading)),
                    h("section", { class: "mdc-dialog__body" }, this.resultText),
                    h("footer", { class: "mdc-dialog__footer" },
                        h("button", { type: "button", class: "mdc-button mdc-button--raised mdc-dialog__footer__button mdc-dialog__footer__button--accept" }, this.resultButtonLabel))),
                h("div", { class: "mdc-dialog__backdrop" }))));
    }
    isFeedingAllowed() {
        return (this.isRunning && this.feedTimer <= CAN_FEED_WHEN_FEEDTIMER_IS_BELOW);
    }
    isGeneralClueAllowed() {
        return this.isRunning && this.remainingClues >= GENERIC_CLUE_COST;
    }
    isSpecificClueAllowed() {
        return this.isRunning && this.remainingClues >= SPECIFIC_CLUE_COST;
    }
    resetGame() {
        clearInterval(this.intervalHandle);
        this.isRunning = false;
        this.gameTimer = this.initialGameTimer * MINUTES;
        this.feedTimer = this.initialFeedTimer * MINUTES;
        this.successesUntilVictory = this.goalNumberOfSuccesses;
        this.remainingClues = this.initialNumberOfClues;
    }
    setDifficulty(config) {
        this.initialGameTimer = config.initialGameTimer;
        this.goalNumberOfSuccesses = config.goalNumberOfSuccesses;
        this.resetGame();
    }
    startGame() {
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
    pauseGame() {
        clearInterval(this.intervalHandle);
        this.isRunning = false;
    }
    playOrPause() {
        if (this.isRunning) {
            this.pauseGame();
        }
        else {
            this.startGame();
        }
    }
    feed() {
        this.feedTimer = this.initialFeedTimer - this.feedTimer;
    }
    logSuccess() {
        this.successesUntilVictory -= 1;
        if (this.successesUntilVictory < 1) {
            clearInterval(this.intervalHandle);
            this.isRunning = false;
            this.gameOver(WON);
        }
    }
    useGeneralClue() {
        this.remainingClues -= GENERIC_CLUE_COST;
    }
    useSpecificClue() {
        this.remainingClues -= SPECIFIC_CLUE_COST;
    }
    setClueTimer() {
        const minClueTime = 15;
        const maxClueTime = 20;
        this.clueTimer = Math.round(Math.random() * (maxClueTime - minClueTime) + minClueTime);
    }
    gameOver(result) {
        this.resultHeading = result.heading;
        this.resultText = result.text;
        this.resultButtonLabel = result.buttonLabel;
        this.dialog.show();
    }
    static get is() { return "app-home"; }
    static get properties() { return {
        "clueTimer": {
            "state": true
        },
        "dialog": {
            "state": true
        },
        "feedingClass": {
            "state": true
        },
        "feedTimer": {
            "state": true
        },
        "gameTimer": {
            "state": true
        },
        "generalCluesDisabled": {
            "state": true
        },
        "goalNumberOfSuccesses": {
            "state": true
        },
        "htmlElement": {
            "elementRef": true
        },
        "initialFeedTimer": {
            "state": true
        },
        "initialGameTimer": {
            "state": true
        },
        "initialNumberOfClues": {
            "state": true
        },
        "intervalHandle": {
            "state": true
        },
        "isFeedingAllowed": {
            "method": true
        },
        "isGeneralClueAllowed": {
            "method": true
        },
        "isRunning": {
            "state": true
        },
        "isSpecificClueAllowed": {
            "method": true
        },
        "remainingClues": {
            "state": true
        },
        "resultButtonLabel": {
            "state": true
        },
        "resultHeading": {
            "state": true
        },
        "resultText": {
            "state": true
        },
        "specificCluesDisabled": {
            "state": true
        },
        "successesUntilVictory": {
            "state": true
        }
    }; }
    static get style() { return "\@-webkit-keyframes mdc-ripple-fg-radius-in {\n  from {\n    -webkit-animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    -webkit-transform: translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1);\n    transform: translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1); }\n  to {\n    -webkit-transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));\n    transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1)); } }\n\n\@keyframes mdc-ripple-fg-radius-in {\n  from {\n    -webkit-animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    -webkit-transform: translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1);\n    transform: translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1); }\n  to {\n    -webkit-transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));\n    transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1)); } }\n\n\@-webkit-keyframes mdc-ripple-fg-opacity-in {\n  from {\n    -webkit-animation-timing-function: linear;\n    animation-timing-function: linear;\n    opacity: 0; }\n  to {\n    opacity: var(--mdc-ripple-fg-opacity, 0); } }\n\n\@keyframes mdc-ripple-fg-opacity-in {\n  from {\n    -webkit-animation-timing-function: linear;\n    animation-timing-function: linear;\n    opacity: 0; }\n  to {\n    opacity: var(--mdc-ripple-fg-opacity, 0); } }\n\n\@-webkit-keyframes mdc-ripple-fg-opacity-out {\n  from {\n    -webkit-animation-timing-function: linear;\n    animation-timing-function: linear;\n    opacity: var(--mdc-ripple-fg-opacity, 0); }\n  to {\n    opacity: 0; } }\n\n\@keyframes mdc-ripple-fg-opacity-out {\n  from {\n    -webkit-animation-timing-function: linear;\n    animation-timing-function: linear;\n    opacity: var(--mdc-ripple-fg-opacity, 0); }\n  to {\n    opacity: 0; } }\n\n.mdc-ripple-surface--test-edge-var-bug {\n  --mdc-ripple-surface-test-edge-var: 1px solid #000;\n  visibility: hidden; }\n  .mdc-ripple-surface--test-edge-var-bug::before {\n    border: var(--mdc-ripple-surface-test-edge-var); }\n\n.mdc-button {\n  font-family: Roboto, sans-serif;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  font-size: 0.875rem;\n  line-height: 2.25rem;\n  font-weight: 500;\n  letter-spacing: 0.08929em;\n  text-decoration: none;\n  text-transform: uppercase;\n  --mdc-ripple-fg-size: 0;\n  --mdc-ripple-left: 0;\n  --mdc-ripple-top: 0;\n  --mdc-ripple-fg-scale: 1;\n  --mdc-ripple-fg-translate-end: 0;\n  --mdc-ripple-fg-translate-start: 0;\n  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n  will-change: transform, opacity;\n  padding: 0 8px 0 8px;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  position: relative;\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  min-width: 64px;\n  height: 36px;\n  border: none;\n  outline: none;\n  /* \@alternate */\n  line-height: inherit;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  -webkit-appearance: none;\n  overflow: hidden;\n  vertical-align: middle;\n  border-radius: 2px; }\n  .mdc-button::before, .mdc-button::after {\n    position: absolute;\n    border-radius: 50%;\n    opacity: 0;\n    pointer-events: none;\n    content: \"\"; }\n  .mdc-button::before {\n    -webkit-transition: opacity 15ms linear;\n    transition: opacity 15ms linear;\n    z-index: 1; }\n  .mdc-button.mdc-ripple-upgraded::before {\n    -webkit-transform: scale(var(--mdc-ripple-fg-scale, 1));\n    transform: scale(var(--mdc-ripple-fg-scale, 1)); }\n  .mdc-button.mdc-ripple-upgraded::after {\n    top: 0;\n    /* \@noflip */\n    left: 0;\n    -webkit-transform: scale(0);\n    transform: scale(0);\n    -webkit-transform-origin: center center;\n    transform-origin: center center; }\n  .mdc-button.mdc-ripple-upgraded--unbounded::after {\n    top: var(--mdc-ripple-top, 0);\n    /* \@noflip */\n    left: var(--mdc-ripple-left, 0); }\n  .mdc-button.mdc-ripple-upgraded--foreground-activation::after {\n    -webkit-animation: 225ms mdc-ripple-fg-radius-in forwards, 75ms mdc-ripple-fg-opacity-in forwards;\n    animation: 225ms mdc-ripple-fg-radius-in forwards, 75ms mdc-ripple-fg-opacity-in forwards; }\n  .mdc-button.mdc-ripple-upgraded--foreground-deactivation::after {\n    -webkit-animation: 150ms mdc-ripple-fg-opacity-out;\n    animation: 150ms mdc-ripple-fg-opacity-out;\n    -webkit-transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));\n    transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1)); }\n  .mdc-button::before, .mdc-button::after {\n    top: calc(50% - 100%);\n    /* \@noflip */\n    left: calc(50% - 100%);\n    width: 200%;\n    height: 200%; }\n  .mdc-button.mdc-ripple-upgraded::after {\n    width: var(--mdc-ripple-fg-size, 100%);\n    height: var(--mdc-ripple-fg-size, 100%); }\n  .mdc-button::-moz-focus-inner {\n    padding: 0;\n    border: 0; }\n  .mdc-button:active {\n    outline: none; }\n  .mdc-button:hover {\n    cursor: pointer; }\n  .mdc-button:disabled {\n    background-color: transparent;\n    color: rgba(0, 0, 0, 0.37);\n    cursor: default;\n    pointer-events: none; }\n  .mdc-button:not(:disabled) {\n    background-color: transparent; }\n  .mdc-button:not(:disabled) {\n    color: #6200ee;\n    /* \@alternate */\n    color: var(--mdc-theme-primary, #6200ee); }\n  .mdc-button::before, .mdc-button::after {\n    background-color: #6200ee; }\n    \@supports not (-ms-ime-align: auto) {\n      .mdc-button::before, .mdc-button::after {\n        /* \@alternate */\n        background-color: var(--mdc-theme-primary, #6200ee); } }\n  .mdc-button:hover::before {\n    opacity: 0.04; }\n  .mdc-button:not(.mdc-ripple-upgraded):focus::before, .mdc-button.mdc-ripple-upgraded--background-focused::before {\n    -webkit-transition-duration: 75ms;\n    transition-duration: 75ms;\n    opacity: 0.12; }\n  .mdc-button:not(.mdc-ripple-upgraded)::after {\n    -webkit-transition: opacity 150ms linear;\n    transition: opacity 150ms linear; }\n  .mdc-button:not(.mdc-ripple-upgraded):active::after {\n    -webkit-transition-duration: 75ms;\n    transition-duration: 75ms;\n    opacity: 0.16; }\n  .mdc-button.mdc-ripple-upgraded {\n    --mdc-ripple-fg-opacity: 0.16; }\n  .mdc-button .mdc-button__icon {\n    /* \@noflip */\n    margin-left: 0;\n    /* \@noflip */\n    margin-right: 8px;\n    display: inline-block;\n    width: 18px;\n    height: 18px;\n    font-size: 18px;\n    vertical-align: top; }\n    [dir=\"rtl\"] .mdc-button .mdc-button__icon, .mdc-button .mdc-button__icon[dir=\"rtl\"] {\n      /* \@noflip */\n      margin-left: 8px;\n      /* \@noflip */\n      margin-right: 0; }\n  .mdc-button svg.mdc-button__icon {\n    fill: currentColor; }\n\n.mdc-button--raised .mdc-button__icon,\n.mdc-button--unelevated .mdc-button__icon,\n.mdc-button--outlined .mdc-button__icon {\n  /* \@noflip */\n  margin-left: -4px;\n  /* \@noflip */\n  margin-right: 8px; }\n  [dir=\"rtl\"] .mdc-button--raised .mdc-button__icon, .mdc-button--raised .mdc-button__icon[dir=\"rtl\"], [dir=\"rtl\"]\n  .mdc-button--unelevated .mdc-button__icon,\n  .mdc-button--unelevated .mdc-button__icon[dir=\"rtl\"], [dir=\"rtl\"]\n  .mdc-button--outlined .mdc-button__icon,\n  .mdc-button--outlined .mdc-button__icon[dir=\"rtl\"] {\n    /* \@noflip */\n    margin-left: 8px;\n    /* \@noflip */\n    margin-right: -4px; }\n\n.mdc-button--raised,\n.mdc-button--unelevated {\n  padding: 0 16px 0 16px; }\n  .mdc-button--raised:disabled,\n  .mdc-button--unelevated:disabled {\n    background-color: rgba(0, 0, 0, 0.12);\n    color: rgba(0, 0, 0, 0.37); }\n  .mdc-button--raised:not(:disabled),\n  .mdc-button--unelevated:not(:disabled) {\n    background-color: #6200ee; }\n    \@supports not (-ms-ime-align: auto) {\n      .mdc-button--raised:not(:disabled),\n      .mdc-button--unelevated:not(:disabled) {\n        /* \@alternate */\n        background-color: var(--mdc-theme-primary, #6200ee); } }\n  .mdc-button--raised:not(:disabled),\n  .mdc-button--unelevated:not(:disabled) {\n    color: #fff;\n    /* \@alternate */\n    color: var(--mdc-theme-on-primary, #fff); }\n  .mdc-button--raised::before, .mdc-button--raised::after,\n  .mdc-button--unelevated::before,\n  .mdc-button--unelevated::after {\n    background-color: #fff; }\n    \@supports not (-ms-ime-align: auto) {\n      .mdc-button--raised::before, .mdc-button--raised::after,\n      .mdc-button--unelevated::before,\n      .mdc-button--unelevated::after {\n        /* \@alternate */\n        background-color: var(--mdc-theme-on-primary, #fff); } }\n  .mdc-button--raised:hover::before,\n  .mdc-button--unelevated:hover::before {\n    opacity: 0.08; }\n  .mdc-button--raised:not(.mdc-ripple-upgraded):focus::before, .mdc-button--raised.mdc-ripple-upgraded--background-focused::before,\n  .mdc-button--unelevated:not(.mdc-ripple-upgraded):focus::before,\n  .mdc-button--unelevated.mdc-ripple-upgraded--background-focused::before {\n    -webkit-transition-duration: 75ms;\n    transition-duration: 75ms;\n    opacity: 0.24; }\n  .mdc-button--raised:not(.mdc-ripple-upgraded)::after,\n  .mdc-button--unelevated:not(.mdc-ripple-upgraded)::after {\n    -webkit-transition: opacity 150ms linear;\n    transition: opacity 150ms linear; }\n  .mdc-button--raised:not(.mdc-ripple-upgraded):active::after,\n  .mdc-button--unelevated:not(.mdc-ripple-upgraded):active::after {\n    -webkit-transition-duration: 75ms;\n    transition-duration: 75ms;\n    opacity: 0.32; }\n  .mdc-button--raised.mdc-ripple-upgraded,\n  .mdc-button--unelevated.mdc-ripple-upgraded {\n    --mdc-ripple-fg-opacity: 0.32; }\n\n.mdc-button--raised {\n  -webkit-box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);\n  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);\n  -webkit-transition: -webkit-box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);\n  transition: -webkit-box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);\n  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);\n  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1), -webkit-box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1); }\n  .mdc-button--raised:hover, .mdc-button--raised:focus {\n    -webkit-box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);\n    box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12); }\n  .mdc-button--raised:active {\n    -webkit-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);\n    box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12); }\n  .mdc-button--raised:disabled {\n    -webkit-box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12);\n    box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12); }\n\n.mdc-button--outlined {\n  border-style: solid;\n  padding: 0 14px 0 14px;\n  border-width: 2px;\n  line-height: 32px; }\n  .mdc-button--outlined:disabled {\n    border-color: rgba(0, 0, 0, 0.37); }\n  .mdc-button--outlined.mdc-button--dense {\n    line-height: 27px; }\n  .mdc-button--outlined:not(:disabled) {\n    border-color: #6200ee;\n    /* \@alternate */\n    border-color: var(--mdc-theme-primary, #6200ee); }\n\n.mdc-button--dense {\n  height: 32px;\n  font-size: .8125rem;\n  line-height: 32px; }\n\n.mdc-dialog {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  position: fixed;\n  top: 0;\n  left: 0;\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n  visibility: hidden;\n  z-index: 5; }\n\n.mdc-dialog__backdrop {\n  background-color: rgba(0, 0, 0, 0.87);\n  /* \@alternate */\n  background-color: var(--mdc-theme-text-primary-on-light, rgba(0, 0, 0, 0.87));\n  position: fixed;\n  top: 0;\n  left: 0;\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n  opacity: 0;\n  z-index: -1; }\n\n.mdc-dialog__surface {\n  -webkit-box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12);\n  box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12);\n  background-color: #fff;\n  /* \@alternate */\n  background-color: var(--mdc-theme-background, #fff);\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  width: calc(100% - 30px);\n  min-width: 640px;\n  max-width: 865px;\n  -webkit-transform: translateY(150px) scale(0.8);\n  transform: translateY(150px) scale(0.8);\n  border-radius: 2px;\n  opacity: 0; }\n  .mdc-dialog[dir=\"rtl\"] .mdc-dialog__surface,\n  [dir=\"rtl\"] .mdc-dialog .mdc-dialog__surface {\n    text-align: right; }\n\n.mdc-dialog__header {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  padding: 24px 24px 0; }\n  .mdc-dialog[dir=\"rtl\"] .mdc-dialog__header,\n  [dir=\"rtl\"] .mdc-dialog .mdc-dialog__header {\n    text-align: right; }\n\n.mdc-dialog__header__empty {\n  padding: 0; }\n\n.mdc-dialog__header__title {\n  font-family: Roboto, sans-serif;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  font-size: 1.25rem;\n  line-height: 2rem;\n  font-weight: 500;\n  letter-spacing: 0.0125em;\n  text-decoration: inherit;\n  text-transform: inherit;\n  -webkit-box-flex: 1;\n  -ms-flex: 1;\n  flex: 1;\n  margin: 0; }\n\n.mdc-dialog__body {\n  color: rgba(0, 0, 0, 0.54);\n  /* \@alternate */\n  color: var(--mdc-theme-text-secondary-on-light, rgba(0, 0, 0, 0.54));\n  font-family: Roboto, sans-serif;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  font-size: 1rem;\n  line-height: 1.5rem;\n  font-weight: 400;\n  letter-spacing: 0.03125em;\n  text-decoration: inherit;\n  text-transform: inherit;\n  margin-top: 20px;\n  padding: 0 24px 24px; }\n\n.mdc-dialog__body--scrollable {\n  max-height: 195px;\n  border-top: 1px solid rgba(0, 0, 0, 0.1);\n  border-bottom: 1px solid rgba(0, 0, 0, 0.1);\n  overflow-x: auto;\n  overflow-y: scroll;\n  -webkit-overflow-scrolling: touch; }\n\n.mdc-dialog__footer {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  -webkit-box-pack: end;\n  -ms-flex-pack: end;\n  justify-content: flex-end;\n  padding: 8px; }\n\n.mdc-dialog__footer__button {\n  /* \@noflip */\n  margin-left: 0;\n  /* \@noflip */\n  margin-right: 8px; }\n  [dir=\"rtl\"] .mdc-dialog__footer__button, .mdc-dialog__footer__button[dir=\"rtl\"] {\n    /* \@noflip */\n    margin-left: 8px;\n    /* \@noflip */\n    margin-right: 0; }\n  .mdc-dialog__footer__button:last-child {\n    /* \@noflip */\n    margin-left: 0;\n    /* \@noflip */\n    margin-right: 0; }\n    [dir=\"rtl\"] .mdc-dialog__footer__button:last-child, .mdc-dialog__footer__button:last-child[dir=\"rtl\"] {\n      /* \@noflip */\n      margin-left: 0;\n      /* \@noflip */\n      margin-right: 0; }\n\n.mdc-dialog__action:not(:disabled) {\n  color: #018786;\n  /* \@alternate */\n  color: var(--mdc-theme-secondary, #018786); }\n\n\@media (max-width: 640px) {\n  .mdc-dialog {\n    min-width: 280px; }\n  .mdc-dialog__surface {\n    min-width: 280px; }\n  .mdc-dialog__body {\n    line-height: 24px; } }\n\n.mdc-dialog--animating {\n  visibility: visible; }\n  .mdc-dialog--animating .mdc-dialog__backdrop {\n    -webkit-transition: opacity 120ms 0ms cubic-bezier(0, 0, 0.2, 1);\n    transition: opacity 120ms 0ms cubic-bezier(0, 0, 0.2, 1); }\n  .mdc-dialog--animating .mdc-dialog__surface {\n    -webkit-transition: opacity 120ms 0ms cubic-bezier(0, 0, 0.2, 1), -webkit-transform 120ms 0ms cubic-bezier(0, 0, 0.2, 1);\n    transition: opacity 120ms 0ms cubic-bezier(0, 0, 0.2, 1), -webkit-transform 120ms 0ms cubic-bezier(0, 0, 0.2, 1);\n    transition: opacity 120ms 0ms cubic-bezier(0, 0, 0.2, 1), transform 120ms 0ms cubic-bezier(0, 0, 0.2, 1);\n    transition: opacity 120ms 0ms cubic-bezier(0, 0, 0.2, 1), transform 120ms 0ms cubic-bezier(0, 0, 0.2, 1), -webkit-transform 120ms 0ms cubic-bezier(0, 0, 0.2, 1); }\n\n.mdc-dialog--open {\n  visibility: visible; }\n  .mdc-dialog--open .mdc-dialog__backdrop {\n    opacity: .3; }\n  .mdc-dialog--open .mdc-dialog__surface {\n    -webkit-transform: translateY(0) scale(1);\n    transform: translateY(0) scale(1);\n    opacity: 1; }\n\n.mdc-dialog-scroll-lock {\n  overflow: hidden; }\n\n.app-home {\n  padding-bottom: 10px;\n  padding-left: 10px;\n  padding-right: 10px;\n  padding-top: 66px; }\n\n.warning {\n  color: red; }\n\n.difficulty-controls,\n.game-controls {\n  margin-top: 1em;\n  margin-bottom: 1em; }"; }
}

export { AppHome };
