const fs = require("fs");
const os = require("os");

function resolveBrowserPath() {
    const platform = os.platform();

    const paths = {
        linux: [
            "/usr/bin/google-chrome",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser"
        ],
        win32: [
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
        ],
        darwin: [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        ]
    };

    const candidates = paths[platform] || [];

    for (const p of candidates) {
        if (fs.existsSync(p)) {
            console.log(`Using browser: ${p}`);
            return p;
        }
    }

    throw new Error("No Chrome/Chromium browser found on system.");
}

module.exports = resolveBrowserPath;
