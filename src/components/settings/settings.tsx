import { Component } from '@stencil/core';

@Component({
    tag: 'pd-settings',
    styleUrl: 'settings.scss',
    shadow: true,
})
export class Button {
    public render() {
        return <section>This is the settings page.</section>;
    }
}
