// check_website.js
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://pocket-dragon.github.io/');

    const isContentPresent = await page.evaluate(() => {
        const header = document.querySelector('header');
        return header && header.textContent.includes('Pocket Dragon');
    });

    await browser.close();

    if (!isContentPresent) {
        console.error('Expected content not found on the page.');
        process.exit(1);
    }

    console.log('Page loaded and expected content was found 👍');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
