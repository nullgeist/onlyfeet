const puppeteer = require('puppeteer');
const { encryptSession } = require('./session');

module.exports = {
    checkProfile: async (username) => {
        const browser = await puppeteer.launch({
            executablePath: "/usr/bin/chromium-browser",
            headless: 'new',
            args: [
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--no-gpu',
                '--disable-default-apps',
                '--disable-translate',
                '--disable-device-discovery-notifications',
                '--disable-software-rasterizer',
                '--disable-xss-auditor'
            ],
            ignoreHTTPSErrors: true
        });
        try {
            const page = await browser.newPage();
            await page.setCookie({
                name: "flag",
                httpOnly: false,
                value: process.env.FLAG,
                url: 'http://localhost'
            }, {
                name: "session",
                httpOnly: false,
                value: encryptSession('administrator'),
                url: 'http://localhost'
            })
            await page.goto(`http://localhost:${process.env.PORT}/${username}`);
            await browser.close();
            return true;
        } catch (e) {
            await browser.close();
            return false;
        }
    }
}
