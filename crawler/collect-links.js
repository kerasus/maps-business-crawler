// google maps links collector
const { chromium } = require("playwright");
const resolveBrowserPath = require("./utils/browser");
const fs = require("fs");
const path = require("path");
const config = require("./config");

const DATA_DIR = path.join(__dirname, "data");
const OUTPUT_FILE = path.join(DATA_DIR, "places.json");

async function autoScroll(page) {
    const scrollContainer = await page.$("div[role=\"feed\"]");

    for (let i = 0; i < 10; i++) {
        await scrollContainer.evaluate((el) => {
            el.scrollBy(0, 1000);
        });
        await page.waitForTimeout(1500);
    }
}

(async () => {
    const browser = await chromium.launch({
        headless: config.HEADLESS,
        // executablePath: config.CHROMIUM_PATH,
        executablePath: resolveBrowserPath(),
        args: ["--disable-blink-features=AutomationControlled"],
    });

    const context = await browser.newContext({
        locale: "fa-IR",
        timezoneId: "Asia/Tehran",
    });

    const page = await context.newPage();

    console.log("Opening search page...");
    await page.goto(config.SEARCH_URL, { timeout: 60000 });

    await page.waitForSelector("div[role=\"feed\"]");

    await autoScroll(page);

    const links = await page.evaluate(() => {
        const anchors = document.querySelectorAll(
            "a[href^=\"https://www.google.com/maps/place\"]"
        );

        return Array.from(anchors).map((a) => a.href);
    });

    const uniqueLinks = [...new Set(links)];

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueLinks, null, 2));

    console.log(`Saved ${uniqueLinks.length} links.`);
    await browser.close();
})();
