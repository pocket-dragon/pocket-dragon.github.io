import { Build, Component, Element, h, Prop, State } from '@stencil/core';
import { ripple } from 'material-components-web';

@Component({
    tag: 'pd-button',
    styleUrl: 'button.scss',
    shadow: true,
})
export class Button {
    @Prop({ reflectToAttr: true })
    public label: string;

    @Prop({ reflectToAttr: true })
    public disabled = false;

    @Prop({ reflectToAttr: true })
    public selected = false;

    @Prop({ reflectToAttr: true })
    public primary = false;

    @Prop({ reflectToAttr: true })
    public color: string;

    @Element() private button: HTMLElement;

    @State() private mdcRipple;

    public componentDidLoad() {
        if (Build.isBrowser) {
            const element = this.button.shadowRoot.querySelector('button');
            this.mdcRipple = new ripple.MDCRipple(element);
        }
    }

    public componentDidUnload() {
        this.mdcRipple.destroy();
    }

    public render() {
        return (
            <button
                class={`mdc-button
                    ${this.primary ? 'mdc-button--raised' : ''}
                    ${this.selected ? 'mdc-button--outlined' : ''}
                    ${this.color || ''}
                `}
                disabled={this.disabled}
            >
                <span class="label">{this.label}</span>
                <span class="background">
                    <svg viewBox="0 0 46.4 45.9" preserveAspectRatio="none">
                        <defs>
                            <filter id="shadow">
                                <feDropShadow
                                    dx="0"
                                    dy="3"
                                    stdDeviation=".5"
                                    flood-color="#000000"
                                    flood-opacity="0.2"
                                />
                                <feDropShadow
                                    dx="0"
                                    dy="2"
                                    stdDeviation="1"
                                    flood-color="#000000"
                                    flood-opacity="0.14"
                                />
                                <feDropShadow
                                    dx="0"
                                    dy="1"
                                    stdDeviation="1.5"
                                    flood-color="#000000"
                                    flood-opacity="0.12"
                                />
                            </filter>
                        </defs>
                        <path
                            id="color-badge"
                            d="m44.4,43.3c-3.4,3.7 -36.9,3 -40.8,0.3s-5.4,-37.6 -0.3,-40.8s38.5,-4.2 40.8,-0.3s3.6,37.1 0.3,40.8z"
                        />
                    </svg>
                </span>
            </button>
        );
    }
}
