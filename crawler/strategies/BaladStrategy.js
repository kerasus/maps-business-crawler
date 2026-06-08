const BaseCrawler = require("../core/BaseCrawler");

class BaladStrategy extends BaseCrawler {

    async crawl(options) {
        console.log("🟢 Running Balad crawler...");

        // اینجا همون startCrawler رو میاری
        // ولی داخل متد crawl

        // options مثلاً:
        // { keyword, bounds, step }

        // اجرای grid + fetchCell
        // در نهایت خروجی return کن یا فایل ذخیره کن
    }
}

module.exports = BaladStrategy;
