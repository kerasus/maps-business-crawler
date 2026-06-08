const https = require("https");
const crypto = require("crypto");
const BaseCrawler = require("../core/BaseCrawler");

const CONCURRENCY = 4;
const MAX_RETRIES = 3;
const BASE_DELAY = 800;
const MAX_DELAY = 4000;

class BaladStrategy extends BaseCrawler {
    constructor(options = {}) {
        super({ ...options, provider: "balad" });
        this.agent = new https.Agent({ keepAlive: true });
        this.globalDelay = BASE_DELAY;
        this.seen = new Set();
        this.progress = null;
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

        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }

        return `${seconds}s`;
    }

    logProgress(event = null) {
        const { processed, total, success, empty, failed, places } = this.progress;
        const percent = ((processed / total) * 100).toFixed(1);
        const summary =
            `📊 ${processed}/${total} (${percent}%)` +
            ` | 🏪 ${places} places` +
            ` | ✅ ${success} | ⬜ ${empty} | ❌ ${failed}`;

        if (event) {
            console.log(`${summary} | ${event}`);
            return;
        }

        console.log(summary);
    }

    recordCellResult({ status, newPlaces = 0, cell, retry = null }) {
        this.progress.processed++;

        if (status === "success") {
            this.progress.success++;
            this.progress.places += newPlaces;
            this.logProgress(`+${newPlaces} new — ${cell.polygon}`);
            return;
        }

        if (status === "empty") {
            this.progress.empty++;
            this.logProgress(`empty — ${cell.polygon}`);
            return;
        }

        if (status === "retry") {
            console.log(
                `⚠️ retry ${retry}/${MAX_RETRIES} — ${cell.polygon}`
            );
            return;
        }

        this.progress.failed++;
        this.logProgress(`failed — ${cell.polygon}`);
    }

    supportsBounds() {
        return true;
    }

    buildGrid() {
        if (!this.bounds) {
            throw new Error("Balad crawler requires geographic bounds");
        }

        const { minLng, minLat, maxLng, maxLat } = this.bounds;
        const step = this.step;
        const cells = [];
        const round = (v) => Number(v.toFixed(6));

        for (let lng = minLng; lng < maxLng; lng += step) {
            for (let lat = minLat; lat < maxLat; lat += step) {
                const polygon =
                    `${round(lng)},${round(lat)}|` +
                    `${round(lng + step)},${round(lat)}|` +
                    `${round(lng + step)},${round(lat + step)}|` +
                    `${round(lng)},${round(lat + step)}|` +
                    `${round(lng)},${round(lat)}`;

                const cameraLng = round(lng + step / 2);
                const cameraLat = round(lat + step / 2);

                const url =
                    `https://search.raah.ir/v6/?text=${encodeURIComponent(this.keyword)}` +
                    `&polygon=${encodeURIComponent(polygon)}` +
                    `&zoom=14` +
                    `&camera=${cameraLng},${cameraLat}`;

                cells.push({ polygon, url });
            }
        }

        return cells;
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async fetchCell(cell, sessions, retry = 0) {
        try {
            await this.sleep(this.globalDelay);

            const res = await fetch(cell.url, {
                agent: this.agent,
                signal: AbortSignal.timeout(10000),
                headers: {
                    accept: "application/json, text/plain, */*",
                    origin: "https://balad.ir",
                    referer: "https://balad.ir/",
                    platform: "web",
                    "device-id": sessions.deviceId,
                    "app-session": sessions.appSession,
                    "search-session": sessions.searchSession,
                    "user-agent":
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/142 Safari/537.36",
                },
            });

            if (!res.ok) {
                throw new Error("Bad response");
            }

            const data = await res.json();
            const results = [];

            if (!data?.results?.length) {
                this.recordCellResult({ status: "empty", cell });
                return results;
            }

            this.globalDelay = BASE_DELAY;

            for (const item of data.results) {
                if (item.type !== "poi") continue;
                if (this.seen.has(item.id)) continue;

                this.seen.add(item.id);

                const coords =
                    item.geometry?.coordinates?.[0] || item.center_point;

                results.push(
                    this.createOutputItem({
                        id: item.id,
                        name: item.maintext,
                        address: item.subtext1,
                        phone: item.phone || null,
                        lat: coords?.[1] ?? null,
                        lng: coords?.[0] ?? null,
                        url: `https://balad.ir/p/${item.id}`,
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
                return this.fetchCell(cell, sessions, retry + 1);
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
            throw new Error("Balad crawler requires a search keyword");
        }

        if (!this.bounds) {
            throw new Error("Balad crawler requires geographic bounds");
        }

        const { minLng, minLat, maxLng, maxLat } = this.bounds;
        const startedAt = Date.now();

        console.log(`🟢 Running Balad crawler for "${this.keyword}"...`);
        console.log(
            `   bounds: ${minLng},${minLat} → ${maxLng},${maxLat} | step: ${this.step}`
        );

        const cells = this.buildGrid();
        const sessions = {
            deviceId: crypto.randomUUID(),
            appSession: crypto.randomUUID(),
            searchSession: crypto.randomUUID(),
        };

        this.progress = this.createProgress(cells.length);
        this.seen.clear();

        console.log(
            `🗺 Grid: ${cells.length} cells | concurrency: ${CONCURRENCY}`
        );

        const items = [];

        const tasks = cells.map((cell) => {
            return async () => {
                const cellResults = await this.fetchCell(cell, sessions);
                items.push(...cellResults);
            };
        });

        await this.runPool(tasks, CONCURRENCY);

        const duration = this.formatDuration(Date.now() - startedAt);
        const { success, empty, failed, places } = this.progress;

        console.log("✅ Balad crawl finished");
        console.log(
            `   cells: ${cells.length} processed (${success} ok, ${empty} empty, ${failed} failed)`
        );
        console.log(`   places: ${places} unique | duration: ${duration}`);

        this.exportItems(items);
        return items;
    }
}

module.exports = BaladStrategy;
