const BaladStrategy = require("../strategies/BaladStrategy");
const GoogleStrategy = require("../strategies/GoogleStrategy");
const NeshanStrategy = require("../strategies/NeshanStrategy");

class CrawlerFactory {

    static create(provider) {

        switch (provider) {

            case "balad":
                return new BaladStrategy({ provider: "balad" });

            case "google":
                return new GoogleStrategy({ provider: "google" });

            case "neshan":
                return new NeshanStrategy({ provider: "neshan" });

            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }
}

module.exports = CrawlerFactory;
