import { chromium } from 'playwright';

// The URL to smoke-test. Defaults to production so `up-check.yml` keeps working
// unchanged; the deploy orchestrator sets SMOKE_URL to the staging or production
// URL as it promotes a build.
const url = process.env.SMOKE_URL ?? 'https://pocket-dragon.github.io/';

const browser = await chromium.launch();
const page = await browser.newPage();

try {
    await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 60000,
    });

    const title = page.locator('.mdc-top-app-bar__title');
    // Generous timeout: a freshly deployed Pages build can take a few seconds to
    // propagate to the CDN edge the runner hits.
    await title.waitFor({ timeout: 15000 });

    const text = await title.textContent();
    if (!text?.includes('Pocket Dragon')) {
        throw new Error(`Expected content not found at ${url}.`);
    }

    console.log(`Page loaded and expected content was found at ${url} 👍`);
} catch (error) {
    console.error(error.message ?? error);
    process.exit(1);
} finally {
    await browser.close();
}
