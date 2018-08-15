import { Component, Element, Method, State } from '@stencil/core';
import { dialog } from 'material-components-web';
import * as showdown from 'showdown';
import * as Rules from './game-rules';

@Component({
    tag: 'app-rules',
    styleUrl: 'app-rules.scss',
})
export class AppHome {
    @Element() public htmlElement: HTMLElement;

    @State() private rulesDialog;
    @State() private pocketDragon = '';

    private promos = [
        {
            name: 'anachrony',
            displayName: 'Anachrony',
        },
        {
            name: 'trickerion',
            displayName: 'Trickerion',
        },
        {
            name: 'petrichor',
            displayName: 'Petrichor',
        },
        {
            name: 'daysOfIre',
            displayName: 'Days of Ire',
        },
        {
            name: 'nightsOfFire',
            displayName: 'Nights of Fire',
        },
        {
            name: 'redacted',
            displayName: '[redacted]',
        },
        {
            name: 'microfilms',
            displayName: '[microfilms]',
        },
        {
            name: 'diceSettlers',
            displayName: 'Dice Settlers',
        },
        {
            name: 'kitchenRush',
            displayName: 'Kitchen Rush',
        },
        {
            name: 'tashKalar',
            displayName: 'Tash-Kalar',
        },
    ];

    private converter = new showdown.default.Converter();

    @Method()
    public showRules() {
        this.rulesDialog.show();
    }

    public componentWillLoad() {
        this.pocketDragon = this.formatMarkdown(Rules.pocketDragon);
    }

    public componentDidLoad() {
        this.rulesDialog = new dialog.MDCDialog(
            this.htmlElement.querySelector('#rules-dialog')
        );
    }

    public componentDidUnload() {
        this.rulesDialog.destroy();
    }

    public getPromoRules(name) {
        return this.converter.makeHtml(Rules[name]);
    }

    public render() {
        return (
            <aside id="rules-dialog" class="mdc-dialog">
                <div class="mdc-dialog__surface">
                    <header class="mdc-dialog__header">
                        <h2 class="mdc-dialog__header__title">Game Rules</h2>
                    </header>
                    <section class="mdc-dialog__body">
                        <div class="dialog-body">
                            <span innerHTML={this.pocketDragon} />
                            {this.promos.map(promo => {
                                return (
                                    <app-collapsible-section class="clearfix">
                                        <h2 slot="header">
                                            Promo Rules: {promo.displayName}
                                        </h2>
                                        <div>
                                            <img
                                                src={`/assets/promo-${
                                                    promo.name
                                                }.jpg`}
                                                class="promo"
                                            />
                                            <span
                                                innerHTML={this.getPromoRules(
                                                    promo.name
                                                )}
                                            />
                                        </div>
                                    </app-collapsible-section>
                                );
                            })}
                        </div>
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

    private formatMarkdown(markdown) {
        return this.converter.makeHtml(markdown);
    }
}
