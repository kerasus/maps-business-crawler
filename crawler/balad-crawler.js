import fs from "fs";
import https from "https";
import crypto from "crypto";

const CONCURRENCY = 4;
const MAX_RETRIES = 3;

const BASE_DELAY = 800;
const MAX_DELAY = 4000;

let globalDelay = BASE_DELAY;

const agent = new https.Agent({ keepAlive: true });

const seen = new Set();

let processed = 0;
let success = 0;
let failed = 0;

const stream = fs.createWriteStream("balad-data.ndjson", { flags: "a" });

const DEVICE_ID = crypto.randomUUID();
const APP_SESSION = crypto.randomUUID();
const SEARCH_SESSION = crypto.randomUUID();

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function write(item) {
    stream.write(JSON.stringify(item) + "\n");
}

function logProgress(total) {
    const percent = ((processed / total) * 100).toFixed(1);
    console.log(
        `📊 ${processed}/${total} (${percent}%) | ✅ ${success} | ❌ ${failed}`
    );
}

function buildGrid(minLng, minLat, maxLng, maxLat, step) {
    const cells = [];
    const round = v => Number(v.toFixed(6));

    for (let lng = minLng; lng < maxLng; lng += step) {
        for (let lat = minLat; lat < maxLat; lat += step) {

            const polygon =
                `${round(lng)},${round(lat)}|${round(lng + step)},${round(lat)}|${round(lng + step)},${round(lat + step)}|${round(lng)},${round(lat + step)}|${round(lng)},${round(lat)}`;

            const cameraLng = round(lng + step / 2);
            const cameraLat = round(lat + step / 2);

            const url =
                `https://search.raah.ir/v6/?text=پروتئین` +
                `&polygon=${encodeURIComponent(polygon)}` +
                `&zoom=14` +
                `&camera=${cameraLng},${cameraLat}`;

            cells.push({ polygon, url });
        }
    }

    return cells;
}

async function fetchCell(cell, total, retry = 0) {

    try {

        console.log(`🔎 ${cell.polygon}`);

        await sleep(globalDelay);

        const res = await fetch(cell.url, {
            agent,
            signal: AbortSignal.timeout(10000),
            headers: {
                "accept": "application/json, text/plain, */*",
                "origin": "https://balad.ir",
                "referer": "https://balad.ir/",
                "platform": "web",
                "device-id": DEVICE_ID,
                "app-session": APP_SESSION,
                "search-session": SEARCH_SESSION,
                "user-agent":
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/142 Safari/537.36"
            }
        });

        if (!res.ok) throw new Error("Bad response");

        const data = await res.json();

        if (!data?.results?.length) {
            processed++;
            logProgress(total);
            return;
        }

        globalDelay = BASE_DELAY;

        for (const item of data.results) {

            if (item.type !== "poi") continue;
            if (seen.has(item.id)) continue;

            seen.add(item.id);

            const coords =
                item.geometry?.coordinates?.[0] || item.center_point;

            write({
                id: item.id,
                name: item.maintext,
                address: item.subtext1,
                phone: item.phone || null,
                lat: coords?.[1],
                lng: coords?.[0]
            });
        }

        success++;
        processed++;
        logProgress(total);

    } catch (err) {

        if (retry < MAX_RETRIES) {

            const backoff =
                Math.min(BASE_DELAY * 2 ** retry, MAX_DELAY) +
                Math.random() * 300;

            await sleep(backoff);

            return fetchCell(cell, total, retry + 1);
        }

        failed++;
        processed++;
        logProgress(total);
    }
}

async function runPool(tasks, limit) {
    const executing = new Set();

    for (const task of tasks) {
        const p = task().finally(() => executing.delete(p));
        executing.add(p);

        if (executing.size >= limit) {
            await Promise.race(executing);
        }
    }

    await Promise.all(executing);
}

async function startCrawler() {

    console.log("🚀 Starting real Balad crawler...");

    const cells = buildGrid(
        51.1,
        35.55,
        51.65,
        35.8,
        0.05
    );

    console.log(`🗺 Grid cells: ${cells.length}`);

    const tasks = cells.map(cell => {
        return () => fetchCell(cell, cells.length);
    });

    await runPool(tasks, CONCURRENCY);

    stream.end();
    console.log("✅ Crawl finished");
}

startCrawler();
