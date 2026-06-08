const BaseCrawler = require("../core/BaseCrawler");

class NeshanStrategy extends BaseCrawler {
    constructor(options = {}) {
        super({ ...options, provider: "neshan" });
    }

    supportsBounds() {
        return true;
    }

    buildSearchUrl() {
        if (!this.keyword) {
            throw new Error("Neshan crawler requires a search keyword");
        }

        const encodedKeyword = encodeURIComponent(this.keyword);

        if (!this.bounds) {
            return `https://neshan.org/maps/search/${encodedKeyword}`;
        }

        const center = this.getBoundsCenter();
        const zoom = this.estimateZoomFromBounds();

        return (
            `https://neshan.org/maps/places#c${center.lat.toFixed(6)}` +
            `-${center.lng.toFixed(6)}-${zoom}z-0p/search/${encodedKeyword}`
        );
    }

    async crawl(options = {}) {
        this.configure(options);

        const searchUrl = this.buildSearchUrl();
        console.log(`🟡 Running Neshan crawler for "${this.keyword}"...`);
        console.log(`🔗 ${searchUrl}`);

        // TODO: implement browser/API crawl similar to GoogleStrategy
        console.log("⚠️ Neshan detail crawl is not implemented yet");

        const items = [];
        this.exportItems(items);
        return items;
    }
}

module.exports = NeshanStrategy;
