import { Component, Element, Method, State } from '@stencil/core';
import { dialog } from 'material-components-web';

@Component({
    tag: 'app-rules',
    styleUrl: 'app-rules.scss',
})
export class AppHome {
    @Element() public htmlElement: HTMLElement;

    @State() private rulesDialog;
    @State() private rules = '';

    @Method()
    public showRules() {
        this.rulesDialog.show();
    }

    public componentWillLoad() {
        this.rules = this.getFormattedRules();
    }

    public componentDidLoad() {
        this.rulesDialog = new dialog.MDCDialog(
            this.htmlElement.querySelector('#rules-dialog')
        );
    }

    public componentDidUnload() {
        this.rulesDialog.destroy();
    }

    public render() {
        return (
            <aside id="rules-dialog" class="mdc-dialog">
                <div class="mdc-dialog__surface">
                    <header class="mdc-dialog__header">
                        <h2 class="mdc-dialog__header__title">Game Rules</h2>
                    </header>
                    <section class="mdc-dialog__body">
                        <div class="dialog-body" innerHTML={this.rules} />
                    </section>
                    <footer class="mdc-dialog__footer">
                        <pd-button
                            class="mdc-dialog__footer__button--accept"
                            label="Close"
                            primary={true}
                        />
                    </footer>
                </div>
                <div class="mdc-dialog__backdrop" />
            </aside>
        );
    }

    private getFormattedRules() {
        const converter = new window['showdown'].Converter(); // tslint:disable-line:no-string-literal
        const rulesText = `
The two of you have chosen to raise this pocket Dragon together. Like every other Dragon, this one has needs. He wants to eat, learn to cook, have some healthy exercise, play board games, make friends, maybe fall in love… Can you be the perfect dragon-parent to him? Remember, always keep him fed!!

## Components

- 14x Activities card
- 20x Collection cards
- 1x Happiness tracker card
- 1x Actions reminder player aid
- 1x Happiness token

## Setup

1. Get your smartphone (or other preferably touchscreen device) that has internet, and go to [https://pocketdragon.co.uk/](http://pocketdragon.co.uk/). Put it on the table between the players, to the side.
2. Select the difficulty of the game (Easy, Medium, or Hard).
3. Place Happiness tracker card to the other side of the play area, and place the Happiness token on it.
    1. If playing Easy: put it on 4.
    2. If playing Medium: put it on 3.
    3. If playing Hard: put it on 3.

4. Shuffle the Collection cards and lay them out face down in a 4 by 5 grid between the players.
5. Shuffle the Activities cards to form a draw deck.
6. Both players draw 3 cards from the deck, and they hold it in a way that the other player can see the cards (especially the icons on the top) but they can’t see their own cards themselves.
7. Make sure you know the rules, as you won’t have time to look them up while the timer goes!
8. Hit START on your smartphone.

## Rules of play

Players take turns alternatingly, as fast as they can. On your turn, you may carry out one of the following actions:

- Look at 2 face down Collection cards in the grid. You may not tell the other player what you saw.
- Ask for a general clue about an icon. Say “Which of my cards have Endurance (grey) icons?”, to which the other player will point at all your cards that have at least one grey icon on. This action is only available if the General Clue button is available in the app. Press the button when taking this action.
- Ask for a specific clue about a card. Say “Name one icon on this card!”, while pointing at one of your cards. To which the other player will answer, for example, “Attention (green)”. They cannot say how many, or what else, and can only name one icon. This action is only available if the Specific Clue button is available in the app. Press the button when taking this action.
- Play an Activity. You pick a card from your hand and put it down on the table (Note: This is the first time you’re seeing that card). You will then see the 2 or 3 skill icons that Activity requires of you.
    - You then have to flip 2 or 3 face down cards from the grid (depending on how many are on the card), matching each of the icons on the played card.
    - Once you successfully flipped all but one (1 of 2 or 2 of 3) of the required icons, you may ask your partner to suggest a card to flip. (As they might know where one of the required icons are.)
    - Once you successfully matched all 3 icons, discard all face up cards from the grid to the collection discard pile, and put the completed Activity to the side. Press the “Log Success” button in the app. If this is the last required Activity (as shown by the app), the Dragon gets very happy, and you have won the game.
    - If you (or your partner) make a mistake, decrease the Dragon’s Happiness by one (on the tracker) and keep trying, discarding the mistaken card.
        - If the mistake was made by your partner, they can keep suggesting other cards to look at.
        - If the Happiness was already on zero, you instead lose the game.

    - After flipping at least 1 card over, you may stop trying at any time and just remove the Activity from play, and discard all revealed collection cards.
    - If you haven’t won or lost the game, draw a new Activity card, and orient it towards your partner (without you looking at it, obviously). If you can’t draw one (because the draw pile is empty), you have lost the game.

- Collect Food. Flip a face down card face up in the grid, and put it in front of you with the Food side up. You may not take this action if you already have 4 food cards in front of you.
    - It is suggested to organize the collected cards by matching food icons.

- Feed the Dragon. This action is only available if the “Feed” button is enabled in the app.
    - Press the “Feed” button to reset the hunger timer.
    - Discard all cards of one type of collected Food cards from in front of you. (For example if you have 2 sushi and 1 hazelnut spread, you may discard either the 2 sushi or the 1 hazelnut spread). The discarded cards go to the collection discard pile.
    - Increase the Dragon’s Happiness by one less than the number of Food discarded. (For example if you’ve discarded 3 steaks, increase the Happiness tracker by 2.)
    - Note: the app will turn the hunger timer red for the last 30 seconds of it. If the timer runs out, you lose the game!

- Tidy Up. You can only take this action if there are 5 or fewer face down cards remaining in the grid.
    - Collect all face down cards from the grid and shuffle them together with the collection discard pile. Note: Do not shuffle collected Food cards back at this time.
    - Quickly lay these cards out in a grid, as close to a 4-by-5 one as possible.
    - Decrease the Dragon’s Happiness by one (he hates tidying up). If the Happiness was already on zero, you instead lose the game.

### Rules of Communication

You may talk with your partner as much as you wish, except:

- You may not divulge which face down card has which icons
- You may not give more information about your partner’s cards other than what the clue-giving action allows. You may however remind your opponent of information they already asked for after giving a new clue (don’t cheat!).
- You may not tell your partner which action they should take, or which Activity they should play from hand. It is okay to discuss strategy and timing regarding feeding and tidying up.
- You can examine the collection discard pile at any time and communicate its contents to your partner.

## Scoring

The game ends in defeat if:

- You need to decrease Happiness when Happiness is zero. (Note: Not when happiness reaches zero. Happiness is essentially the number of mistakes / tidy up actions remaining you can have/use.)
- You forget to feed the Dragon in time.
- The main timer runs out.

The game ends in victory if you complete the required number of tasks before any of the loss conditions trigger.

You can then determine your score:

- Base score: Easy: 1, Medium: 3, Hard: 8
- For each remaining Happiness: +1
- For each remaining ten seconds on the main timer: +1

If you can score above 10, you’re really good, if you can score above 15 you’re amazing.

## Credits:

Game Design: Dávid Turczi and Wai-yee Phuah

With a little help from: Jonathan Gilmour and Adrian Schmidt

Special thanks for playtesting to: Nick Shaw, Neil HK, Anthony Howgego

Thanks to Richard Ham (rahdo) and Tom Heath (slickerdrips) for the review videos.
        `;
        return converter.makeHtml(rulesText);
    }
}
