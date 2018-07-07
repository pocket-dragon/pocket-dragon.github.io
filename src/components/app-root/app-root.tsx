import { Component } from '@stencil/core';
import { topAppBar } from 'material-components-web';

@Component({
    tag: 'app-root',
    styleUrl: 'app-root.scss',
})
export class AppRoot {
    protected componentDidLoad() {
        const topAppBarElement = document.querySelector('.mdc-top-app-bar');
        new topAppBar.MDCTopAppBar(topAppBarElement); // tslint:disable-line:no-unused-expression
    }

    protected render() {
        return (
            <div>
                <header class="mdc-top-app-bar">
                    <div class="mdc-top-app-bar__row">
                        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
                            <span class="mdc-top-app-bar__title">
                                Pocket Dragon
                            </span>
                        </section>
                    </div>
                </header>

                <main>
                    <app-home />
                </main>
            </div>
        );
    }
}
