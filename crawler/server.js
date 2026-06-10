const http = require("http");
const CrawlerFactory = require("./core/CrawlerFactory");

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200);
        res.end(JSON.stringify({ status: "ok" }));
        return;
    }

    if (req.method === "POST" && req.url === "/crawl") {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", async () => {
            try {
                const payload = JSON.parse(body || "{}");
                const { strategy, keyword, bounds, step } = payload;

                if (!strategy) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: "strategy is required" }));
                    return;
                }

                const crawler = CrawlerFactory.create(strategy);
                await crawler.crawl({ keyword, bounds, step });

                res.writeHead(200);
                res.end(JSON.stringify({ status: "done", strategy }));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: error.message }));
            }
        });

        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Crawler service listening on port ${PORT}`);
});
