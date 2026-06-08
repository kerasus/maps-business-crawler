const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const BaseCrawler = require("../core/BaseCrawler");
const resolveBrowserPath = require("../../utils/browser");
const config = require("../../config");

const WORKERS = 4;
const SPLIT_THRESHOLD = 80;
const MAX_DEPTH = 2;

class GoogleStrategy extends BaseCrawler {
    constructor(options = {}) {
        super({ ...options, provider: "google" });

        this.seen = new Set();
        this.stream = null;

        this.stats = {
            startedAt: null,
            cellsProcessed: 0,
            splits: 0,
            places: 0,
            duplicates: 0,
            errors: 0,
        };
    }

    log(workerId, message) {
        const now = new Date().toISOString();
        console.log(`[${now}][W${workerId}] ${message}`);
    }

    supportsBounds() {
        return true;
    }

    initStream() {
        const exportPath = this.getExportPath();
        fs.mkdirSync(path.dirname(exportPath), { recursive: true });

        this.stream = fs.createWriteStream(exportPath, {
            flags: "w",
            encoding: "utf8",
        });

        return exportPath;
    }

    writeItem(item) {
        this.stream.write(JSON.stringify(item) + "\n");
    }

    buildGrid(bounds = this.bounds, depth = 0) {
        if (!bounds) return [null];

        const { minLng, minLat, maxLng, maxLat } = bounds;
        const step = this.step;
        const cells = [];

        for (let lng = minLng; lng < maxLng; lng += step) {
            for (let lat = minLat; lat < maxLat; lat += step) {
                cells.push({
                    bounds: {
                        minLng: lng,
                        minLat: lat,
                        maxLng: lng + step,
                        maxLat: lat + step,
                    },
                    depth,
                });
            }
        }

        return cells;
    }

    buildSearchUrl(cell) {
        const encoded = encodeURIComponent(this.keyword);

        if (!cell) {
            return `https://www.google.com/maps/search/${encoded}`;
        }

        const centerLat =
            (cell.bounds.minLat + cell.bounds.maxLat) / 2;
        const centerLng =
            (cell.bounds.minLng + cell.bounds.maxLng) / 2;

        return `https://www.google.com/maps/search/${encoded}/@${centerLat},${centerLng},16z`;
    }

    async autoScroll(page) {
        const feed = await page.$("div[role='feed']");
        if (!feed) return 0;

        let prev = 0;
        let stable = 0;

        while (stable < 3) {
            await feed.evaluate(el => el.scrollBy(0, 3000));
            await page.waitForTimeout(1200);

            const count = await page.$$eval(
                "div[role='article']",
                els => els.length
            );

            if (count === prev) stable++;
            else stable = 0;

            prev = count;

            if (count > 150) break;
        }

        return prev;
    }

    async extractFromSidebar(page) {
        await page.waitForSelector("h1.DUwDvf", {
            timeout: 8000
        });

        return page.evaluate(() => {

            const text = (el) =>
                el?.textContent?.replace(/\s+/g, " ").trim() || null;

            const name =
                text(document.querySelector("h1.DUwDvf")) ||
                text(document.querySelector("div[role='main'] h1"));

            const address = text(
                document.querySelector("button[data-item-id='address']")
            );

            const phone = text(
                document.querySelector("button[data-item-id^='phone']")
            );

            return { name, address, phone };
        });
    }

