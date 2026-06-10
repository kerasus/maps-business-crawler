const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");

class BaseCrawler {
    constructor(options = {}) {
        this.provider = options.provider ?? null;
        this.keyword = options.keyword ?? "";
        this.bounds = null;
        this.step = options.step ?? 0.05;

        if (options.bounds) {
            this.setBounds(options.bounds);
        }
    }

    configure(options = {}) {
        if (options.keyword !== undefined) {
            this.setKeyword(options.keyword);
        }
        if (options.bounds !== undefined) {
            this.setBounds(options.bounds);
        }
        if (options.step !== undefined) {
            this.step = options.step;
        }
        return this;
    }

    setKeyword(keyword) {
        this.keyword = keyword;
        return this;
    }

    setBounds(bounds) {
        if (bounds === null) {
            this.bounds = null;
            return this;
        }

        if (!BaseCrawler.isValidBounds(bounds)) {
            throw new Error(
                "Invalid bounds. Expected { minLng, minLat, maxLng, maxLat }"
            );
        }

        this.bounds = { ...bounds };
        return this;
    }

    static isValidBounds(bounds) {
        const { minLng, minLat, maxLng, maxLat } = bounds ?? {};
        const values = [minLng, minLat, maxLng, maxLat];

        if (!values.every((v) => typeof v === "number" && !Number.isNaN(v))) {
            return false;
        }

        return minLng < maxLng && minLat < maxLat;
    }

    static getDataDir() {
        return DATA_DIR;
    }

    getExportPath() {
        if (!this.provider) {
            throw new Error("Provider is required for export");
        }

        return path.join(DATA_DIR, `${this.provider}-places.ndjson`);
    }

    getBoundsCenter() {
        if (!this.bounds) {
            return null;
        }

        const { minLng, minLat, maxLng, maxLat } = this.bounds;

        return {
            lat: (minLat + maxLat) / 2,
            lng: (minLng + maxLng) / 2,
        };
    }

    estimateZoomFromBounds() {
        if (!this.bounds) {
            return 14;
        }

        const { minLng, minLat, maxLng, maxLat } = this.bounds;
        const span = Math.max(maxLat - minLat, maxLng - minLng);

        if (span > 2) return 8;
        if (span > 1) return 9;
        if (span > 0.5) return 10;
        if (span > 0.2) return 11;
        if (span > 0.1) return 12;
        if (span > 0.05) return 13;
        return 14;
    }

    supportsBounds() {
        return false;
    }

    createOutputItem({
        id = null,
        name = null,
        address = null,
        phone = null,
        lat = null,
        lng = null,
        url = null,
    } = {}) {
        return {
            provider: this.provider,
            id,
            name,
            address,
            phone,
            lat,
            lng,
            url,
        };
    }

    exportItems(items) {
        const exportPath = this.getExportPath();

        fs.mkdirSync(path.dirname(exportPath), { recursive: true });

        const content = items
            .map((item) => JSON.stringify(item))
            .join("\n");

        fs.writeFileSync(
            exportPath,
            content.length ? `${content}\n` : "",
            "utf8"
        );

        console.log(`💾 Exported ${items.length} items → ${exportPath}`);
        return exportPath;
    }

    async crawl(options = {}) {
        this.configure(options);
        throw new Error("crawl() must be implemented");
    }
}

module.exports = BaseCrawler;
