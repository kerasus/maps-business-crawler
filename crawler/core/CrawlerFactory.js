const BaladStrategy = require("../strategies/BaladStrategy");
const GoogleStrategy = require("../strategies/GoogleStrategy");
const NeshanStrategy = require("../strategies/NeshanStrategy");

class CrawlerFactory {

    static create(provider) {

        switch (provider) {

            case "balad":
                return new BaladStrategy();

            case "google":
                return new GoogleStrategy();

            case "neshan":
                return new NeshanStrategy();

            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }
}

module.exports = CrawlerFactory;
