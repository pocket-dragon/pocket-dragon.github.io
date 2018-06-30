import { Component } from "@stencil/core";

@Component({
    styleUrl: "app-root.css",
    tag: "app-root",
})
export class AppRoot {
    public render() {
        return (
            <div>
                <header>
                    <h1>Stencil App Starter</h1>
                </header>

                <main>
                    <stencil-router>
                        <stencil-route-switch scrollTopOffset={0}>
                            <stencil-route
                                url="/"
                                component="app-home"
                                exact={true}
                            />
                            <stencil-route
                                url="/profile/:name"
                                component="app-profile"
                            />
                        </stencil-route-switch>
                    </stencil-router>
                </main>
            </div>
        );
    }
}
