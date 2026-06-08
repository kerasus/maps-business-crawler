const CrawlerFactory = require("./core/CrawlerFactory");

async function run() {

    // const provider = process.argv[2];
    // // node index.js google
    //
    // if (!provider) {
    //     console.log("Please provide provider: google | balad | neshan");
    //     process.exit(1);
    // }

    // const crawler = CrawlerFactory.create('google');
    // const crawler = CrawlerFactory.create('balad');
    // const crawler = CrawlerFactory.create('neshan');
    const crawler = CrawlerFactory.create('mapir');

    await crawler.crawl({
        keyword: "پروتئین",
        bounds: {
            minLng: 51.1,
            minLat: 35.55,
            maxLng: 51.65,
            maxLat: 35.8,
        },
        step: 0.05,
    });
}

run();
