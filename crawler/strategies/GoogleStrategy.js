const BaseCrawler = require("../core/BaseCrawler");

class GoogleStrategy extends BaseCrawler {

    async crawl(options) {
        console.log("🔵 Running Google crawler...");

        // 1️⃣ collect links
        // 2️⃣ crawl details
        // 3️⃣ return normalized result
    }
}

module.exports = GoogleStrategy;
