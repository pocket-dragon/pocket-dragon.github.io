import { Component, State } from '@stencil/core';

@Component({
    tag: 'app-collapsible-section',
    styleUrl: 'app-collapsible-section.scss',
    shadow: true,
})
export class AppHome {
    @State() private expanded = false;

    public render() {
        return (
            <section
                class={`
                    ${this.expanded ? 'expanded' : 'collapsed'}
                `}
            >
                <header
                    onClick={() => {
                        this.expanded = !this.expanded;
                    }}
                >
                    <slot name="header" />
                </header>
                <div class="body">
                    <slot />
                </div>
            </section>
        );
    }
}
