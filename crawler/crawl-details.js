const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const config = require("../config");
const resolveBrowserPath = require("../utils/browser");

const INPUT_FILE = path.join(__dirname, "../data/places.json");
const OUTPUT_FILE = path.join(__dirname, "../data/places-details.json");

function ensureJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]", "utf8");
        return [];
    }

    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) {
        fs.writeFileSync(filePath, "[]", "utf8");
        return [];
    }

    return JSON.parse(raw);
}

function extractLatLng(url) {
    const match = url.match(/!3d([-0-9.]+)!4d([-0-9.]+)/);
    if (!match) return { lat: null, lng: null };

    return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2]),
    };
}

async function extractPlaceData(page, url) {
    await page.goto(url, { timeout: 60000 });
    await page.waitForSelector("h1", { timeout: 10000 });

    return await page.evaluate(() => {
        const getText = (selector) => {
            const el = document.querySelector(selector);
            return el ? el.textContent.trim() : null;
        };

        const name = getText("h1");
        const address = getText("button[data-item-id=\"address\"]");
        const phone = getText("button[data-item-id^=\"phone\"]");

        return { name, address, phone };
    });
}

(async () => {
    const links = ensureJsonFile(INPUT_FILE);
    const targets = links.slice(0, config.MAX_PLACES);

    const browser = await chromium.launch({
        headless: config.HEADLESS,
        // executablePath: config.CHROMIUM_PATH,
        executablePath: resolveBrowserPath(),
    });

    const context = await browser.newContext({
        locale: "fa-IR",
        timezoneId: "Asia/Tehran",
    });

    const page = await context.newPage();

    const stream = fs.createWriteStream(OUTPUT_FILE);
    stream.write("[\n");

    for (let i = 0; i < targets.length; i++) {
        const url = targets[i];

        console.log(`Crawling ${i + 1}/${targets.length}`);

        try {
            const details = await extractPlaceData(page, url);
            const { lat, lng } = extractLatLng(url);

            const record = { url, lat, lng, ...details };

            if (i > 0) stream.write(",\n");
            stream.write(JSON.stringify(record, null, 2));

            await page.waitForTimeout(config.DELAY);
        } catch (err) {
            console.log("Error:", err.message);
        }
    }

    stream.write("\n]");
    stream.end();

    await browser.close();

    console.log("Detail crawling finished.");
})();
