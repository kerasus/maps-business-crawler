const https = require("https");
const BaseCrawler = require("../core/BaseCrawler");

const CONCURRENCY = 4;
const MAX_RETRIES = 3;
const BASE_DELAY = 800;
const MAX_DELAY = 4000;

const API_KEY =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImY0NGNlZWQ3MjNkZDNmZTE0ZDRlYzhlYjY0YjVmMjc2YjAwM2NlZmQ1OTFkMGNjNmEyOWVhMTI3Nzc3NWMwZDNiNDJkYTFlZmNmZDFlZWVlIn0";

class MapIrStrategy extends BaseCrawler {
    constructor(options = {}) {
        super({ ...options, provider: "mapir" });

        this.agent = new https.Agent({ keepAlive: true });
        this.globalDelay = BASE_DELAY;
        this.seen = new Set();
        this.progress = null;
    }

    supportsBounds() {
        return true;
    }

    createProgress(total) {
        return {
            total,
            processed: 0,
            success: 0,
            empty: 0,
            failed: 0,
            places: 0,
        };
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return minutes > 0
            ? `${minutes}m ${remainingSeconds}s`
            : `${seconds}s`;
    }

    logProgress(event = null) {
        const { processed, total, success, empty, failed, places } =
            this.progress;

        const percent = ((processed / total) * 100).toFixed(1);

        const summary =
            `📦 ${processed}/${total} (${percent}%)` +
            ` | 🏪 ${places} places` +
            ` | ✅ ${success} | 🟡 ${empty} | ❌ ${failed}`;

        if (event) {
            console.log(`${summary} | ${event}`);
            return;
        }

        console.log(summary);
    }

    recordCellResult({ status, newPlaces = 0, cell, retry = null }) {
        const label = `${cell.lat},${cell.lng}`;

        if (status === "retry") {
            console.log(`🔄 retry ${retry}/${MAX_RETRIES} @ ${label}`);
            return;
        }

        this.progress.processed++;

        if (status === "success") {
            this.progress.success++;
            this.progress.places += newPlaces;
            this.logProgress(`+${newPlaces} new @ ${label}`);
            return;
        }

        if (status === "empty") {
            this.progress.empty++;
            this.logProgress(`empty @ ${label}`);
            return;
        }

        if (status === "retry") {
            console.log(`🔁 retry ${retry}/${MAX_RETRIES} @ ${label}`);
            return;
        }

        this.progress.failed++;
        this.logProgress(`failed @ ${label}`);
    }

    sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }

    buildGrid() {
        const { minLng, minLat, maxLng, maxLat } = this.bounds;
        const step = this.step;

        const cells = [];
        const round = (v) => Number(v.toFixed(6));

        for (let lng = minLng; lng < maxLng; lng += step) {
            for (let lat = minLat; lat < maxLat; lat += step) {
                cells.push({
                    lat: round(lat + step / 2),
                    lng: round(lng + step / 2),
                });
            }
        }

        return cells;
    }

    async fetchCell(cell, retry = 0) {
        try {
            await this.sleep(this.globalDelay);

            const res = await fetch("https://map.ir/search", {
                method: "POST",
                agent: this.agent,
                headers: {
                    "content-type": "application/json; charset=UTF-8",
                    accept: "application/json",
                    origin: "https://map.ir",
                    referer: "https://map.ir/",
                    "x-api-key": API_KEY,
                    "x-requested-with": "XMLHttpRequest",
                    "user-agent":
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/148 Safari/537.36",
                },
                body: JSON.stringify({
                    text: this.keyword,
                    returnid: true,
                    location: {
                        type: "Point",
                        coordinates: [cell.lng, cell.lat],
                    },
                }),
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();

            if (!data?.value?.length) {
                this.recordCellResult({ status: "empty", cell });
                return [];
            }

            const results = [];

            for (const item of data.value) {
                if (!item.Id) continue;
                if (this.seen.has(item.Id)) continue;

                this.seen.add(item.Id);

                results.push(
                    this.createOutputItem({
                        id: item.Id,
                        name: item.Title,
                        address: item.Address,
                        phone: null,
                        lat: item.Coordinate?.lat ?? null,
                        lng: item.Coordinate?.lon ?? null,
                        url: `https://map.ir/lat/${item.Coordinate?.lat}/lng/${item.Coordinate?.lon}`,
                    })
                );
            }

            this.recordCellResult({
                status: "success",
                newPlaces: results.length,
                cell,
            });

            return results;
        } catch {
            if (retry < MAX_RETRIES) {
                this.recordCellResult({
                    status: "retry",
                    cell,
                    retry: retry + 1,
                });

                const backoff =
                    Math.min(BASE_DELAY * 2 ** retry, MAX_DELAY) +
                    Math.random() * 300;

                await this.sleep(backoff);

                return this.fetchCell(cell, retry + 1);
            }

            this.recordCellResult({ status: "failed", cell });
            return [];
        }
    }

    async runPool(tasks, limit) {
        const executing = new Set();

        for (const task of tasks) {
            const promise = task().finally(() => executing.delete(promise));
            executing.add(promise);

            if (executing.size >= limit) {
                await Promise.race(executing);
            }
        }

        await Promise.all(executing);
    }

    async crawl(options = {}) {
        this.configure(options);

        if (!this.keyword) {
            throw new Error("Map.ir crawler requires a search keyword");
        }

        if (!this.bounds) {
            throw new Error("Map.ir crawler requires geographic bounds");
        }

        const startedAt = Date.now();

        const { minLng, minLat, maxLng, maxLat } = this.bounds;

        console.log(`🚀 Running Map.ir crawler for "${this.keyword}"...`);
        console.log(
            `   bounds: ${minLng},${minLat} → ${maxLng},${maxLat} | step: ${this.step}`
        );

        const cells = this.buildGrid();

        this.progress = this.createProgress(cells.length);
        this.seen.clear();

        console.log(
            `🗺 Grid: ${cells.length} cells | concurrency: ${CONCURRENCY}`
        );

        const items = [];

        const tasks = cells.map((cell) => {
            return async () => {
                const results = await this.fetchCell(cell);
                items.push(...results);
            };
        });

        await this.runPool(tasks, CONCURRENCY);

        const duration = this.formatDuration(Date.now() - startedAt);
        const { success, empty, failed, places } = this.progress;

        console.log("✅ Map.ir crawl finished");
        console.log(
            `   cells: ${cells.length} processed (${success} ok, ${empty} empty, ${failed} failed)`
        );
        console.log(`   places: ${places} unique | duration: ${duration}`);

        this.exportItems(items);
        return items;
    }
}

module.exports = MapIrStrategy;
