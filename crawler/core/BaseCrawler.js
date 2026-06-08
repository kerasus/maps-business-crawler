class BaseCrawler {
    async crawl(options) {
        throw new Error("crawl() must be implemented");
    }
}

module.exports = BaseCrawler;
