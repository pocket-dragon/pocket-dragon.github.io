import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

try {
    await page.goto('https://pocket-dragon.github.io/', {
        waitUntil: 'networkidle',
        timeout: 60000,
    });

    const title = page.locator('.mdc-top-app-bar__title');
    await title.waitFor({ timeout: 5000 });

    const text = await title.textContent();
    if (!text?.includes('Pocket Dragon')) {
        throw new Error('Expected content not found on the page.');
    }

    console.log('Page loaded and expected content was found 👍');
} catch (error) {
    console.error(error.message ?? error);
    process.exit(1);
} finally {
    await browser.close();
}