    async crawlCell(context, cell, workerId) {
        const started = Date.now();
        const page = await context.newPage();
        const url = this.buildSearchUrl(cell);

        this.log(workerId, `Visiting cell depth=${cell.depth}`);

        try {
            await page.goto(url, { timeout: 60000 });
            await page.waitForSelector("div[role='feed']", { timeout: 20000 });

            // ✅ scroll first (virtual list fix)
            await this.autoScroll(page);

            const cards = await page.$$("div[role='article']");
            this.log(workerId, `Processing ${cards.length} cards`);

            for (const card of cards) {

                const preId =
                    (await card.getAttribute("data-result-id")) ||
                    (await card.getAttribute("aria-label")) ||
                    (await card.evaluate(el => el.innerText.trim()));

                if (!preId) continue;

                if (this.seen.has(preId)) {
                    this.stats.duplicates++;
                    continue;
                }

                const link = await card.$("a");
                if (!link) continue;

                await link.click();

                // ✅ wait for real sidebar (not generic h1)
                // await page.waitForSelector("div[role='main'] h1", {
                //     timeout: 8000,
                // });
                await page.waitForSelector("h1.DUwDvf", {
                    timeout: 8000,
                });

                const fullUrl = page.url();

                // ✅ skip search pages
                if (!fullUrl.includes("/maps/place/")) {
                    await page.keyboard.press("Escape");
                    await page.waitForSelector("div[role='feed']");
                    continue;
                }

                const pid =
                    fullUrl.match(/!1s([^!]+)/)?.[1] ||
                    fullUrl;

                if (this.seen.has(pid)) {
                    this.stats.duplicates++;
                    await page.keyboard.press("Escape");
                    await page.waitForSelector("div[role='feed']");
                    continue;
                }

                this.seen.add(pid);
                this.seen.add(preId);

                const details = await this.extractFromSidebar(page);

                const latlng = fullUrl.match(/@([-0-9.]+),([-0-9.]+)/);
                const lat = latlng ? parseFloat(latlng[1]) : null;
                const lng = latlng ? parseFloat(latlng[2]) : null;

                const item = this.createOutputItem({
                    id: pid,
                    name: details.name,
                    address: details.address,
                    phone: details.phone,
                    lat,
                    lng,
                    url: fullUrl,
                });

                this.writeItem(item);
                this.stats.places++;

                this.log(workerId, `Saved: ${details.name}`);

                await page.keyboard.press("Escape");
                await page.waitForSelector("div[role='feed']", {
                    timeout: 5000,
                });
            }

            const duration =
                ((Date.now() - started) / 1000).toFixed(2);

            this.log(workerId, `Cell done in ${duration}s`);

            await page.close();
            return [];

        } catch (err) {
            this.stats.errors++;
            this.log(workerId, `Error: ${err.message}`);
            await page.close();
            return [];
        }
    }

    async runWorkerQueue(context, cells) {
        const queue = [...cells];

        const worker = async (workerId) => {
            while (queue.length) {
                const cell = queue.shift();
                if (!cell) break;

                const newCells = await this.crawlCell(
                    context,
                    cell,
                    workerId
                );

                if (newCells.length) {
                    queue.push(...newCells);
                }
            }

            this.log(workerId, "Worker finished");
        };

        await Promise.all(
            Array.from({ length: WORKERS }, (_, i) =>
                worker(i + 1)
            )
        );
    }

    async crawl(options = {}) {
        this.configure(options);
        this.stats.startedAt = Date.now();

        const exportPath = this.initStream();

        const browser = await chromium.launch({
            headless: config.HEADLESS,
            executablePath: resolveBrowserPath(),
        });

        const context = await browser.newContext({
            locale: "fa-IR",
            timezoneId: "Asia/Tehran",
        });

        const cells = this.buildGrid();

        console.log("========================================");
        console.log("Google PRO Grid Crawl Started");
        console.log(`Keyword: ${this.keyword}`);
        console.log(`Cells: ${cells.length}`);
        console.log(`Workers: ${WORKERS}`);
        console.log("========================================");

        try {
            await this.runWorkerQueue(context, cells);

            const duration =
                ((Date.now() - this.stats.startedAt) / 1000).toFixed(2);

            console.log("========================================");
            console.log("Crawl Finished");
            console.log(`Duration: ${duration}s`);
            console.log(`Places: ${this.stats.places}`);
            console.log(`Duplicates: ${this.stats.duplicates}`);
            console.log(`Errors: ${this.stats.errors}`);
            console.log(`Export: ${exportPath}`);
            console.log("========================================");

        } finally {
            await browser.close();
            this.stream.end();
        }
    }
}

module.exports = GoogleStrategy;
