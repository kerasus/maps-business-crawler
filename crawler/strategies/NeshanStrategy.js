const https = require("https");
const crypto = require("crypto");
const zlib = require("zlib");
const BaseCrawler = require("../core/BaseCrawler");

const CONCURRENCY = 4;
const MAX_RETRIES = 3;
const BASE_DELAY = 800;
const MAX_DELAY = 4000;

class NeshanStrategy extends BaseCrawler {
    constructor(options = {}) {
        super({ ...options, provider: "neshan" });

        this.agent = new https.Agent({ keepAlive: true });
        this.globalDelay = BASE_DELAY;
        this.seen = new Set();
        this.progress = null;
        this.uuid = `web_${crypto.randomUUID()}`;
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

    sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }

    recordCellResult({ status, newPlaces = 0, cell, retry = null }) {
        this.progress.processed++;

        const cellLabel = `${cell.center.lat},${cell.center.lng}`;

        if (status === "success") {
            this.progress.success++;
            this.progress.places += newPlaces;
            this.logProgress(`+${newPlaces} new @ ${cellLabel}`);
            return;
        }

        if (status === "empty") {
            this.progress.empty++;
            this.logProgress(`empty @ ${cellLabel}`);
            return;
        }

        if (status === "retry") {
            console.log(
                `🔁 retry ${retry}/${MAX_RETRIES} @ ${cellLabel}`
            );
            return;
        }

        this.progress.failed++;
        this.logProgress(`failed @ ${cellLabel}`);
    }

    buildGrid() {
        if (!this.bounds) {
            throw new Error("Neshan crawler requires geographic bounds");
        }

        const { minLng, minLat, maxLng, maxLat } = this.bounds;
        const step = this.step;
        const cells = [];

        const round = (v) => Number(v.toFixed(6));

        for (let lng = minLng; lng < maxLng; lng += step) {
            for (let lat = minLat; lat < maxLat; lat += step) {
                const center = {
                    lng: round(lng + step / 2),
                    lat: round(lat + step / 2),
                };

                const boundary = {
                    south_west: { x: round(lng), y: round(lat) },
                    south_east: { x: round(lng + step), y: round(lat) },
                    north_east: { x: round(lng + step), y: round(lat + step) },
                    north_west: { x: round(lng), y: round(lat + step) },
                };

                cells.push({
                    center,
                    boundary,
                });
            }
        }

        return cells;
    }

    buildBody(cell) {
        const payload = {
            uuid: this.uuid,
            term: this.keyword,
            zoom: 18,
            limit: 30,
            filters: {},
            night: false,
            location: null,
            center: {
                x: cell.center.lng,
                y: cell.center.lat,
            },
            boundary: cell.boundary,
        };

        return encodeURIComponent(JSON.stringify(payload));
    }

    async decodeResponse(buffer) {
        try {
            return zlib.brotliDecompressSync(buffer).toString();
        } catch {}

        try {
            return zlib.gunzipSync(buffer).toString();
        } catch {}

        return buffer.toString();
    }

    extractJson(text) {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");

        if (start === -1 || end === -1) return null;

        try {
            return JSON.parse(text.slice(start, end + 1));
        } catch {
            return null;
        }
    }

    async fetchCell(cell, retry = 0) {
        try {
            await this.sleep(this.globalDelay);

            const body = this.buildBody(cell);

            const url =
                `https://neshan.org/maps/pwa-api/neshan-search` +
                `?body=${body}&search-in-bound=false`;

            const res = await fetch(url, {
                agent: this.agent,
                headers: {
                    accept: "*/*",
                    referer: "https://neshan.org/",
                    "x-client-version": "2025",
                    uuid: this.uuid,
                    "user-agent":
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/142 Safari/537.36",
                },
            });

            if (!res.ok) throw new Error("Bad response");

            const buffer = Buffer.from(await res.arrayBuffer());
            const decoded = await this.decodeResponse(buffer);

            const json = this.extractJson(decoded);
            console.log('json ------> ', json)

            if (!json?.items?.length) {
                this.recordCellResult({ status: "empty", cell });
                return [];
            }

            const results = [];

            for (const item of json.items) {
                if (!item.id) continue;
                if (this.seen.has(item.id)) continue;

                this.seen.add(item.id);

                const loc = item.location || {};

                results.push(
                    this.createOutputItem({
                        id: item.id,
                        name: item.title,
                        address: item.subtitle,
                        phone: item.metaData?.phone || null,
                        lat: loc.y ?? null,
                        lng: loc.x ?? null,
                        url: `https://neshan.org/maps/place/${item.id}`,
                    })
                );
            }

            this.recordCellResult({
                status: "success",
                newPlaces: results.length,
                cell,
            });

            return results;
        } catch (error) {
            console.log('error ------> ', error)
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
            throw new Error("Neshan crawler requires a search keyword");
        }

        if (!this.bounds) {
            throw new Error("Neshan crawler requires geographic bounds");
        }

        const startedAt = Date.now();

        console.log(`Running Neshan crawler for "${this.keyword}"...`);

        const { minLng, minLat, maxLng, maxLat } = this.bounds;

        console.log(`🚀 Running Neshan crawler for "${this.keyword}"...`);
        console.log(
            `   bounds: ${minLng},${minLat} → ${maxLng},${maxLat} | step: ${this.step}`
        );

        const cells = this.buildGrid();

        this.progress = this.createProgress(cells.length);
        this.seen.clear();

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

        console.log("✅ Neshan crawl finished");
        console.log(
            `   cells: ${cells.length} processed (${success} ok, ${empty} empty, ${failed} failed)`
        );
        console.log(`   places: ${places} unique | duration: ${duration}`);

        this.exportItems(items);
        return items;
    }
}

module.exports = NeshanStrategy;
