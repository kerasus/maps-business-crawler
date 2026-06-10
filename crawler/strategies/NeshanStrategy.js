const crypto = require("crypto");
const BaseCrawler = require("../core/BaseCrawler");

const CONCURRENCY = 4;
const MAX_RETRIES = 3;
const BASE_DELAY = 800;
const MAX_DELAY = 4000;

class NeshanStrategy extends BaseCrawler {
    constructor(options = {}) {
        super({ ...options, provider: "neshan" });

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
        const { processed, total, success, empty, failed, places } = this.progress;
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
            console.log(`🔁 retry ${retry}/${MAX_RETRIES} @ ${cellLabel}`);
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

                cells.push({ center, boundary });
            }
        }

        return cells;
    }

    buildBody(cell) {
        const payload = {
            boundary: cell.boundary,
            center: { x: cell.center.lng, y: cell.center.lat },
            filters: {},
            limit: 30,
            location: null,
            night: false,
            term: this.keyword,
            uuid: this.uuid,
            zoom: 13,
        };

        // استفاده از Buffer نیتیو Node.js به جای پیاده‌سازی دستی Base64
        const jsonString = encodeURIComponent(JSON.stringify(payload));
        return Buffer.from(jsonString, "utf-8").toString("base64");
    }

    async decodeResponse(response) {
        const responseText = await response.text();
        return this.parseSearchResults(responseText);
    }

    extractAndDecodePayload(rawResponse) {
        try {
            if (!rawResponse) return null;

            let payload = rawResponse.slice(28);
            payload = payload.slice(0, payload.length - 28);

            const lastAtIndex = payload.lastIndexOf("@");
            if (lastAtIndex === -1) return null;

            const shiftLengthStr = payload.slice(lastAtIndex + 1);
            payload = payload.slice(0, lastAtIndex);

            const shiftLength = parseInt(shiftLengthStr, 10);
            if (isNaN(shiftLength)) return null;

            const firstPart = payload.slice(0, shiftLength);
            const secondPart = payload.slice(shiftLength);

            const base64String = secondPart + firstPart;

            const decodedString = Buffer.from(base64String, "base64").toString("utf-8");
            return JSON.parse(decodedString);
        } catch (error) {
            console.error("Error extracting and decoding payload:", error);
            return null;
        }
    }

    parseSearchResults(rawResponse) {
        const DEFAULT_ICON_URL = "https://neshan.org/maps/87364178129920db7341.png";

        try {
            const decodedData = this.extractAndDecodePayload(rawResponse);

            if (!decodedData?.items?.length) {
                return [];
            }

            const iconBaseUrl = decodedData.iconBaseUrl || "";

            const enrichedItems = decodedData.items.map((item, index) => {
                if (item.iconUri) {
                    item.icon = new IconClass(item.iconUri, iconBaseUrl + item.iconUri).toJson();
                }

                if (item.balloonInfo) {
                    const balloonIconUri = item.balloonInfo.iconUri;
                    const fullIconUrl = balloonIconUri ? iconBaseUrl + balloonIconUri : DEFAULT_ICON_URL;

                    item.balloonInfo.icon = new IconClass(balloonIconUri, fullIconUrl).toJson();
                    item.mapIcon = new IconClass(balloonIconUri, fullIconUrl).toJson();
                }

                item.index = index;
                return item;
            });

            return enrichedItems;
        } catch (error) {
            console.error("Error parsing search results:", error);
            return [];
        }
    }

    async fetchCell(cell, retry = 0) {
        try {
            await this.sleep(this.globalDelay);
            const body = this.buildBody(cell);

            const url = `https://neshan.org/maps/pwa-api/neshan-search?body=${encodeURIComponent(body)}&search-in-bound=false`;

            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9,fa;q=0.8",
                    "content-type": "application/json",
                    "priority": "u=1, i",
                    "referer": "https://neshan.org/maps",
                    "sec-ch-ua": "\"Chromium\";v=\"148\", \"Google Chrome\";v=\"148\", \"Not/A)Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Linux\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
                    "x-client-version": "2025",
                    "uuid": this.uuid,
                },
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.log(`Server Error: ${res.status} - ${errorText.substring(0, 100)}`);
                throw new Error(`Bad response: ${res.status}`);
            }

            const decodedJson = await this.decodeResponse(res);

            if (!decodedJson?.length) {
                this.recordCellResult({ status: "empty", cell });
                return [];
            }

            const results = [];
            for (const item of decodedJson) {
                if (!item.id || this.seen.has(item.id)) continue;
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

            this.recordCellResult({ status: "success", newPlaces: results.length, cell });
            return results;

        } catch (error) {
            if (retry < MAX_RETRIES) {
                this.recordCellResult({ status: "retry", cell, retry: retry + 1 });
                const backoff = Math.min(BASE_DELAY * 2 ** retry, MAX_DELAY) + Math.random() * 300;
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

        if (!this.keyword) throw new Error("Neshan crawler requires a search keyword");
        if (!this.bounds) throw new Error("Neshan crawler requires geographic bounds");

        const startedAt = Date.now();
        const { minLng, minLat, maxLng, maxLat } = this.bounds;

        console.log(`🚀 Running Neshan crawler for "${this.keyword}"...`);
        console.log(`   bounds: ${minLng},${minLat} → ${maxLng},${maxLat} | step: ${this.step}`);

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
        console.log(`   cells: ${cells.length} processed (${success} ok, ${empty} empty, ${failed} failed)`);
        console.log(`   places: ${places} unique | duration: ${duration}`);

        this.exportItems(items);
        return items;
    }
}

class IconClass {
    #uri;
    #url;
    #width = 22;
    #height = 22;

    constructor(uri, url) {
        this.#uri = uri;
        this.#url = url;
    }

    get uri() { return this.#uri; }
    set uri(value) { this.#uri = value; }

    get url() { return this.#url; }
    set url(value) { this.#url = value; }

    get width() { return this.#width; }
    get height() { return this.#height; }

    toJson() {
        return {
            uri: this.uri,
            url: this.url,
            width: this.width,
            height: this.height
        };
    }
}

module.exports = NeshanStrategy;