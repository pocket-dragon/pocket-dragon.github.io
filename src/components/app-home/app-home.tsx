import { Component } from "@stencil/core";

@Component({
    styleUrl: "app-home.css",
    tag: "app-home",
})
export class AppHome {
    public render() {
        return (
            <div class="app-home">
                <p>
                    Welcome to the Stencil App Starter. You can use this starter
                    to build entire apps all with web components using Stencil!
                    Check out our docs on{" "}
                    <a href="https://stenciljs.com">stenciljs.com</a> to get
                    started.
                </p>

                <stencil-route-link url="/profile/stencil">
                    <button>Profile page</button>
                </stencil-route-link>
            </div>
        );
    }
}
